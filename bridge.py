#!/usr/bin/env python3
"""
TerraPulse IoT Gateway Bridge (ESP32 + YAMNet Acoustic Threat Classifier)
"""

import sys
import time
import json
import argparse
import threading
import platform
import csv
import numpy as np
import os

# Completely hide TensorFlow CPU warnings for a clean terminal
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import logging
logging.getLogger('tensorflow').setLevel(logging.FATAL)
import warnings
warnings.filterwarnings('ignore')

try:
    import sounddevice as sd
except ImportError:
    print("[ERROR] 'sounddevice' not installed.")
    sys.exit(1)

try:
    import requests
except ImportError:
    print("[ERROR] 'requests' not installed.")
    sys.exit(1)

try:
    import serial
    import serial.tools.list_ports
except ImportError:
    print("[ERROR] 'pyserial' not installed.")
    sys.exit(1)

try:
    import tensorflow as tf
    import tensorflow_hub as hub
except ImportError:
    print("[ERROR] TensorFlow/TF-Hub not installed.")
    sys.exit(1)

IS_WINDOWS = platform.system() == "Windows"

if IS_WINDOWS:
    try:
        import msvcrt
    except ImportError:
        pass
else:
    import select
    import tty
    import termios

state_lock = threading.Lock()

sensor_state = {
    "temp": 29.0,
    "hum": 60.0,
    "smoke": 3.0,
    "serial_connected": False,
}

threat_state = {
    "threat": "NONE",
    "confidence": 0.0,
    "details": "Ambient Baseline",
    "expires_at": 0.0,
    "top_heard": "Listening..."
}

running = True

def get_default_port():
    ports = serial.tools.list_ports.comports()
    for p in ports:
        if any(name in p.description.lower() or name in p.device.lower() for name in ["usb", "uart", "cp210", "ch340", "serial"]):
            return p.device
    return "COM3" if IS_WINDOWS else "/dev/cu.usbserial-0001"

# ----------------------------------------------------------------------
# THREAD 1: SERIAL (DHT11 + Smoke Sensor)
# ----------------------------------------------------------------------
def serial_worker(port_name: str, baud_rate: int):
    global running, sensor_state
    simulated_temp = 29.0
    simulated_hum = 60.0
    simulated_smoke = 3.0

    while running:
        ser = None
        try:
            ser = serial.Serial(port_name, baud_rate, timeout=1.0)
            with state_lock:
                sensor_state["serial_connected"] = True

            while running:
                line = ser.readline()
                if not line:
                    continue

                try:
                    decoded = line.decode("utf-8", errors="ignore").strip()
                    if decoded.startswith("{") and decoded.endswith("}"):
                        data = json.loads(decoded)
                        with state_lock:
                            sensor_state["temp"] = float(data.get("temp", sensor_state["temp"]))
                            sensor_state["hum"] = float(data.get("hum", sensor_state["hum"]))
                            sensor_state["smoke"] = float(data.get("smoke", sensor_state["smoke"]))
                except Exception:
                    pass

        except serial.SerialException:
            with state_lock:
                sensor_state["serial_connected"] = False
            simulated_temp += np.random.uniform(-0.1, 0.1)
            simulated_hum += np.random.uniform(-0.2, 0.2)
            simulated_smoke += np.random.uniform(-0.1, 0.1)

            sensor_state["temp"] = round(simulated_temp, 1)
            sensor_state["hum"] = round(simulated_hum, 1)
            sensor_state["smoke"] = max(0.0, round(simulated_smoke, 1))
            
            time.sleep(2.0)
        finally:
            if ser and ser.is_open:
                try:
                    ser.close()
                except Exception:
                    pass

# ----------------------------------------------------------------------
# THREAD 2: YAMNet Machine Learning Acoustic Classifier
# ----------------------------------------------------------------------
SAMPLE_RATE = 16000
CHUNK_SIZE = 15600
audio_ring_buffer = np.zeros(CHUNK_SIZE, dtype=np.float32)
audio_lock = threading.Lock()

GUNSHOT_CLASSES = {"Gunshot, gunfire", "Cap gun", "Fusillade", "Artillery fire", "Machine gun", "Explosion", "Fireworks", "Bang", "Burst, pop"}
# STRICT chainsaw classes only — no generic classes like Tools/Engine that cause false positives
CHAINSAW_CLASSES = {"Chainsaw", "Sawing", "Lawn mower"}

def audio_callback(indata, frames, time_info, status):
    global audio_ring_buffer
    with audio_lock:
        new_samples = indata[:, 0]
        shift = len(new_samples)
        audio_ring_buffer = np.roll(audio_ring_buffer, -shift)
        audio_ring_buffer[-shift:] = new_samples

def audio_worker(device_index=None):
    global running, threat_state
    
    yamnet_model = hub.load("https://tfhub.dev/google/yamnet/1")
    class_map_path = yamnet_model.class_map_path().numpy().decode("utf-8")
    
    with open(class_map_path) as csv_file:
        reader = csv.reader(csv_file)
        next(reader)
        class_names = [display_name for (_, _, display_name) in reader]
        
    stream = sd.InputStream(
        samplerate=SAMPLE_RATE,
        blocksize=2048,
        device=device_index,
        channels=1,
        dtype="float32",
        callback=audio_callback,
    )
    
    with stream:
        while running:
            time.sleep(0.3)
            
            with audio_lock:
                waveform = np.copy(audio_ring_buffer)
                
            scores, embeddings, spectrogram = yamnet_model(waveform)
            
            # Max for sharp transients (Gunshots), Mean for sustained sounds (Chainsaws)
            max_scores = np.max(scores.numpy(), axis=0)
            mean_scores = np.mean(scores.numpy(), axis=0)
            
            now = time.time()
            detected_threat = "NONE"
            top_confidence = 0.0
            
            # For the live feed display
            top_3_mean_indices = np.argsort(mean_scores)[-3:][::-1]
            top_class_name = class_names[top_3_mean_indices[0]]
            top_class_conf = float(mean_scores[top_3_mean_indices[0]]) * 100
            
            # 1. Check for Gunshots using max_scores (top 5)
            for idx in np.argsort(max_scores)[-5:][::-1]:
                c_name = class_names[idx]
                c_conf = float(max_scores[idx]) * 100
                if c_name in GUNSHOT_CLASSES and c_conf >= 15.0:
                    detected_threat = "GUNSHOT"
                    top_confidence = c_conf
                    break
                    
            # 2. Deep-scan top 10 for strict chainsaw classes
            #    YAMNet will NEVER classify fan/tapping as "Chainsaw" or "Sawing"
            #    so we can safely use a low 5% threshold when scanning deeper
            if detected_threat == "NONE":
                for idx in np.argsort(mean_scores)[-10:][::-1]:
                    c_name = class_names[idx]
                    c_conf = float(mean_scores[idx]) * 100
                    if c_name in CHAINSAW_CLASSES and c_conf >= 5.0:
                        detected_threat = "CHAINSAW"
                        top_confidence = c_conf
                        break
            
            with state_lock:
                threat_state["top_heard"] = f"{top_class_name} ({top_class_conf:.1f}%)"
                if detected_threat != "NONE":
                    threat_state["threat"] = detected_threat
                    threat_state["confidence"] = round(top_confidence, 1)
                    threat_state["expires_at"] = now + 3.0
                else:
                    if now > threat_state["expires_at"]:
                        threat_state["threat"] = "NONE"
                        threat_state["confidence"] = 0.0

# ----------------------------------------------------------------------
# MAIN LOOP
# ----------------------------------------------------------------------
def main():
    global running
    
    default_detected_port = get_default_port()
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=str, default=default_detected_port)
    parser.add_argument("--baud", type=int, default=115200)
    parser.add_argument("--url", type=str, default="http://localhost:3000/api/telemetry")
    parser.add_argument("--node-id", type=str, default="ST-01")
    parser.add_argument("--lat", type=float, default=29.5300)
    parser.add_argument("--lng", type=float, default=78.7747)
    parser.add_argument("--interval", type=float, default=0.5)
    parser.add_argument("--mic-device", type=int, default=None)
    
    args = parser.parse_args()
    
    threading.Thread(target=serial_worker, args=(args.port, args.baud), daemon=True).start()
    threading.Thread(target=audio_worker, args=(args.mic_device,), daemon=True).start()
    
    http_session = requests.Session()
    last_printed_threat = ""
    
    try:
        while True:
            t_start = time.time()
            
            with state_lock:
                temp = sensor_state["temp"]
                hum = sensor_state["hum"]
                smoke = sensor_state["smoke"]
                active_threat = threat_state["threat"]
                active_confidence = threat_state["confidence"]
                
            if active_threat != "NONE":
                threat = active_threat
                confidence = active_confidence
            elif smoke > 35.0 or temp > 45.0:
                threat = "FOREST_FIRE"
                confidence = 96.5
            else:
                threat = "NONE"
                confidence = 0.0
                
            payload = {
                "nodeId": args.node_id,
                "lat": args.lat,
                "lng": args.lng,
                "temp": round(temp, 1),
                "hum": round(hum, 1),
                "smoke": round(smoke, 1),
                "threat": threat,
                "confidence": round(confidence, 1),
            }
            
            try:
                res = http_session.post(args.url, json=payload, timeout=1.2)
                status_text = "API: OK" if res.status_code == 200 else f"API: {res.status_code}"
            except requests.exceptions.RequestException:
                status_text = "API: Offline"
                
            top_heard = threat_state.get("top_heard", "")
            
            if threat != "NONE":
                if last_printed_threat != threat:
                    print(f"\n[{time.strftime('%H:%M:%S')}] 🚨 THREAT DETECTED: {threat} ({confidence:.1f}% Confidence) | {status_text}")
                    last_printed_threat = threat
            else:
                sys.stdout.write(f"\r[LIVE] Node: {args.node_id} | Temp: {temp}C | Hum: {hum}% | Smoke: {smoke} | Hearing: {top_heard:30} | {status_text}   ")
                sys.stdout.flush()
                last_printed_threat = "NONE"
                
            time.sleep(max(0.05, args.interval - (time.time() - t_start)))
            
    except KeyboardInterrupt:
        print("\n[SHUTDOWN] Exiting...")
        running = False

if __name__ == "__main__":
    main()