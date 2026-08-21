import { NodeData, ThreatAlert, ThreatCategory, ThreatLevel, RangerUnit, TelemetryPayload } from "@/types/telemetry";

// Initial seed nodes deployed across Jim Corbett National Park
export const INITIAL_NODES: NodeData[] = [
  {
    id: "Node-01",
    name: "Dhikala Ridge Post",
    sector: "Dhikala Core Reserve",
    lat: 29.5300,
    lng: 78.7747,
    elevation: 412,
    status: "ONLINE",
    telemetry: {
      temp: 29.4,
      humidity: 62.0,
      vocGas: 120.5,
      pressure: 1011.8,
      battery: 94,
      rssi: -78,
      snr: 9.2
    },
    activeThreat: "NONE",
    threatConfidence: 0,
    threatRadius: 0,
    lastSeen: "Just now",
    solarInputWatts: 4.8,
    history: [
      { timestamp: "10m ago", temp: 28.9, humidity: 63.5, vocGas: 122.0 },
      { timestamp: "8m ago", temp: 29.1, humidity: 62.8, vocGas: 121.5 },
      { timestamp: "6m ago", temp: 29.2, humidity: 62.4, vocGas: 121.0 },
      { timestamp: "4m ago", temp: 29.3, humidity: 62.1, vocGas: 120.8 },
      { timestamp: "2m ago", temp: 29.4, humidity: 62.0, vocGas: 120.5 },
    ]
  },
  {
    id: "Node-02",
    name: "Bijrani Canopy Post",
    sector: "Bijrani Forest Range",
    lat: 29.5450,
    lng: 78.7900,
    elevation: 385,
    status: "ONLINE",
    telemetry: {
      temp: 30.1,
      humidity: 58.4,
      vocGas: 114.2,
      pressure: 1012.4,
      battery: 89,
      rssi: -82,
      snr: 8.4
    },
    activeThreat: "NONE",
    threatConfidence: 0,
    threatRadius: 0,
    lastSeen: "Just now",
    solarInputWatts: 5.1,
    history: [
      { timestamp: "10m ago", temp: 29.5, humidity: 59.8, vocGas: 118.0 },
      { timestamp: "8m ago", temp: 29.7, humidity: 59.2, vocGas: 116.5 },
      { timestamp: "6m ago", temp: 29.9, humidity: 58.9, vocGas: 115.8 },
      { timestamp: "4m ago", temp: 30.0, humidity: 58.6, vocGas: 114.9 },
      { timestamp: "2m ago", temp: 30.1, humidity: 58.4, vocGas: 114.2 },
    ]
  },
  {
    id: "Node-03",
    name: "Jhirna Corridor Post",
    sector: "Jhirna Wildlife Trail",
    lat: 29.5150,
    lng: 78.7550,
    elevation: 430,
    status: "ONLINE",
    telemetry: {
      temp: 28.6,
      humidity: 65.2,
      vocGas: 135.0,
      pressure: 1010.9,
      battery: 98,
      rssi: -74,
      snr: 10.1
    },
    activeThreat: "NONE",
    threatConfidence: 0,
    threatRadius: 0,
    lastSeen: "Just now",
    solarInputWatts: 4.2,
    history: [
      { timestamp: "10m ago", temp: 28.2, humidity: 66.0, vocGas: 138.0 },
      { timestamp: "8m ago", temp: 28.3, humidity: 65.8, vocGas: 137.2 },
      { timestamp: "6m ago", temp: 28.4, humidity: 65.6, vocGas: 136.5 },
      { timestamp: "4m ago", temp: 28.5, humidity: 65.4, vocGas: 135.8 },
      { timestamp: "2m ago", temp: 28.6, humidity: 65.2, vocGas: 135.0 },
    ]
  },
  {
    id: "Node-04",
    name: "Dhela Riverine Post",
    sector: "Dhela Buffer Zone",
    lat: 29.5200,
    lng: 78.8100,
    elevation: 360,
    status: "ONLINE",
    telemetry: {
      temp: 29.8,
      humidity: 61.5,
      vocGas: 128.0,
      pressure: 1013.1,
      battery: 92,
      rssi: -79,
      snr: 9.0
    },
    activeThreat: "NONE",
    threatConfidence: 0,
    threatRadius: 0,
    lastSeen: "Just now",
    solarInputWatts: 4.9,
    history: [
      { timestamp: "10m ago", temp: 29.2, humidity: 62.5, vocGas: 131.0 },
      { timestamp: "8m ago", temp: 29.4, humidity: 62.1, vocGas: 130.0 },
      { timestamp: "6m ago", temp: 29.6, humidity: 61.8, vocGas: 129.2 },
      { timestamp: "4m ago", temp: 29.7, humidity: 61.6, vocGas: 128.5 },
      { timestamp: "2m ago", temp: 29.8, humidity: 61.5, vocGas: 128.0 },
    ]
  }
];

export const INITIAL_ALERTS: ThreatAlert[] = [
  {
    id: "ALT-2026-0891",
    nodeId: "Node-02",
    nodeName: "Bijrani Canopy Post",
    sector: "Bijrani Forest Range",
    threat: "CHAINSAW",
    confidence: 94.2,
    timestamp: "18m ago",
    status: "ACKNOWLEDGED",
    lat: 29.5450,
    lng: 78.7900,
    temp: 30.1,
    humidity: 58.4,
    vocGas: 114.2,
    details: "⚠️ Sound Match: Active Chainsaw Detected (94% Confidence)"
  },
  {
    id: "ALT-2026-0842",
    nodeId: "Node-04",
    nodeName: "Dhela Riverine Post",
    sector: "Dhela Buffer Zone",
    threat: "TAMPER",
    confidence: 88.5,
    timestamp: "1h 14m ago",
    status: "RESOLVED",
    lat: 29.5200,
    lng: 78.8100,
    temp: 29.0,
    humidity: 63.0,
    vocGas: 127.5,
    details: "🚨 Station Alert: Device Movement / Station Tilt Detected"
  }
];

export const RANGER_UNITS: RangerUnit[] = [
  {
    id: "RU-ALPHA",
    callsign: "Dhikala Patrol Team (4 Rangers)",
    team: "On-Foot Forestry Patrol • Core Beat",
    status: "AVAILABLE",
    lat: 29.5350,
    lng: 78.7600,
  },
  {
    id: "RU-BRAVO",
    callsign: "Bijrani Rapid Response Team (Vehicle)",
    team: "Quick Response 4WD Unit • Armed Patrol",
    status: "AVAILABLE",
    lat: 29.5100,
    lng: 78.7800,
  },
  {
    id: "RU-DRONE",
    callsign: "Aerial Recon Drone (SkyEye)",
    team: "Autonomous Thermal Imaging UAV",
    status: "AVAILABLE",
    lat: 29.5250,
    lng: 78.7700,
  }
];

// Helper to normalize and map threat strings
export function mapThreatString(threatStr?: string): ThreatCategory {
  if (!threatStr) return "NONE";
  const upper = threatStr.toUpperCase().trim();
  if (upper.includes("FIRE")) return "FOREST_FIRE";
  if (upper.includes("CHAINSAW") || upper.includes("LOGGING")) return "CHAINSAW";
  if (upper.includes("GUNSHOT") || upper.includes("POACH")) return "GUNSHOT";
  if (upper.includes("TAMPER") || upper.includes("MOTION")) return "TAMPER";
  if (upper === "NONE") return "NONE";
  return "NONE";
}

export function calculateThreatLevel(nodes: NodeData[], alerts: ThreatAlert[]): ThreatLevel {
  const activeCritical = nodes.some(n => n.activeThreat === "FOREST_FIRE" || n.activeThreat === "GUNSHOT");
  if (activeCritical) return "CRITICAL";

  const activeElevated = nodes.some(n => n.activeThreat === "CHAINSAW" || n.activeThreat === "TAMPER");
  if (activeElevated) return "ELEVATED";

  const recentUnresolved = alerts.some(a => (a.status === "ACTIVE" || a.status === "DISPATCHED") && a.threat !== "NONE");
  if (recentUnresolved) return "ELEVATED";

  return "LOW";
}

export function getThreatRadiusMeters(threat: ThreatCategory): number {
  switch (threat) {
    case "FOREST_FIRE":
      return 600;
    case "CHAINSAW":
      return 750;
    case "GUNSHOT":
      return 1000;
    case "TAMPER":
      return 250;
    default:
      return 0;
  }
}

// --------------------------------------------------------------------------
// Operational Ranger-Friendly Formatting Helpers (Clean & Decluttered)
// --------------------------------------------------------------------------

export function formatAirQuality(vocGas: number, threat?: ThreatCategory): { label: string; status: "normal" | "warning" | "critical" } {
  if (threat === "FOREST_FIRE" || vocGas < 25) {
    return { label: "⚠️ Smoke / Fire Precursor Detected", status: "critical" };
  }
  if (vocGas < 75) {
    return { label: "Trace Smoke / Elevated Fumes", status: "warning" };
  }
  return { label: "Normal (Clear Air)", status: "normal" };
}

export function formatWeatherPressure(pressure: number): string {
  const rounded = Math.round(pressure);
  return `${rounded} hPa (Stable)`;
}

export function formatBatteryBackup(battery: number): string {
  const estimatedDays = Math.max(1, Math.round((battery / 100) * 14));
  return `${battery}% • ~${estimatedDays} Days Backup`;
}

export function formatStationNetwork(status: string, rssi: number): { label: string; isConnected: boolean } {
  if (status === "OFFLINE") {
    return { label: "Offline • Signal Lost", isConnected: false };
  }
  if (rssi > -80) {
    return { label: "Connected • Strong Mesh Signal", isConnected: true };
  }
  return { label: "Connected • Moderate Signal", isConnected: true };
}

export function getRecommendedAction(threat: ThreatCategory): string {
  switch (threat) {
    case "FOREST_FIRE":
      return "Immediate Dispatch: Fire Response Unit & Thermal Recon Drone for firebreak containment.";
    case "CHAINSAW":
      return "Deploy Armed Patrol Team to intercept illegal timber felling and secure perimeter.";
    case "GUNSHOT":
      return "Immediate Intercept: Anti-Poaching Quick Response Team to track gunshot origin.";
    case "TAMPER":
      return "Send Beat Ranger to inspect station mount, sensor enclosure, and perimeter integrity.";
    default:
      return "Continue regular beat patrol and sensor health monitoring.";
  }
}

export function getThreatHeadingSimple(threat: ThreatCategory, confidence: number = 95): string {
  switch (threat) {
    case "FOREST_FIRE":
      return `🔥 Smoke & Heat Anomaly Detected (${confidence.toFixed(0)}% Confidence)`;
    case "CHAINSAW":
      return `⚠️ Sound Match: Active Chainsaw Detected (${confidence.toFixed(0)}% Confidence)`;
    case "GUNSHOT":
      return `🔊 Acoustic Shock: Gunshot Sound Detected (${confidence.toFixed(0)}% Confidence)`;
    case "TAMPER":
      return `🚨 Station Alert: Device Movement / Station Tilt Detected`;
    default:
      return "Station Operational • Normal Baseline";
  }
}
