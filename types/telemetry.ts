export type ThreatCategory = 
  | "NONE"
  | "FOREST_FIRE"
  | "CHAINSAW"
  | "GUNSHOT"
  | "TAMPER";

export type ThreatLevel = "LOW" | "ELEVATED" | "CRITICAL";

export type IncidentStatus = "ACTIVE" | "DISPATCHED" | "ACKNOWLEDGED" | "RESOLVED";

export interface BME680Telemetry {
  temp: number;       // °C (e.g. 29.4)
  humidity: number;   // % (e.g. 62)
  vocGas: number;     // kΩ (e.g. 120)
  pressure: number;   // hPa (e.g. 1012.4)
  battery: number;    // % (e.g. 94)
  rssi: number;       // dBm (e.g. -78)
  snr?: number;       // dB (e.g. 9.5)
}

export interface NodeData {
  id: string;                // e.g. "Node-01"
  name: string;              // e.g. "Dhikala Ridge Post"
  sector: string;            // e.g. "Dhikala Core Zone"
  lat: number;
  lng: number;
  elevation: number;         // meters
  status: "ONLINE" | "DEGRADED" | "OFFLINE";
  telemetry: BME680Telemetry;
  activeThreat: ThreatCategory;
  threatConfidence: number;  // 0 - 100%
  threatRadius: number;      // in meters
  lastSeen: string;
  solarInputWatts: number;
  history?: {
    timestamp: string;
    temp: number;
    humidity: number;
    vocGas: number;
  }[];
}

export interface ThreatAlert {
  id: string;
  nodeId: string;
  nodeName: string;
  sector: string;
  threat: ThreatCategory;
  confidence: number;
  timestamp: string;
  status: IncidentStatus;
  dispatchedUnit?: string;
  dispatchedAt?: string;
  lat: number;
  lng: number;
  temp: number;
  humidity: number;
  vocGas: number;
  details?: string;
}

export interface TelemetryPayload {
  nodeId: string;
  lat?: number;
  lng?: number;
  temp?: number;
  hum?: number;
  voc?: number;
  pressure?: number;
  battery?: number;
  rssi?: number;
  threat?: string;
  confidence?: number;
}

export interface RangerUnit {
  id: string;
  callsign: string;
  team: string;
  status: "AVAILABLE" | "EN_ROUTE" | "ENGAGED";
  assignedIncidentId?: string;
  lat: number;
  lng: number;
}
