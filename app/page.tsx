"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { TopMetricsRibbon } from "@/components/TopMetricsRibbon";
import { SatelliteMap } from "@/components/Map/SatelliteMap";
import { AlertsFeed } from "@/components/AlertsFeed";
import { SimulationPanel } from "@/components/SimulationPanel";
import { IncidentModal } from "@/components/IncidentModal";
import { NodeTelemetryDrawer } from "@/components/NodeTelemetryDrawer";
import { NodeData, ThreatAlert, ThreatLevel, RangerUnit } from "@/types/telemetry";
import { INITIAL_NODES, INITIAL_ALERTS, RANGER_UNITS, calculateThreatLevel } from "@/lib/store";
import { soundFX } from "@/lib/audio";
import { SlidersHorizontal, ShieldAlert, Radio, Sparkles, MapPin } from "lucide-react";

export default function RangerCommandDashboard() {
  const [nodes, setNodes] = useState<NodeData[]>(INITIAL_NODES);
  const [alerts, setAlerts] = useState<ThreatAlert[]>(INITIAL_ALERTS);
  const [rangerUnits, setRangerUnits] = useState<RangerUnit[]>(RANGER_UNITS);
  const [threatLevel, setThreatLevel] = useState<ThreatLevel>("LOW");
  
  // UI Selection & Modal states
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [inspectNode, setInspectNode] = useState<NodeData | null>(null);
  const [activeIncidentModal, setActiveIncidentModal] = useState<ThreatAlert | null>(null);
  const [isSimOpen, setIsSimOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  const prevAlertCount = useRef<number>(INITIAL_ALERTS.length);
  const prevAlertId = useRef<string | null>(null);

  // Sync state from GET /api/telemetry
  const fetchTelemetry = useCallback(async () => {
    try {
      const res = await fetch("/api/telemetry");
      if (res.ok) {
        const data = await res.json();
        if (data.nodes) {
          setNodes(data.nodes);
          // Keep inspectNode and selectedNode synced in real time
          setInspectNode((prev) => {
            if (!prev) return null;
            return data.nodes.find((n: NodeData) => n.id.toLowerCase() === prev.id.toLowerCase()) || prev;
          });
          setSelectedNode((prev) => {
            if (!prev) return null;
            return data.nodes.find((n: NodeData) => n.id.toLowerCase() === prev.id.toLowerCase()) || prev;
          });
        }
        if (data.alerts) {
          setAlerts(data.alerts);
          // Check for active incoming threat alerts
          const latestActive = data.alerts.find((a: ThreatAlert) => a.status === "ACTIVE" && a.threat !== "NONE");
          if (latestActive && (data.alerts.length > prevAlertCount.current || latestActive.id !== prevAlertId.current)) {
            soundFX.playThreatAlarm();
            setActiveIncidentModal(latestActive);
            prevAlertId.current = latestActive.id;
          }
          prevAlertCount.current = data.alerts.length;
        }
        if (data.metrics?.threatLevel) {
          setThreatLevel(data.metrics.threatLevel);
        }
      }
    } catch {
      // Fallback in case of local network disruption
    }
  }, []);

  // Periodic fast polling (1 second) for real-time live telemetry stream
  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 1000);
    return () => clearInterval(interval);
  }, [fetchTelemetry]);

  // Update overall threat level dynamically
  useEffect(() => {
    setThreatLevel(calculateThreatLevel(nodes, alerts));
  }, [nodes, alerts]);

  // Handle Mute audio
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundFX.setMuted(nextMuted);
  };

  // Handle Dispatch Ranger Unit
  const handleDispatch = async (alertId: string, unitId?: string) => {
    soundFX.playDispatchChirp();
    const chosenUnit = unitId 
      ? rangerUnits.find(u => u.id === unitId) 
      : rangerUnits.find(u => u.status === "AVAILABLE") || rangerUnits[0];

    const unitCallsign = chosenUnit?.callsign || "Unit Alpha";

    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id === alertId) {
          return {
            ...a,
            status: "DISPATCHED",
            dispatchedUnit: unitCallsign,
            dispatchedAt: "Just now",
          };
        }
        return a;
      })
    );

    if (chosenUnit) {
      setRangerUnits((prev) =>
        prev.map((u) =>
          u.id === chosenUnit.id
            ? { ...u, status: "EN_ROUTE", assignedIncidentId: alertId }
            : u
        )
      );
    }

    if (activeIncidentModal?.id === alertId) {
      setActiveIncidentModal(null);
    }

    try {
      await fetch("/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alertId,
          status: "DISPATCHED",
          dispatchedUnit: unitCallsign,
        }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Acknowledge Alert
  const handleAcknowledge = async (alertId: string) => {
    soundFX.playAcknowledgeTone();
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId ? { ...a, status: "ACKNOWLEDGED" } : a
      )
    );
    if (activeIncidentModal?.id === alertId) {
      setActiveIncidentModal(null);
    }

    try {
      await fetch("/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alertId,
          status: "ACKNOWLEDGED",
        }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Select node by ID from alert feed
  const handleSelectNodeById = (nodeId: string) => {
    const found = nodes.find((n) => n.id.toLowerCase() === nodeId.toLowerCase());
    if (found) {
      setSelectedNode(found);
    }
  };

  // Trigger simulation presets
  const handleTriggerPreset = async (preset: "FIRE" | "CHAINSAW" | "GUNSHOT" | "TAMPER" | "RESET") => {
    setIsLoading(true);
    soundFX.playBlip();

    try {
      if (preset === "RESET") {
        // Reset all nodes to normal
        for (const n of nodes) {
          await fetch("/api/telemetry", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nodeId: n.id,
              threat: "NONE",
              confidence: 0,
              temp: 29.4,
              hum: 62.0,
              voc: 120.0,
            }),
          });
        }
        setAlerts((prev) => prev.map((a) => ({ ...a, status: "RESOLVED" })));
        setRangerUnits(RANGER_UNITS);
        setActiveIncidentModal(null);
        await fetchTelemetry();
        setIsLoading(false);
        return;
      }

      let payload: Record<string, unknown> = {};

      if (preset === "FIRE") {
        payload = {
          nodeId: "Node-02",
          threat: "FOREST_FIRE",
          temp: 58.4,
          hum: 22.0,
          voc: 8.4,
          confidence: 97.4,
        };
      } else if (preset === "CHAINSAW") {
        payload = {
          nodeId: "Node-01",
          threat: "CHAINSAW",
          temp: 30.2,
          hum: 59.0,
          voc: 115.0,
          confidence: 94.6,
        };
      } else if (preset === "GUNSHOT") {
        payload = {
          nodeId: "Node-03",
          threat: "GUNSHOT",
          temp: 28.5,
          hum: 64.0,
          voc: 132.0,
          confidence: 99.2,
        };
      } else if (preset === "TAMPER") {
        payload = {
          nodeId: "Node-04",
          threat: "TAMPER",
          temp: 29.8,
          hum: 61.0,
          voc: 126.0,
          confidence: 91.8,
        };
      }

      const res = await fetch("/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.newAlert) {
          soundFX.playThreatAlarm();
          setActiveIncidentModal(data.newAlert);
        }
        await fetchTelemetry();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Send custom arbitrary telemetry payload
  const handleSendCustomPayload = async (payload: Record<string, unknown>) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.newAlert) {
          soundFX.playThreatAlarm();
          setActiveIncidentModal(data.newAlert);
        }
        await fetchTelemetry();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const activeNodesCount = nodes.filter((n) => n.status === "ONLINE").length;
  const activeAlertsCount = alerts.filter((a) => a.status === "ACTIVE").length;

  return (
    <main className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 forest-ambient-bg font-sans">
      {/* 1. Top Metrics Ribbon */}
      <TopMetricsRibbon
        activeNodesCount={activeNodesCount}
        totalNodesCount={nodes.length}
        threatLevel={threatLevel}
        meshStatus="CONNECTED (IN865 / 865.2 MHz / SF7)"
        powerHealth="98% Solar / LiFePO4 Nominal"
        isSimOpen={isSimOpen}
        onToggleSim={() => setIsSimOpen((prev) => !prev)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onResetAll={() => handleTriggerPreset("RESET")}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      {/* 2. Main Workstation Body: Satellite Map + Threat Feed Sidebar */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Full Satellite Map View */}
        <div className="flex-1 h-full w-full relative">
          <SatelliteMap
            nodes={nodes}
            selectedNode={selectedNode}
            inspectNode={inspectNode}
            isSidebarOpen={isSidebarOpen}
            onSelectNode={(node) => setSelectedNode(node)}
            onOpenDrawer={(node) => {
              setSelectedNode(null);
              setInspectNode(node);
            }}
            rangerUnits={rangerUnits}
            activeAlerts={alerts}
          />

          {/* Quick Floating Station Switcher (Bottom-Left) */}
          <div className="absolute bottom-6 left-6 z-[400] hidden sm:flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 border border-white/10 shadow-xl backdrop-blur-md">
            <span className="text-[11px] text-slate-400 font-medium px-2 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400" />
              Stations:
            </span>
            {nodes.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  soundFX.playBlip();
                  setSelectedNode(n);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                  selectedNode?.id === n.id
                    ? "bg-emerald-500 text-slate-950 shadow-sm"
                    : n.activeThreat !== "NONE"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      : "bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700"
                }`}
              >
                {n.id.replace("Node-0", "ST-").replace("Node-", "ST-")}
              </button>
            ))}
          </div>

          {/* Floating Collapsed Feed Toggle Pill (Top-Right under Map Info) */}
          {!isSidebarOpen && (
            <button
              onClick={() => {
                soundFX.playBlip();
                setIsSidebarOpen(true);
              }}
              className="absolute top-16 right-4 z-[400] flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/95 hover:bg-slate-800 border border-white/15 text-white shadow-xl backdrop-blur-md transition-all text-xs font-medium"
            >
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <span>Show Incident Feed</span>
              {activeAlertsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-slate-950 font-bold text-[10px]">
                  {activeAlertsCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Live Threat Alerts Feed Sidebar */}
        <AlertsFeed
          alerts={alerts}
          onDispatch={(alertId) => handleDispatch(alertId)}
          onAcknowledge={(alertId) => handleAcknowledge(alertId)}
          onSelectNodeById={handleSelectNodeById}
          onOpenModal={(alert) => setActiveIncidentModal(alert)}
          isCollapsed={!isSidebarOpen}
          onToggleCollapse={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* 3. Floating Collapsible Simulation Panel */}
      <SimulationPanel
        isOpen={isSimOpen}
        onClose={() => setIsSimOpen(false)}
        onTriggerPreset={handleTriggerPreset}
        onSendCustomPayload={handleSendCustomPayload}
        isLoading={isLoading}
      />

      {/* 4. Critical Incident Emergency Modal */}
      <IncidentModal
        alert={activeIncidentModal}
        rangerUnits={rangerUnits}
        onClose={() => setActiveIncidentModal(null)}
        onDispatchUnit={(alertId, unitId) => handleDispatch(alertId, unitId)}
        onAcknowledge={(alertId) => handleAcknowledge(alertId)}
      />

      {/* 5. Detailed Node Telemetry Drawer */}
      <NodeTelemetryDrawer
        node={inspectNode}
        onClose={() => setInspectNode(null)}
      />
    </main>
  );
}
