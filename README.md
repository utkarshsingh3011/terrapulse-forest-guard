# TerraPulse Forest Guard

TerraPulse Forest Guard is an advanced monitoring and telemetry dashboard designed for real-time environmental tracking, incident management, and satellite map visualization. It features a modern web interface coupled with a Python bridge for handling sensor data or external telemetry streams.

## 🚀 Key Features

*   **Real-Time Telemetry Tracking:** Monitor environmental data from various nodes through dedicated APIs and state management.
*   **Satellite Mapping & Visualization:** Interactive mapping capabilities including `SatelliteMap` and `NodeTelemetryDrawer` components for spatial awareness.
*   **Alert & Incident Management:** A live `AlertsFeed` and `IncidentModal` to track, display, and manage active environmental alerts.
*   **Simulation Environment:** Built-in `SimulationPanel` to test data flows and system responses without requiring live sensor data.
*   **Audio Notifications:** Integrated audio library (`lib/audio.ts`) for real-time alert sounds and notifications.
*   **Metrics Dashboard:** A `TopMetricsRibbon` to display high-level system and environmental statistics at a glance.

## 🛠️ Tech Stack

*   **Frontend & API:** Next.js (App Router), React, TypeScript
*   **Styling:** Tailwind CSS, PostCSS
*   **State Management:** Custom store implementation (`lib/store.ts`)
*   **Hardware/Data Bridge:** Python (`bridge.py`) for interfacing with external telemetry sources or IoT devices

## 📂 Project Structure

```text
terrapulse-forest-guard/
├── app/
│   ├── api/telemetry/route.ts # Telemetry ingestion API endpoints
│   ├── globals.css            # Global stylesheets
│   ├── layout.tsx             # Main application layout
│   └── page.tsx               # Main dashboard view
├── components/
│   ├── Map/                   # Mapping components (SatelliteMap, MapInner)
│   ├── AlertsFeed.tsx         # Live feed of system alerts
│   ├── IncidentModal.tsx      # Detailed view for specific incidents
│   ├── SimulationPanel.tsx    # Interface for running data simulations
│   └── TopMetricsRibbon.tsx   # Dashboard header metrics
├── lib/
│   ├── audio.ts               # Audio notification handler
│   └── store.ts               # Application state management
├── types/
│   └── telemetry.ts           # TypeScript interfaces for telemetry data
├── bridge.py                  # Python script for external data bridging
├── tailwind.config.ts         # Tailwind CSS configuration
└── package.json               # Node.js dependencies and scripts
```

## 💻 Getting Started

### Prerequisites
*   Node.js (v18 or higher recommended)
*   Python 3.x (for running the bridge script)
*   npm, yarn, or pnpm

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/terrapulse-forest-guard.git
    cd terrapulse-forest-guard
    ```

2.  **Install frontend dependencies:**
    ```bash
    npm install
    ```

3.  **Start the Next.js development server:**
    ```bash
    npm run dev
    ```
    The dashboard will be available at `http://localhost:3000`.

4.  **Run the Telemetry Bridge (Optional):**
    If you are pulling in live data or running a local simulation that requires the external script, execute the Python bridge:
    ```bash
    python bridge.py
    ```

## 📡 API Reference

*   **`POST /api/telemetry`**: Endpoint designed to ingest live telemetry data from the Python bridge or direct hardware POST requests. Data structures should match the definitions found in `types/telemetry.ts`.
