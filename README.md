# TerraPulse: Forest Guard Mesh 🌲🛡️

[![SIH 2026](https://img.shields.io/badge/Smart%20India%20Hackathon-2026-brightgreen.svg)](https://www.sih.gov.in/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.5-black?logo=next.js)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://python.org/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-YAMNet%20Edge%20AI-FF6F00?logo=tensorflow)](https://tfhub.dev/google/yamnet/1)
[![ESP32](https://img.shields.io/badge/Hardware-ESP32%20%7C%20LoRa%20Mesh-E7352C?logo=espressif)](https://espressif.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Decentralized, Ultra-Low-Power Edge AI & Sub-GHz LoRa Mesh Network for Real-Time Wildfire Detection, Anti-Poaching, and Anti-Deforestation Surveillance.**

---

## 🏛️ Team Details & Organization

**Team Name:** Team NavAstra  
**Event:** Smart India Hackathon (SIH) 2026  
**Problem Statement:** Real-Time Forest Monitoring, Threat Classification, and Ranger Rapid-Response Dispatch System in Remote, Zero-Cellular Forest Enclaves.

### 👥 Team Members & Roles

| Member | Role | Key Contributions |
| :--- | :--- | :--- |
| **Mahit** | System Architecture & Network Integration | LoRa multi-hop mesh topology, node discovery protocol, and gateway fault tolerance. |
| **Dwij** | Problem Analysis & Ground Reality Research | Field forestry research, threat profiling (chainsaw/gunshot heuristics), and terrain edge cases. |
| **Utkarsh** | Embedded Systems, Edge AI & Dashboard Integration | ESP32 firmware, YAMNet acoustic classifier pipeline, serial bridge, and Next.js Ranger Console. |
| **Raunak** | Hardware Engineering & Roadmap Mitigations | Sensor enclosure weatherproofing (IP67), antenna tuning, and hardware component selection. |
| **Swayam** | Power Budgeting & Economic Disruption Analysis | Solar harvesting PMIC modeling, ultra-low power deep-sleep cycle budgets, and cost-efficiency analysis. |
| **Tanvi** | Environmental Standards & Technical Validation | Ecological safety compliance, BME680/MQ sensor baseline calibration, and QA validation. |

---

## 📖 Executive Summary

Forest reserves across India and global biodiversity hotspots lose millions of hectares annually to illegal logging, poaching, and uncontrolled forest fires. Traditional monitoring strategies face critical bottlenecks:
1. **Zero Cellular/Satellite Coverage:** Dense jungle canopies completely attenuate high-frequency wireless signals.
2. **Delayed Threat Discovery:** Satellite thermal imagery has update latencies of 4–12 hours, making real-time interception impossible.
3. **Power Inefficiencies:** Continuous sensing rapidly exhausts battery-operated remote devices.

**TerraPulse** bridges this critical gap with a three-tier defensive ecosystem:
- **Autonomous ESP32 Sentinel Nodes:** Deployed in high-risk forest zones, continuously sensing atmospheric anomalies (temperature, humidity, air quality/VOCs, gas) and streaming acoustic threat signatures.
- **Resilient Sub-GHz LoRa Mesh:** Multi-hop packet routing operating on 433/868 MHz ISM bands, penetrating dense foliage without reliance on cellular infrastructure.
- **Edge AI Acoustic Classification:** Real-time deep learning pipeline running Google's **YAMNet** audio neural network to isolate gunshots, chainsaws, vehicle engines, and explosions with microsecond accuracy.
- **Command & Control Ranger Console:** Next.js 14 tactical dashboard with GIS satellite mapping, automated audio alarms, incident logging, and instant ranger dispatch routing.

---

## 🏗️ System Architecture

```mermaid
flowchart TB
    subgraph SENSORS ["🌲 Tier 1: Forest Sentinel Nodes (ESP32)"]
        nodeA["Sentinel Node A (ST-01)<br/>DHT11 / BME680 (Temp/Hum)<br/>Gas / Smoke Sensor<br/>MEMS Microphone"]
        nodeB["Sentinel Node B (ST-02)<br/>Micro-climate Sensors<br/>Solar PMIC + LiFePO4"]
        nodeC["Sentinel Node C (ST-03)<br/>Perimeter Acoustic Node"]
    end

    subgraph MESH ["📡 Tier 2: Sub-GHz LoRa Multi-Hop Mesh"]
        loraMesh["LoRa Mesh Routing (433/868 MHz)<br/>• Non-line-of-sight foliage penetration<br/>• Dynamic packet relaying<br/>• RSSI & SNR health telemetry"]
    end

    subgraph GATEWAY ["⚡ Tier 3: Edge Gateway & Neural Classifier"]
        gwSerial["ESP32 Serial Reader<br/>(115200 Baud / Auto-Fallback)"]
        gwAudio["Acoustic Stream Receiver<br/>(16kHz Ring Buffer)"]
        yamnet["Edge YAMNet Neural Network<br/>• Chainsaw & Gunshot Classifier<br/>• Transient Peak Analyzer<br/>• Confidence Metric (>15%)"]
        gwBridge["Python Gateway Bridge (`bridge.py`)<br/>JSON Serialization & Telemetry Dispatch"]
    end

    subgraph CLOUD ["💻 Tier 4: Tactical Ranger Command Console"]
        apiRoute["Next.js API Handler<br/>`/api/telemetry`"]
        stateStore["In-Memory Reactive Store<br/>Node Telemetry & Incident Queue"]
        uiMap["Leaflet GIS Satellite Map<br/>Real-Time Threat Radii & Node Pins"]
        uiFeed["Live Threat Alerts & Audio Siren<br/>Dispatch Ranger Units (Bravo, Delta)"]
    end

    nodeA --> loraMesh
    nodeB --> loraMesh
    nodeC --> loraMesh
    loraMesh --> gwSerial
    gwSerial --> gwBridge
    gwAudio --> yamnet
    yamnet --> gwBridge
    gwBridge -- "HTTP POST (JSON Telemetry)" --> apiRoute
    apiRoute --> stateStore
    stateStore --> uiMap
    stateStore --> uiFeed
```

### Architectural Highlights

1. **Edge Sensing Layer:** Low-power microcontroller sentinel units gather micro-climate data and acoustic spectrum slices.
2. **Mesh Communication Backhaul:** Multi-hop LoRa nodes dynamically relay telemetry over kilometer-scale forest ranges to reach the nearest perimeter gateway.
3. **Gateway Threat Processor:** `bridge.py` combines UART serial telemetry with audio streams processed through the TensorFlow YAMNet classifier, assigning calibrated threat confidence scores.
4. **Operations Command Center:** High-performance Next.js 14 dashboard visualizes real-time sensor metrics, sound frequency detections, threat alerts, and live ranger dispatch statuses.

---

## 🚀 Key Innovations

### 1. Multi-Modal Sensor Fusion
Combines environmental telemetry (temperature, relative humidity, VOC air resistance, smoke levels) with acoustic ML inference. Dual-trigger validation prevents false positives (e.g., distinguishing campfire smoke from active forest fires by cross-referencing temperature spikes and particulate density).

### 2. TinyML & YAMNet Acoustic Threat Classification
Utilizes Google's **YAMNet** deep neural network (trained on the 521-class AudioSet ontology) to detect critical acoustic anomalies:
- **Gunshots & Explosions:** Captures sharp transient pressure waves with sliding window temporal peak detection (`GUNSHOT_CLASSES`).
- **Chainsaws & Heavy Machinery:** Evaluates sustained harmonic frequency bands matching mechanical cutting tools (`CHAINSAW_CLASSES`).

### 3. Sub-GHz LoRa Mesh Viability
Operates in unlicensed ISM bands (433 MHz / 868 MHz / 915 MHz), where signal wavelengths easily diffract around dense tree trunks and wet tropical leaf canopies—achieving 5–12 km line-of-sight range and 1.5–3 km dense jungle multi-hop relaying without cellular towers.

### 4. Resilient Simulation & Auto-Discovery Fallback
`bridge.py` includes automatic hardware discovery for ESP32 COM/USB ports (`CP210x`, `CH340`, `FTDI`). In the absence of physical hardware, it seamlessly transitions into dynamic stochastic simulation mode with real-time microphone classification.

### 5. Automated Emergency Dispatch Workflow
Integrated incident management console triggers interactive audio sirens, calculates threat dispersion radii, and empowers command personnel to dispatch field ranger teams (Bravo, Delta, Alpha) with GPS-directed tactical coordinates.

---

## 🛠️ Hardware & Software Tech Stack

| Domain | Technology / Component | Purpose & Description |
| :--- | :--- | :--- |
| **Edge Compute** | **ESP32 NodeMCU (WROOM-32)** | Dual-core 240 MHz MCU managing sensor polling and serial packet formatting. |
| **RF Mesh** | **SX1276 / SX1262 LoRa Transceivers** | Long-range Sub-GHz multi-hop packet transmission with low current consumption. |
| **Environmental** | **DHT11 / BME680 & MQ Series** | Precision digital temperature, humidity, atmospheric pressure, and smoke/gas detection. |
| **Acoustic Edge** | **MEMS I2S Microphone / SoundDevice** | 16 kHz 32-bit floating-point acoustic waveform sampling for sound classification. |
| **Machine Learning** | **TensorFlow & TF-Hub (YAMNet)** | 521-class AudioSet classifier for chainsaw, gunshot, engine, and explosion detection. |
| **Gateway Bridge** | **Python 3.10+ (PySerial, Requests)** | Multi-threaded serial telemetry ingestion, ML audio analysis, and REST dispatch. |
| **Frontend UI** | **Next.js 14 (App Router) + React 18** | High-performance dashboard with reactive telemetry streams and real-time state. |
| **GIS Mapping** | **Leaflet & React-Leaflet** | OpenStreetMap / Satellite hybrid cartography with custom threat radius overlays. |
| **Styling & Icons** | **TailwindCSS & Lucide Icons** | Glassmorphic dark tactical theme with cybernetic status ribbons and indicators. |

---

## 💻 Step-by-Step Local Setup & Execution Guide

### Prerequisites
- **Node.js**: v18.17+ or v20+ installed
- **Python**: v3.10+ installed
- **Microphone**: Default system microphone or USB audio input
- **Hardware (Optional)**: ESP32 connected via USB running serial output (`{"temp": 31.2, "hum": 55, "smoke": 2.1}`)

---

### Step 1: Clone Repository

```bash
git clone https://github.com/utkarsh/dashboard_SIH.git
cd dashboard_SIH
```

---

### Step 2: Next.js Command Console Setup

1. **Install NPM dependencies:**
   ```bash
   npm install
   ```

2. **Launch development server:**
   ```bash
   npm run dev
   ```

3. **Verify Dashboard:**
   Open [http://localhost:3000](http://localhost:3000) in your web browser. You will see the **TerraPulse Ranger Command Console** with live GIS mapping and node telemetry.

---

### Step 3: Python IoT Gateway Bridge Setup

1. **Create and activate a Python virtual environment:**
   ```powershell
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # Linux / macOS (Bash)
   python3 -m venv venv
   source venv/bin/activate
   ```

2. **Install required Python packages:**
   ```bash
   pip install sounddevice requests pyserial tensorflow tensorflow-hub numpy
   ```

---

### Step 4: Run the Gateway Bridge

Launch `bridge.py` to start both the ESP32 serial reader and the live YAMNet audio classifier:

```bash
python bridge.py
```

#### Optional CLI Arguments:
```bash
# Specify custom serial port, baud rate, or dashboard endpoint
python bridge.py --port COM4 --baud 115200 --url http://localhost:3000/api/telemetry --node-id ST-01

# Inspect or specify audio input device index
python bridge.py --mic-device 1 --interval 0.5
```

> **Note on Hardware Fallback:** If no ESP32 is plugged in, `bridge.py` automatically initiates the **[SIMULATED]** baseline generator while keeping the real-time microphone ML inference fully live.

---

### Step 5: Live Testing & Threat Simulation

You can test real-time classification through either audio playback or simulated anomalies:

1. **Acoustic ML Test:** Play an audio sample of a **chainsaw** or **gunshot** near your microphone. The bridge will output:
   ```text
   [ALERT!] ST-01 | Threat: CHAINSAW (91% Conf) | Temp: 29.4C | Hum: 60% | Smoke: 3.1 | HTTP 200 OK
   ```
2. **Dashboard Reaction:**
   - Visual alert flash and audio siren trigger immediately.
   - Node status shifts to **CRITICAL**.
   - Satellite map renders threat dispersion radius around the sensor coordinates.
   - Ranger dispatch button allows allocating emergency units in real time.

---

## 📊 Evaluation & Verification Checklist

- [x] **Sub-GHz LoRa Mesh Model:** Resilient multi-hop design for deep forest foliage penetration.
- [x] **Real-Time Edge ML:** YAMNet classifier detects chainsaws and gunshots with confidence telemetry.
- [x] **Autonomous Fallback:** Graceful transition between physical serial hardware and simulation mode.
- [x] **Interactive GIS Dashboard:** Dynamic Leaflet map with live threat radius circles and node drilldowns.
- [x] **Incident Response Lifecycle:** Live dispatch routing, status logging, and incident acknowledgment.

---

## 📜 License

This project is developed under the **MIT License** for the Smart India Hackathon 2026. Feel free to adapt and build upon this open-source architecture for conservation and ecological defense.
