#!/usr/bin/env python3
"""TerraPulse IoT Gateway Bridge (ESP32 + Calibrated YAMNet Acoustic Threat

Classifier)
"""

import argparse
import csv
import json
import platform
import sys
import threading
import time
import numpy as np

try:
  import sounddevice as sd
except ImportError:
  print("[ERROR] 'sounddevice' not installed. Run: pip install sounddevice")
  sys.exit(1)

try:
  import requests
except ImportError:
  print("[ERROR] 'requests' not installed. Run: pip install requests")
  sys.exit(1)

try:
  import serial
  import serial.tools.list_ports
except ImportError:
  print("[ERROR] 'pyserial' not installed. Run: pip install pyserial")
  sys.exit(1)

try:
  import tensorflow as tf
  import tensorflow_hub as hub
except ImportError:
  print(
      "[ERROR] TensorFlow / TF-Hub not installed. Run: pip install tensorflow"
      " tensorflow-hub"
  )
  sys.exit(1)

IS_WINDOWS = platform.system() == "Windows"
if IS_WINDOWS:
  import msvcrt
else:
  import select
  import termios
  import tty

# Global Thread-Safe State
state_lock = threading.Lock()

sensor_state = {
    "temp": 26.5,
    "hum": 52.0,
    "smoke": 3.0,
    "serial_connected": False,
}

threat_state = {
    "threat": "NONE",
    "confidence": 0.0,
    "details": "Ambient Baseline",
    "expires_at": 0.0,
}

running = True


def get_default_port():
  ports = serial.tools.list_ports.comports()
  for p in ports:
    if any(
        name in p.description.lower() or name in p.device.lower()
        for name in ["usb", "uart", "cp210", "ch340", "serial"]
    ):
      return p.device
  return "COM3" if IS_WINDOWS else "/dev/cu.usbserial-0001"


# ----------------------------------------------------------------------
# THREAD 1: SERIAL WORKER (ESP32: DHT11 + MQ-2)
# ----------------------------------------------------------------------
def serial_worker(port_name: str, baud_rate: int):
  global running, sensor_state

  print(
      f"[SERIAL] Initializing ESP32 Serial Reader on {port_name} ({baud_rate}"
      " baud)..."
  )

  simulated_temp = 26.5
  simulated_hum = 52.0
  simulated_smoke = 3.0

  while running:
    ser = None
    try:
      ser = serial.Serial(port_name, baud_rate, timeout=1.0)
      print(f"[SERIAL] [CONNECTED] Connected to hardware on {port_name}!")
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
              sensor_state["temp"] = float(
                  data.get("temp", sensor_state["temp"])
              )
              sensor_state["hum"] = float(data.get("hum", sensor_state["hum"]))
              sensor_state["smoke"] = float(
                  data.get("smoke", sensor_state["smoke"])
              )
        except Exception:
          pass

    except serial.SerialException:
      with state_lock:
        sensor_state["serial_connected"] = False
        # Graceful baseline simulation fallback if board is disconnected
        simulated_temp += np.random.uniform(-0.08, 0.08)
        simulated_hum += np.random.uniform(-0.15, 0.15)
        simulated_smoke += np.random.uniform(-0.05, 0.05)

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
CHUNK_SIZE = 15600  # 0.975 seconds buffer for YAMNet
audio_ring_buffer = np.zeros(CHUNK_SIZE, dtype=np.float32)
audio_lock = threading.Lock()

GUNSHOT_CLASSES = {
    "Gunshot, gunfire",
    "Cap gun",
    "Fusillade",
    "Artillery fire",
    "Machine gun",
    "Explosion",
}
CHAINSAW_CLASSES = {"Chainsaw", "Sawing", "Lawn mower", "Engine"}


def audio_callback(indata, frames, time_info, status):
  global audio_ring_buffer
  with audio_lock:
    new_samples = indata[:, 0]
    shift = len(new_samples)
    audio_ring_buffer = np.roll(audio_ring_buffer, -shift)
    audio_ring_buffer[-shift:] = new_samples


def audio_worker(device_index=None):
  global running, threat_state

  print("[ML] Loading Google YAMNet Deep Learning Classifier from TF-Hub...")
  yamnet_model = hub.load("https://tfhub.dev/google/yamnet/1")
  class_map_path = yamnet_model.class_map_path().numpy().decode("utf-8")

  with open(class_map_path) as csv_file:
    reader = csv.reader(csv_file)
    next(reader)  # Skip header row
    class_names = [display_name for (_, _, display_name) in reader]

  print("[ML] YAMNet model initialized successfully! Listening to live mic...")

  try:
    stream = sd.InputStream(
        samplerate=SAMPLE_RATE,
        blocksize=2048,
        device=device_index,
        channels=1,
        dtype="float32",
        callback=audio_callback,
    )
  except Exception as e:
    print(f"[AUDIO ERROR] Could not open microphone stream: {e}")
    return

  with stream:
    while running:
      time.sleep(0.25)

      with audio_lock:
        waveform = np.copy(audio_ring_buffer)

      # 1. Reject Silence / Background noise floor
      peak_amp = np.max(np.abs(waveform))
      rms_amp = np.sqrt(np.mean(waveform**2))

      if peak_amp < 0.03:
        continue

      # 2. Peak normalization to support distant/low-volume phone speaker playback
      if peak_amp > 0.01:
        normalized_waveform = waveform / peak_amp
      else:
        normalized_waveform = waveform

      # 3. YAMNet Inference
      scores, embeddings, spectrogram = yamnet_model(normalized_waveform)
      mean_scores = np.mean(scores.numpy(), axis=0)
      top_class_index = np.argmax(mean_scores)
      top_class_name = class_names[top_class_index]

      now = time.time()
      detected_threat = "NONE"
      threat_details = "Ambient Baseline"
      top_confidence = 0.0

      # Scan top-5 prediction scores
      top_5_indices = np.argsort(mean_scores)[-5:][::-1]
      for idx in top_5_indices:
        c_name = class_names[idx]
        c_conf = float(mean_scores[idx]) * 100.0

        # Gunshots: Strict threshold (>= 45%) to prevent coughs/claps/clicks
        if c_name in GUNSHOT_CLASSES and c_conf >= 45.0:
          detected_threat = "GUNSHOT"
          threat_details = f"YAMNet ML: {c_name} ({c_conf:.1f}%)"
          top_confidence = c_conf
          break

        # Chainsaws: Calibrated threshold (>= 25%) for phone playback
        elif c_name in CHAINSAW_CLASSES and c_conf >= 25.0:
          detected_threat = "CHAINSAW"
          threat_details = f"YAMNet ML: {c_name} ({c_conf:.1f}%)"
          top_confidence = c_conf
          break

      # Latch alert for 3.0 seconds so UI catches the event cleanly
      with state_lock:
        if detected_threat != "NONE":
          threat_state["threat"] = detected_threat
          threat_state["confidence"] = round(top_confidence, 1)
          threat_state["details"] = threat_details
          threat_state["expires_at"] = now + 3.0
        else:
          if now > threat_state["expires_at"]:
            threat_state["threat"] = "NONE"
            threat_state["confidence"] = 0.0
            threat_state["details"] = f"Ambient / {top_class_name}"


# ----------------------------------------------------------------------
# THREAD 3: NON-BLOCKING KEYBOARD HOTKEYS (DEMO INSURANCE)
# ----------------------------------------------------------------------
def keyboard_worker():
  global running, threat_state
  if not IS_WINDOWS:
    return

  while running:
    try:
      if msvcrt.kbhit():
        ch = msvcrt.getch()
        try:
          key = ch.decode("utf-8", errors="ignore").lower()
        except Exception:
          continue

        now = time.time()
        with state_lock:
          if key == "c":
            threat_state["threat"] = "CHAINSAW"
            threat_state["confidence"] = 94.5
            threat_state["details"] = "Manual Hotkey Override: Chainsaw"
            threat_state["expires_at"] = now + 3.0
            print(
                "\n[HOTKEY] >>> Triggered CHAINSAW Acoustic Alert (3s latch)"
                " <<<"
            )
          elif key == "g":
            threat_state["threat"] = "GUNSHOT"
            threat_state["confidence"] = 98.0
            threat_state["details"] = "Manual Hotkey Override: Gunshot"
            threat_state["expires_at"] = now + 3.0
            print(
                "\n[HOTKEY] >>> Triggered GUNSHOT Acoustic Alert (3s latch) <<<"
            )
          elif key == "f":
            threat_state["threat"] = "FOREST_FIRE"
            threat_state["confidence"] = 96.5
            threat_state["details"] = "Manual Hotkey Override: Forest Fire"
            threat_state["expires_at"] = now + 3.0
            print(
                "\n[HOTKEY] >>> Triggered FOREST_FIRE Thermal Alert (3s latch)"
                " <<<"
            )
          elif key == "n":
            threat_state["threat"] = "NONE"
            threat_state["confidence"] = 0.0
            threat_state["details"] = "Ambient Baseline"
            threat_state["expires_at"] = 0.0
            print("\n[HOTKEY] >>> Reset Threat to Normal Baseline <<<")
      time.sleep(0.05)
    except Exception:
      time.sleep(0.1)


# ----------------------------------------------------------------------
# MAIN LOOP: TELEMETRY MERGER & REST API DISPATCHER
# ----------------------------------------------------------------------
def main():
  global running

  default_detected_port = get_default_port()
  parser = argparse.ArgumentParser(
      description="TerraPulse ESP32 & Acoustic IoT Gateway Bridge"
  )
  parser.add_argument("--port", type=str, default=default_detected_port)
  parser.add_argument("--baud", type=int, default=115200)
  parser.add_argument(
      "--url", type=str, default="http://localhost:3000/api/telemetry"
  )
  parser.add_argument("--node-id", type=str, default="ST-01")
  parser.add_argument("--lat", type=float, default=29.5300)
  parser.add_argument("--lng", type=float, default=78.7747)
  parser.add_argument("--interval", type=float, default=0.5)
  parser.add_argument("--mic-device", type=int, default=None)
  args = parser.parse_args()

  print("=" * 70)
  print(" TERRAPULSE ESP32 HARDWARE & YAMNet ACOUSTIC ML GATEWAY ")
  print("=" * 70)
  print(f" Target API Endpoint  : {args.url}")
  print(f" Station Node ID      : {args.node_id}")
  print(f" Serial Port Target   : {args.port} @ {args.baud} baud")
  print(" [HOTKEYS] 'c' = Chainsaw | 'g' = Gunshot | 'f' = Fire | 'n' = Normal")
  print("=" * 70)

  # Start Worker Threads
  t_serial = threading.Thread(
      target=serial_worker, args=(args.port, args.baud), daemon=True
  )
  t_serial.start()

  t_audio = threading.Thread(
      target=audio_worker, args=(args.mic_device,), daemon=True
  )
  t_audio.start()

  t_keys = threading.Thread(target=keyboard_worker, daemon=True)
  t_keys.start()

  http_session = requests.Session()

  try:
    while True:
      t_start = time.time()

      with state_lock:
        temp = sensor_state["temp"]
        hum = sensor_state["hum"]
        smoke = sensor_state["smoke"]
        is_serial = sensor_state["serial_connected"]
        active_threat = threat_state["threat"]
        active_confidence = threat_state["confidence"]

      # Threat Resolution (Acoustics take priority, followed by MQ-2 / DHT11 threshold)
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

      status_text = ""
      try:
        res = http_session.post(args.url, json=payload, timeout=1.2)
        status_text = (
            "HTTP 200 OK" if res.status_code == 200 else f"HTTP {res.status_code}"
        )
      except requests.exceptions.RequestException:
        status_text = "API Offline (Retrying...)"

      mode_badge = "[ESP32-USB]" if is_serial else "[SIMULATED]"

      if threat != "NONE":
        print(
            f"\n[ALERT!] {args.node_id} | Threat: {threat} ({confidence:.0f}%"
            f" Conf) | Temp: {temp:.1f}C | Hum: {hum:.0f}% | Smoke:"
            f" {smoke:.1f} | {status_text}      "
        )
      else:
        sys.stdout.write(
            f"\r[LIVE] {mode_badge} {args.node_id} | Temp: {temp:.1f}C |"
            f" Hum: {hum:.0f}% | Smoke: {smoke:.1f} | Threat: NONE |"
            f" {status_text}   "
        )
        sys.stdout.flush()

      elapsed = time.time() - t_start
      time.sleep(max(0.05, args.interval - elapsed))

  except KeyboardInterrupt:
    print("\n\n[SHUTDOWN] Exiting Gateway Bridge gracefully...")
    running = False
    time.sleep(0.5)


if __name__ == "__main__":
  main()