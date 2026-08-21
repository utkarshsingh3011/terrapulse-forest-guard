"use client";

import React from "react";
import { NodeData } from "@/types/telemetry";
import { 
  X, 
  Radio, 
  Thermometer, 
  Wind, 
  Battery, 
  Gauge, 
  SunMedium, 
  MapPin,
  ShieldCheck, 
  Zap,
  Activity,
  TrendingUp,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { soundFX } from "@/lib/audio";
import { 
  formatAirQuality, 
  formatWeatherPressure, 
  formatBatteryBackup, 
  formatStationNetwork,
  getRecommendedAction
} from "@/lib/store";

interface NodeTelemetryDrawerProps {
  node: NodeData | null;
  onClose: () => void;
}

export const NodeTelemetryDrawer: React.FC<NodeTelemetryDrawerProps> = ({
  node,
  onClose,
}) => {
  if (!node) return null;

  const airQuality = formatAirQuality(node.telemetry.vocGas, node.activeThreat);
  const pressureText = formatWeatherPressure(node.telemetry.pressure);
  const batteryText = formatBatteryBackup(node.telemetry.battery);
  const networkText = formatStationNetwork(node.status, node.telemetry.rssi);
  const recommendedAction = getRecommendedAction(node.activeThreat);

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[480px] bg-slate-950/95 border-l border-white/10 shadow-2xl backdrop-blur-2xl flex flex-col font-sans text-xs animate-in slide-in-from-right duration-300">
      {/* Drawer Header */}
      <div className="p-5 bg-slate-900/60 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-white text-base">{node.id}: {node.name}</h2>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                node.activeThreat !== "NONE"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse"
                  : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25"
              }`}>
                {node.activeThreat !== "NONE" ? "Threat Active" : "Station Online"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{node.sector} • Elevation {node.elevation}m</p>
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

      {/* Drawer Body: 4 Clean Human-Readable Cards */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 text-slate-300">
        {/* Beat Location & GPS Card */}
        <div className="bg-slate-900/70 p-3.5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium">BEAT PATROL SECTOR</div>
              <div className="font-semibold text-white text-xs">{node.sector}</div>
            </div>
          </div>
          <div className="text-right text-xs text-slate-300 font-mono">
            {node.lat.toFixed(4)}° N, {node.lng.toFixed(4)}° E
          </div>
        </div>

        {/* 4 Clean Metric Cards */}
        <div className="space-y-3">
          <h3 className="text-slate-300 font-semibold text-xs flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            Station Operational Telemetry
          </h3>

          {/* Card 1: Temperature & Humidity */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 flex items-center gap-3.5 hover:border-white/10 transition-all">
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Thermometer className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="text-[11px] text-slate-400 font-medium">Temperature &amp; Humidity</div>
              <div className="text-base font-bold text-white mt-0.5">
                {node.telemetry.temp.toFixed(1)}°C • {node.telemetry.humidity.toFixed(0)}% Relative Humidity
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Forest Canopy Atmosphere: Stable &amp; Normal</div>
            </div>
          </div>

          {/* Card 2: Smoke / Air Quality */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 flex items-center gap-3.5 hover:border-white/10 transition-all">
            <div className={`p-3 rounded-xl border ${
              airQuality.status === "critical"
                ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
            }`}>
              <Wind className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="text-[11px] text-slate-400 font-medium">Air Quality &amp; Thermal Precursor</div>
              <div className={`text-base font-bold mt-0.5 ${
                airQuality.status === "critical" ? "text-rose-400" : "text-emerald-400"
              }`}>
                {airQuality.label}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Environmental Gas Index: Clear Baseline</div>
            </div>
          </div>

          {/* Card 3: Battery & Power Backup */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 flex items-center gap-3.5 hover:border-white/10 transition-all">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Battery className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="text-[11px] text-slate-400 font-medium">Battery &amp; Solar Power</div>
              <div className="text-base font-bold text-emerald-400 mt-0.5">
                {batteryText}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                <SunMedium className="w-3.5 h-3.5 text-amber-400" />
                <span>Solar Array: {node.solarInputWatts}W Active Generation</span>
              </div>
            </div>
          </div>

          {/* Card 4: Station Mesh Network */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 flex items-center gap-3.5 hover:border-white/10 transition-all">
            <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Radio className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="text-[11px] text-slate-400 font-medium">Station Mesh Network &amp; Barometer</div>
              <div className="text-base font-bold text-sky-400 mt-0.5">
                {networkText.label}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Gauge className="w-3.5 h-3.5 text-slate-400" />
                <span>Atmospheric Barometer: {pressureText}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 10-Minute Trend History */}
        {node.history && node.history.length > 0 && (
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/5 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                Recent 10-Minute Trend Stability
              </span>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Nominal
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {node.history.map((h, i) => (
                <div key={i} className="p-2 rounded-xl bg-slate-950/60 border border-white/5 text-center">
                  <div className="text-[10px] text-slate-400">{h.timestamp}</div>
                  <div className="font-semibold text-xs text-white mt-0.5">{h.temp.toFixed(1)}°</div>
                  <div className="text-[10px] text-slate-400">{h.humidity.toFixed(0)}%</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Duty Ranger Recommended Protocol */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-1.5">
          <div className="text-xs text-emerald-300 font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Duty Ranger Operating Protocol
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            {recommendedAction}
          </p>
        </div>
      </div>

      {/* Drawer Footer */}
      <div className="p-4 bg-slate-900/60 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
        <span>Station ID: <strong className="text-white font-semibold">{node.id}</strong></span>
        <span>Last Ping: <strong className="text-slate-200">{node.lastSeen}</strong></span>
      </div>
    </div>
  );
};

