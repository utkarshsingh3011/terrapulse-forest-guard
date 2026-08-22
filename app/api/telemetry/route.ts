import { NextRequest, NextResponse } from "next/server";
import { INITIAL_NODES, INITIAL_ALERTS, mapThreatString, calculateThreatLevel, getThreatRadiusMeters } from "@/lib/store";
import { NodeData, ThreatAlert, TelemetryPayload, IncidentStatus } from "@/types/telemetry";

// Use globalThis to persist state across hot-reloads and API calls in Next.js
declare global {
  // eslint-disable-next-line no-var
  var __terrapulse_nodes: NodeData[] | undefined;
  // eslint-disable-next-line no-var
  var __terrapulse_alerts: ThreatAlert[] | undefined;
}

function getNodes(): NodeData[] {
  if (!globalThis.__terrapulse_nodes) {
    globalThis.__terrapulse_nodes = JSON.parse(JSON.stringify(INITIAL_NODES));
  }
  return globalThis.__terrapulse_nodes!;
}

function getAlerts(): ThreatAlert[] {
  if (!globalThis.__terrapulse_alerts) {
    globalThis.__terrapulse_alerts = JSON.parse(JSON.stringify(INITIAL_ALERTS));
  }
  return globalThis.__terrapulse_alerts!;
}

export async function GET() {
  const nodes = getNodes();
  const alerts = getAlerts();
  const threatLevel = calculateThreatLevel(nodes, alerts);
  const activeNodesCount = nodes.filter(n => n.status === "ONLINE").length;
  const timestamp = new Date().toISOString();

  return NextResponse.json({
    success: true,
    timestamp,
    nodes,
    alerts,
    metrics: {
      activeNodes: `${activeNodesCount}/${nodes.length} Online`,
      activeNodesCount,
      totalNodes: nodes.length,
      threatLevel,
      meshStatus: "CONNECTED (IN865 / 865.2 MHz / SF7)",
      powerGridHealth: "98% Solar / LiFePO4 Nominal",
      lastUpdated: timestamp
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    let body: (TelemetryPayload & { alertId?: string; status?: IncidentStatus; dispatchedUnit?: string; smoke?: number | string });
    try {
      body = await req.json();
    } catch {
      const rawText = await req.text();
      body = JSON.parse(rawText);
    }

    const nodes = getNodes();
    const alerts = getAlerts();
    const timestamp = new Date().toISOString();

    // 1. Handle Alert Status Update (Dispatch / Acknowledge / Resolve)
    if (body.alertId && body.status) {
      const alertIndex = alerts.findIndex(a => a.id === body.alertId);
      if (alertIndex >= 0) {
        alerts[alertIndex].status = body.status;
        if (body.dispatchedUnit) {
          alerts[alertIndex].dispatchedUnit = body.dispatchedUnit;
          alerts[alertIndex].dispatchedAt = "Just now";
        }
        
        // If the alert is marked as False Alarm (ACKNOWLEDGED) or RESOLVED, reset the node's active threat back to normal
        if (body.status === "ACKNOWLEDGED" || body.status === "RESOLVED") {
          const nodeIndex = nodes.findIndex(n => n.id === alerts[alertIndex].nodeId);
          if (nodeIndex >= 0) {
            nodes[nodeIndex].activeThreat = "NONE";
            nodes[nodeIndex].threatConfidence = 0;
            nodes[nodeIndex].threatRadius = 0;
          }
        }

        const threatLevel = calculateThreatLevel(nodes, alerts);
        return NextResponse.json({
          success: true,
          timestamp,
          message: `Alert ${body.alertId} updated to ${body.status}`,
          alert: alerts[alertIndex],
          threatLevel,
        });
      }
    }

    if (!body || !body.nodeId) {
      return NextResponse.json(
        { success: false, timestamp, error: "Missing required field: nodeId (e.g. 'ST-01' or 'Node-01') or alertId" },
        { status: 400 }
      );
    }

    const rawNodeId = body.nodeId.trim();
    const targetId = rawNodeId.toLowerCase();
    const numericPart = targetId.replace(/\D/g, "");

    const nodeIndex = nodes.findIndex(n => {
      const nId = n.id.toLowerCase();
      const nNumeric = nId.replace(/\D/g, "");
      return (
        nId === targetId ||
        nId.replace("node-", "st-") === targetId ||
        nId.replace("node-0", "st-") === targetId ||
        (numericPart && nNumeric === numericPart)
      );
    });

    const threatCategory = mapThreatString(body.threat);
    const confidence = body.confidence !== undefined ? Math.min(100, Math.max(0, body.confidence)) : (threatCategory !== "NONE" ? 92.5 : 0);

    let updatedNode: NodeData;

    if (nodeIndex >= 0) {
      const existing = nodes[nodeIndex];
      const newTemp = body.temp !== undefined ? Number(body.temp) : existing.telemetry.temp;
      const newHum = body.hum !== undefined ? Number(body.hum) : existing.telemetry.humidity;
      const newVoc = body.voc !== undefined ? Number(body.voc) : (body.smoke !== undefined ? Number(body.smoke) : existing.telemetry.vocGas);
      const newPressure = body.pressure !== undefined ? Number(body.pressure) : existing.telemetry.pressure;
      const newBattery = body.battery !== undefined ? Number(body.battery) : existing.telemetry.battery;
      const newRssi = body.rssi !== undefined ? Number(body.rssi) : existing.telemetry.rssi;
      const newLat = body.lat !== undefined ? Number(body.lat) : existing.lat;
      const newLng = body.lng !== undefined ? Number(body.lng) : existing.lng;

      const history = existing.history || [];
      const updatedHistory = [
        ...history.slice(-7),
        {
          timestamp: "Just now",
          temp: newTemp,
          humidity: newHum,
          vocGas: newVoc
        }
      ];

      updatedNode = {
        ...existing,
        lat: newLat,
        lng: newLng,
        status: "ONLINE",
        activeThreat: threatCategory,
        threatConfidence: confidence,
        threatRadius: getThreatRadiusMeters(threatCategory),
        lastSeen: "Just now",
        telemetry: {
          temp: newTemp,
          humidity: newHum,
          vocGas: newVoc,
          pressure: newPressure,
          battery: newBattery,
          rssi: newRssi,
          snr: existing.telemetry.snr
        },
        history: updatedHistory
      };

      nodes[nodeIndex] = updatedNode;
    } else {
      // Create new dynamic node if unknown nodeId is received
      updatedNode = {
        id: rawNodeId,
        name: `Station ${rawNodeId}`,
        sector: "Jim Corbett Perimeter Zone",
        lat: body.lat !== undefined ? Number(body.lat) : 29.5300 + (Math.random() - 0.5) * 0.04,
        lng: body.lng !== undefined ? Number(body.lng) : 78.7747 + (Math.random() - 0.5) * 0.04,
        elevation: 390,
        status: "ONLINE",
        activeThreat: threatCategory,
        threatConfidence: confidence,
        threatRadius: getThreatRadiusMeters(threatCategory),
        lastSeen: "Just now",
        solarInputWatts: 4.5,
        telemetry: {
          temp: body.temp !== undefined ? Number(body.temp) : 29.0,
          humidity: body.hum !== undefined ? Number(body.hum) : 60.0,
          vocGas: body.voc !== undefined ? Number(body.voc) : (body.smoke !== undefined ? Number(body.smoke) : 120.0),
          pressure: body.pressure !== undefined ? Number(body.pressure) : 1012.0,
          battery: body.battery !== undefined ? Number(body.battery) : 95,
          rssi: body.rssi !== undefined ? Number(body.rssi) : -75,
        }
      };
      nodes.push(updatedNode);
    }

    let createdAlert: ThreatAlert | null = null;

    if (threatCategory !== "NONE") {
      // Check if there is already an active alert for this node & threat category
      const existingAlertIndex = alerts.findIndex(
        a => a.nodeId === updatedNode.id && a.status === "ACTIVE" && a.threat === threatCategory
      );

      if (existingAlertIndex >= 0) {
        // Update existing active alert with latest confidence and telemetry values
        alerts[existingAlertIndex].confidence = Math.max(alerts[existingAlertIndex].confidence, confidence);
        alerts[existingAlertIndex].temp = updatedNode.telemetry.temp;
        alerts[existingAlertIndex].humidity = updatedNode.telemetry.humidity;
        alerts[existingAlertIndex].vocGas = updatedNode.telemetry.vocGas;
        alerts[existingAlertIndex].timestamp = "Just now";
        createdAlert = alerts[existingAlertIndex];
      } else {
        // Create new alert
        createdAlert = {
          id: `ALT-${Date.now().toString().slice(-6)}`,
          nodeId: updatedNode.id,
          nodeName: updatedNode.name,
          sector: updatedNode.sector,
          threat: threatCategory,
          confidence,
          timestamp: "Just now",
          status: "ACTIVE",
          lat: updatedNode.lat,
          lng: updatedNode.lng,
          temp: updatedNode.telemetry.temp,
          humidity: updatedNode.telemetry.humidity,
          vocGas: updatedNode.telemetry.vocGas,
          details: getThreatDetailMessage(threatCategory, updatedNode.telemetry, confidence)
        };

        // Add to top of alerts list
        alerts.unshift(createdAlert);
        if (alerts.length > 50) alerts.pop();
      }
    }

    const threatLevel = calculateThreatLevel(nodes, alerts);

    return NextResponse.json({
      success: true,
      timestamp,
      message: threatCategory !== "NONE" ? `Threat incident logged for ${updatedNode.id}` : `Telemetry updated for ${updatedNode.id}`,
      node: updatedNode,
      newAlert: createdAlert,
      threatLevel,
      activeNodes: `${nodes.filter(n => n.status === "ONLINE").length}/${nodes.length} Online`
    }, { status: 200 });
  } catch (error) {
    console.error("Telemetry POST error:", error);
    return NextResponse.json(
      { success: false, timestamp: new Date().toISOString(), error: "Internal server error parsing payload" },
      { status: 500 }
    );
  }
}

function getThreatDetailMessage(threat: string, tel: { temp: number; humidity: number; vocGas: number }, conf: number): string {
  const confRounded = Math.round(conf);
  switch (threat) {
    case "FOREST_FIRE":
      return `🔥 Smoke & Heat Anomaly Detected (${confRounded}% Confidence • Temp ${tel.temp.toFixed(1)}°C)`;
    case "CHAINSAW":
      return `⚠️ Sound Match: Active Chainsaw Detected (${confRounded}% Confidence)`;
    case "GUNSHOT":
      return `🔊 Acoustic Shock: Gunshot Sound Detected (${confRounded}% Confidence)`;
    case "TAMPER":
      return `🚨 Station Alert: Device Movement / Station Tilt Detected`;
    default:
      return `Station Event Detected (${confRounded}% Confidence)`;
  }
}
