"use client";

import React, { useEffect, useMemo, useState } from "react";
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Circle, 
  Polyline,
  useMap, 
  LayersControl, 
  ScaleControl 
} from "react-leaflet";
import L from "leaflet";
import { NodeData, RangerUnit, ThreatAlert, ThreatCategory } from "@/types/telemetry";
import { 
  Flame, 
  Axe, 
  Volume2, 
  AlertTriangle, 
  Radio, 
  Battery, 
  Wind, 
  Thermometer, 
  ShieldCheck, 
  Navigation,
  ExternalLink,
  MapPin,
  Compass,
  Zap,
  Cpu
} from "lucide-react";
import { soundFX } from "@/lib/audio";

interface MapInnerProps {
  nodes: NodeData[];
  selectedNode: NodeData | null;
  inspectNode?: NodeData | null;
  isSidebarOpen?: boolean;
  onSelectNode: (node: NodeData) => void;
  onOpenDrawer: (node: NodeData) => void;
  rangerUnits: RangerUnit[];
  activeAlerts: ThreatAlert[];
}

// Subcomponent to fly map view when a node is selected and auto-close popups when inspecting drawer
function MapController({ 
  selectedNode, 
  inspectNode 
}: { 
  selectedNode: NodeData | null;
  inspectNode?: NodeData | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedNode) {
      map.flyTo([selectedNode.lat, selectedNode.lng], 14, {
        animate: true,
        duration: 1.2,
      });
    }
  }, [selectedNode, map]);

  useEffect(() => {
    if (inspectNode) {
      map.closePopup();
    }
  }, [inspectNode, map]);

  return null;
}

// Subcomponent to guarantee responsive Leaflet container resize when panels toggle
function MapResizeHandler({
  isDrawerOpen,
  isSidebarOpen,
}: {
  isDrawerOpen?: boolean;
  isSidebarOpen?: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    // Invalidate size immediately on mount
    map.invalidateSize();

    const container = map.getContainer();
    if (!container) return;

    // ResizeObserver watches container bounds smoothly
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(container);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [map]);

  // Trigger invalidation on layout transitions
  useEffect(() => {
    const timer1 = setTimeout(() => map.invalidateSize(), 50);
    const timer2 = setTimeout(() => map.invalidateSize(), 300);
    const timer3 = setTimeout(() => map.invalidateSize(), 550);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isDrawerOpen, isSidebarOpen, map]);

  return null;
}

// Subcomponent for custom map buttons (Recenter)
function MapCustomControls({ defaultCenter }: { defaultCenter: [number, number] }) {
  const map = useMap();
  return (
    <div className="absolute bottom-6 right-4 z-[400] flex flex-col gap-2">
      <button
        onClick={() => {
          soundFX.playBlip();
          map.flyTo(defaultCenter, 13, { duration: 1 });
        }}
        className="p-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-white/15 text-slate-300 hover:text-white shadow-xl backdrop-blur-md transition-all flex items-center justify-center group"
        title="Recenter Map View to Jim Corbett Reserve"
      >
        <Compass className="w-5 h-5 text-emerald-400 group-hover:rotate-45 transition-transform" />
      </button>
    </div>
  );
}

export const MapInner: React.FC<MapInnerProps> = ({
  nodes,
  selectedNode,
  inspectNode,
  isSidebarOpen,
  onSelectNode,
  onOpenDrawer,
  rangerUnits,
  activeAlerts,
}) => {
  // Center coordinates for Jim Corbett National Park
  const defaultCenter: [number, number] = [29.5300, 78.7747];

  // Helper to create dynamic custom Leaflet icons with pulsing status rings
  const createNodeIcon = (node: NodeData) => {
    const isAlert = node.activeThreat !== "NONE";
    const isHardware = node.id === "Node-01" || node.id === "ST-01";
    
    const threatClass = isAlert 
      ? "marker-pulse-red" 
      : node.status === "DEGRADED" 
        ? "marker-pulse-amber" 
        : isHardware 
          ? "marker-pulse-green ring-2 ring-cyan-400/60 shadow-lg shadow-cyan-500/50" 
          : "marker-pulse-green";

    const statusDot = isAlert ? "#f43f5e" : isHardware ? "#06b6d4" : "#10b981";
    const shortId = node.id.replace("Node-0", "ST-").replace("Node-", "ST-");

    const hardwareTag = isHardware ? `
      <div style="
        position: absolute;
        top: -18px;
        white-space: nowrap;
        background: rgba(6, 182, 212, 0.95);
        color: #080e14;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 9px;
        font-weight: 800;
        padding: 1px 6px;
        border-radius: 9999px;
        box-shadow: 0 0 10px rgba(6, 182, 212, 0.6);
        display: flex;
        align-items: center;
        gap: 3px;
      ">
        <span>⚡ ESP32 Live Hardware</span>
      </div>
    ` : "";

    return L.divIcon({
      className: "custom-node-marker",
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          ${hardwareTag}
          <div class="${threatClass}">
            <span style="font-size: 15px;">${isAlert ? "⚠️" : isHardware ? "⚡" : "📡"}</span>
            <div style="
              position: absolute; 
              bottom: -22px; 
              white-space: nowrap; 
              background: rgba(15, 23, 42, 0.95); 
              border: 1px solid ${isHardware ? "rgba(6, 182, 212, 0.5)" : "rgba(255, 255, 255, 0.15)"}; 
              color: #f1f5f9; 
              font-family: 'Plus Jakarta Sans', sans-serif; 
              font-size: 11px; 
              font-weight: 600; 
              padding: 2px 8px; 
              border-radius: 9999px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.5);
              display: flex;
              align-items: center;
              gap: 4px;
            ">
              <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:${statusDot};"></span>
              ${shortId}
            </div>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      popupAnchor: [0, -22],
    });
  };

  // Create customized tactical icons for ranger assets with readable micro-badges
  const createRangerIcon = (ranger: RangerUnit) => {
    const isDrone = ranger.id.includes("DRONE");
    const isVehicle = ranger.id.includes("BRAVO");
    const emoji = isDrone ? "🛸" : isVehicle ? "🚙" : "🥾";
    const borderColor = isDrone ? "#38bdf8" : isVehicle ? "#f59e0b" : "#10b981";
    const bgGlow = isDrone ? "rgba(56, 189, 248, 0.25)" : isVehicle ? "rgba(245, 158, 11, 0.25)" : "rgba(16, 185, 129, 0.25)";
    
    // Callout labels per requirement 4
    const label = isVehicle 
      ? "Patrol Unit Alpha (4WD)" 
      : isDrone 
        ? "SkyEye Drone (Patrol Sector 2)" 
        : "Dhikala Foot Patrol (4 Rangers)";

    return L.divIcon({
      className: "custom-ranger-marker",
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; pointer-events: auto;">
          <div style="
            position: absolute;
            top: -20px;
            white-space: nowrap; 
            background: rgba(15, 23, 42, 0.95); 
            border: 1px solid ${borderColor}; 
            color: #f1f5f9; 
            font-family: 'Plus Jakarta Sans', sans-serif; 
            font-size: 10px; 
            font-weight: 700; 
            padding: 1.5px 7px; 
            border-radius: 9999px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.6);
            display: flex;
            align-items: center;
            gap: 3px;
          ">
            <span>${label}</span>
          </div>
          <div style="
            width: 36px; 
            height: 36px; 
            background: ${bgGlow}; 
            border: 2px solid ${borderColor}; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            box-shadow: 0 0 15px ${borderColor};
            transition: transform 0.2s ease;
          ">
            <span style="font-size: 15px;">${emoji}</span>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -22],
    });
  };

  // Node coordinate lookup for visual LoRa mesh topology
  const nodeMap = useMemo(() => {
    const map = new Map<string, NodeData>();
    nodes.forEach((n) => {
      map.set(n.id, n);
      if (n.id === "Node-01") map.set("ST-01", n);
      if (n.id === "Node-02") map.set("ST-02", n);
      if (n.id === "Node-03") map.set("ST-03", n);
      if (n.id === "Node-04") map.set("ST-04", n);
    });
    return map;
  }, [nodes]);

  const n1 = nodeMap.get("Node-01") || nodeMap.get("ST-01") || nodes[0];
  const n2 = nodeMap.get("Node-02") || nodeMap.get("ST-02") || nodes[1];
  const n3 = nodeMap.get("Node-03") || nodeMap.get("ST-03") || nodes[2];
  const n4 = nodeMap.get("Node-04") || nodeMap.get("ST-04") || nodes[3];

  const meshSegments = useMemo(() => {
    const segs: [number, number][][] = [];
    if (n1 && n2) segs.push([[n1.lat, n1.lng], [n2.lat, n2.lng]]);
    if (n1 && n3) segs.push([[n1.lat, n1.lng], [n3.lat, n3.lng]]);
    if (n3 && n4) segs.push([[n3.lat, n3.lng], [n4.lat, n4.lng]]);
    return segs;
  }, [n1, n2, n3, n4]);

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        className="w-full h-full z-10"
        zoomControl={false}
      >
        <MapController selectedNode={selectedNode} inspectNode={inspectNode} />
        <MapResizeHandler isDrawerOpen={Boolean(inspectNode)} isSidebarOpen={isSidebarOpen} />
        <MapCustomControls defaultCenter={defaultCenter} />
        <ScaleControl position="bottomleft" />

        <LayersControl position="topleft">
          <LayersControl.BaseLayer checked name="🛰️ Satellite (Esri)">
            <TileLayer
              attribution="Tiles &copy; Esri"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="🌑 Clean Dark (CartoDB)">
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="🗺️ Topographic (OpenTopo)">
            <TileLayer
              attribution='&copy; OpenStreetMap & SRTM'
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              maxZoom={17}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* 1. Visual LoRa Mesh Topology Lines (ST-1 -> ST-2, ST-1 -> ST-3, ST-3 -> ST-4) */}
        {meshSegments.map((seg, idx) => (
          <Polyline
            key={`mesh-link-${idx}`}
            positions={seg}
            pathOptions={{
              color: "#10b981",
              weight: 2.5,
              opacity: 0.55,
              dashArray: "6, 8",
            }}
          >
            <Popup>
              <div className="text-xs p-1 text-slate-200">
                <strong className="text-emerald-400 block font-semibold">LoRa Mesh Backhaul Link</strong>
                <span className="text-[11px] text-slate-400">Sub-GHz IN865 (865.2 MHz) • Non-Line-of-Sight</span>
              </div>
            </Popup>
          </Polyline>
        ))}

        {/* 2. Dynamic 500m Threat Radius Pulsing Circles */}
        {nodes.map((node) => {
          if (node.activeThreat !== "NONE") {
            const isFire = node.activeThreat === "FOREST_FIRE";
            const isGunshot = node.activeThreat === "GUNSHOT";
            const circleColor = isFire ? "#f43f5e" : isGunshot ? "#fb7185" : "#f59e0b";
            const radius = node.threatRadius && node.threatRadius > 0 ? node.threatRadius : 500;

            return (
              <Circle
                key={`threat-circle-${node.id}`}
                center={[node.lat, node.lng]}
                radius={radius}
                pathOptions={{
                  color: circleColor,
                  fillColor: circleColor,
                  fillOpacity: 0.25,
                  weight: 2.5,
                  dashArray: "6, 6",
                  className: "leaflet-threat-circle",
                }}
              >
                <Popup>
                  <div className="text-xs text-slate-100 p-1">
                    <div className="font-bold text-rose-400 flex items-center gap-1.5 mb-1">
                      <Flame className="w-4 h-4" />
                      Active Threat Radius: {radius}m
                    </div>
                    <p className="text-[11px] text-slate-300">
                      {node.activeThreat.replace("_", " ")} dispersion radius around {node.name}.
                    </p>
                  </div>
                </Popup>
              </Circle>
            );
          }
          return null;
        })}

        {/* 3. Sentinel Station Node Markers */}
        {nodes.map((node) => {
          const isAlert = node.activeThreat !== "NONE";
          const isHardware = node.id === "Node-01" || node.id === "ST-01";

          return (
            <Marker
              key={node.id}
              position={[node.lat, node.lng]}
              icon={createNodeIcon(node)}
              eventHandlers={{
                click: () => {
                  soundFX.playBlip();
                  onSelectNode(node);
                },
              }}
            >
              <Popup>
                <div className="text-xs w-64 text-slate-100 font-sans p-1">
                  {/* Header: Node-01 (Dhikala Ridge) + Status */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                    <span className="font-bold text-white text-xs">
                      {node.id} ({node.name.replace("Post", "").trim()})
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isAlert 
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" 
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    }`}>
                      {isAlert ? "⚠️ Threat Alert" : "🟢 Healthy"}
                    </span>
                  </div>

                  {/* Hardware Sentinel Indicator Badge */}
                  {isHardware && (
                    <div className="mb-2 p-1.5 rounded-lg bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 font-bold text-[10px] flex items-center justify-center gap-1.5 shadow-sm">
                      <Zap className="w-3 h-3 text-cyan-400" />
                      <span>ESP32 Live Hardware Gateway (ST-01)</span>
                    </div>
                  )}

                  {/* 3 Essential Human Metrics */}
                  <div className="space-y-1.5 bg-slate-900/80 p-2 rounded-xl border border-white/5 text-[11px] mb-2.5">
                    {/* Metric 1: Temp & Humidity */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">🌡️ Temp &amp; Hum:</span>
                      <strong className="text-white font-medium">
                        {node.telemetry.temp.toFixed(1)}°C • {node.telemetry.humidity.toFixed(0)}%
                      </strong>
                    </div>

                    {/* Metric 2: Air Quality */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">💨 Air Quality:</span>
                      <strong className={`font-medium ${isAlert && node.activeThreat === "FOREST_FIRE" ? "text-rose-400" : "text-emerald-400"}`}>
                        {isAlert && node.activeThreat === "FOREST_FIRE" ? "Smoke Detected" : "Clean Air (Normal)"}
                      </strong>
                    </div>

                    {/* Metric 3: Battery */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">🔋 Battery:</span>
                      <strong className="text-emerald-400 font-medium">
                        {node.telemetry.battery}% (Solar Active)
                      </strong>
                    </div>
                  </div>

                  {/* Action Button: View Full Telemetry */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      soundFX.playBlip();
                      onOpenDrawer(node);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View Full Telemetry
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 4. Patrol Tactical Assets */}
        {rangerUnits.map((ranger) => (
          <Marker
            key={ranger.id}
            position={[ranger.lat, ranger.lng]}
            icon={createRangerIcon(ranger)}
          >
            <Popup>
              <div className="text-xs text-slate-100 p-1 w-56 font-sans">
                <div className="font-bold text-sky-300 flex items-center gap-1.5 mb-1 text-xs">
                  <Navigation className="w-3.5 h-3.5 text-sky-400" />
                  {ranger.callsign}
                </div>
                <div className="flex items-center justify-between text-xs bg-slate-900 p-2 rounded-lg border border-white/5 mt-1">
                  <span className="text-slate-400">Status:</span>
                  <span className={`font-semibold ${ranger.status === "EN_ROUTE" ? "text-amber-400 animate-pulse" : "text-emerald-400"}`}>
                    {ranger.status}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating Tactical Location & Mesh Badge */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 text-xs">
        <div className="px-3 py-1 rounded-full bg-slate-950/85 border border-white/15 text-slate-200 backdrop-blur-md flex items-center gap-2 shadow-xl text-[11px] font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span>Jim Corbett National Park • LoRa Mesh Active</span>
        </div>
      </div>
    </div>
  );
};
