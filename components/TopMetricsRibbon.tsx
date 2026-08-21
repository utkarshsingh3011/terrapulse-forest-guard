"use client";

import React, { useState, useEffect } from "react";
import { 
  TreePine,
  Clock,
  Volume2, 
  VolumeX, 
  Sparkles,
  RefreshCw,
  Cpu,
  Radio,
  SunMedium,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle
} from "lucide-react";
import { ThreatLevel } from "@/types/telemetry";
import { soundFX } from "@/lib/audio";

interface TopMetricsRibbonProps {
  activeNodesCount: number;
  totalNodesCount: number;
  threatLevel: ThreatLevel;
  meshStatus?: string;
  powerHealth?: string;
  isSimOpen: boolean;
  onToggleSim: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onResetAll?: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const TopMetricsRibbon: React.FC<TopMetricsRibbonProps> = ({
  activeNodesCount,
  totalNodesCount,
  threatLevel,
  isSimOpen,
  onToggleSim,
  isMuted,
  onToggleMute,
}) => {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getThreatStatusPill = () => {
    switch (threatLevel) {
      case "CRITICAL":
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-semibold text-xs animate-pulse">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span>🛡️ Status: Critical Threat Active</span>
          </div>
        );
      case "ELEVATED":
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-semibold text-xs">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
            </span>
            <span>🛡️ Status: Elevated Attention</span>
          </div>
        );
      case "LOW":
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold text-xs">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span>🛡️ Status: Forest Normal &amp; Secure</span>
          </div>
        );
    }
  };

  return (
    <header className="w-full bg-slate-950/90 border-b border-white/10 px-4 py-2.5 backdrop-blur-xl z-30 flex items-center justify-between gap-4 select-none shadow-sm">
      {/* 1. Brand Identity */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/25 to-teal-500/15 border border-emerald-500/30 text-emerald-400">
          <TreePine className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold tracking-tight text-base sm:text-lg text-white">
              TerraPulse
            </h1>
            <span className="text-[11px] text-slate-400 font-medium px-2 py-0.5 rounded-full bg-slate-900 border border-white/5">
              Jim Corbett Reserve
            </span>
          </div>
        </div>
      </div>

      {/* 2. 4 Clean Bold Metric Pills */}
      <div className="hidden md:flex items-center gap-2.5 text-xs">
        {/* Metric 1: Area Monitored */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-white/10 text-slate-200">
          <span>🌲</span>
          <span className="text-slate-400">Area Monitored:</span>
          <strong className="text-white font-bold">12,400 Ha</strong>
        </div>

        {/* Metric 2: LoRa Mesh */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-white/10 text-slate-200">
          <span>📡</span>
          <span className="text-slate-400">LoRa Mesh:</span>
          <strong className="text-white font-bold">{activeNodesCount}/{totalNodesCount} Nodes Active</strong>
        </div>

        {/* Metric 3: Power */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-white/10 text-slate-200">
          <span>⚡</span>
          <span className="text-slate-400">Power:</span>
          <strong className="text-emerald-400 font-bold">100% Solar Uptime</strong>
        </div>

        {/* Metric 4: Forest Status */}
        {getThreatStatusPill()}
      </div>

      {/* 3. Right Action Controls: Sound Toggle, Simulation Mode, Current Time */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Current Time */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-300">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-mono font-medium tracking-wide">{time || "11:00:00"} IST</span>
        </div>

        {/* Audio Mute Toggle */}
        <button
          onClick={() => {
            soundFX.playBlip();
            onToggleMute();
          }}
          className={`p-2 rounded-xl border transition-all ${
            isMuted 
              ? "bg-slate-900 border-white/10 text-slate-400 hover:text-slate-200" 
              : "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25"
          }`}
          title={isMuted ? "Unmute Audio Notifications" : "Mute Audio Notifications"}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Simulation Panel Toggle Button */}
        <button
          onClick={() => {
            soundFX.playBlip();
            onToggleSim();
          }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
            isSimOpen
              ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20"
              : "bg-slate-900 hover:bg-slate-800 border-white/15 text-slate-200 hover:text-white"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Simulation Mode</span>
        </button>
      </div>
    </header>
  );
};
