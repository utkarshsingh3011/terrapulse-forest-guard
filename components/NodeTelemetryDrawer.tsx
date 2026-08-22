"use client";

import React from "react";
import { NodeData } from "@/types/telemetry";
import { 
  X, 
  Radio, 
  Thermometer, 
  Wind, 
  Battery, 
  Cpu, 
  MapPin, 
  ShieldCheck
} from "lucide-react";
import { soundFX } from "@/lib/audio";
import { getRecommendedAction } from "@/lib/store";

interface NodeTelemetryDrawerProps {
  node: NodeData | null;
  onClose: () => void;
}

export const NodeTelemetryDrawer: React.FC<NodeTelemetryDrawerProps> = ({
  node,
  onClose,
}) => {
  if (!node) return null;

  const isAlert = node.activeThreat !== "NONE";
  const recommendedAction = getRecommendedAction(node.activeThreat);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-slate-950/98 border-l border-white/10 shadow-2xl backdrop-blur-2xl flex flex-col font-sans text-xs animate-in slide-in-from-right duration-300">
      {/* Drawer Header */}
      <div className="p-4 bg-slate-900/70 border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-white text-sm">{node.id}: {node.name}</h2>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                isAlert
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse"
                  : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25"
              }`}>
                {isAlert ? "Threat Active" : "Online"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">{node.sector} • Elevation {node.elevation}m</p>
          </div>
        </div>

        <button
          onClick={() => {
            soundFX.playBlip();
            onClose();
          }}
          className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Close Drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Body: 4 Streamlined Metric Cards */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-slate-300">
        {/* GPS Location Bar */}
        <div className="bg-slate-900/70 px-3.5 py-2.5 rounded-xl border border-white/5 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Beat Sector: <strong className="text-slate-200">{node.sector}</strong></span>
          </div>
          <span className="font-mono text-slate-400">{node.lat.toFixed(4)}°N, {node.lng.toFixed(4)}°E</span>
        </div>

        {/* Card 1: Temperature & Humidity (DHT11) */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <Thermometer className="w-4 h-4 text-rose-400" />
              <span>Temperature &amp; Humidity (DHT11)</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              node.telemetry.temp > 45 
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" 
                : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
            }`}>
              {node.telemetry.temp > 45 ? "Thermal Anomaly" : "Normal Canopy Range"}
            </span>
          </div>
          <div className="text-base font-bold text-white">
            {node.telemetry.temp.toFixed(1)}°C • {node.telemetry.humidity.toFixed(0)}% RH
          </div>
        </div>

        {/* Card 2: Smoke & Gas Precursor (MQ-2) */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <Wind className="w-4 h-4 text-amber-400" />
              <span>Smoke &amp; Gas Precursor (MQ-2)</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              node.activeThreat === "FOREST_FIRE"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse"
                : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
            }`}>
              {node.activeThreat === "FOREST_FIRE" ? "Pre-Ignition Volatiles" : "No Combustion Precursor"}
            </span>
          </div>
          <div className={`text-base font-bold ${node.activeThreat === "FOREST_FIRE" ? "text-rose-400" : "text-emerald-400"}`}>
            {node.activeThreat === "FOREST_FIRE" ? "Smoke Anomaly Detected" : "Clean Air (Baseline)"}
          </div>
        </div>

        {/* Card 3: LoRa Signal & Battery (Mesh Link) */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <Battery className="w-4 h-4 text-emerald-400" />
              <span>LoRa Signal &amp; Battery (Mesh Link)</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              Solar Charging Active ({node.solarInputWatts}W)
            </span>
          </div>
          <div className="text-base font-bold text-white">
            {node.telemetry.battery}% Battery • Strong Link ({node.telemetry.rssi} dBm)
          </div>
        </div>

        {/* Card 4: Acoustic Edge AI (YAMNet Live Status) */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>Acoustic Edge AI (YAMNet Live Status)</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              node.activeThreat !== "NONE"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                : "bg-purple-500/10 text-purple-300 border border-purple-500/20"
            }`}>
              {node.activeThreat !== "NONE" ? "Threat Classification Active" : "Microphone Active"}
            </span>
          </div>
          <div className={`text-base font-bold ${node.activeThreat !== "NONE" ? "text-amber-300" : "text-slate-200"}`}>
            {node.activeThreat === "NONE" 
              ? "Ambient Baseline" 
              : `${node.activeThreat.replace("_", " ")} (${node.threatConfidence.toFixed(0)}% Match)`}
          </div>
        </div>

        {/* Duty Ranger Protocol */}
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
          <div className="text-xs text-emerald-300 font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Operating Protocol
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {recommendedAction}
          </p>
        </div>
      </div>

      {/* Drawer Footer */}
      <div className="p-3 bg-slate-900/70 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
        <span>Station ID: <strong className="text-white font-semibold">{node.id}</strong></span>
        <span>Last Ping: <strong className="text-slate-200">{node.lastSeen}</strong></span>
      </div>
    </div>
  );
};
