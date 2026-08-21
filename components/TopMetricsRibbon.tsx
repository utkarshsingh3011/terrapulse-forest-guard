"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle,
  Radio, 
  Cpu, 
  SunMedium, 
  Volume2, 
  VolumeX, 
  Sparkles,
  TreePine,
  Clock,
  SlidersHorizontal,
  RefreshCw,
  Zap,
  Shield,
  Layers,
  Flame,
  Info
} from "lucide-react";
import { ThreatLevel } from "@/types/telemetry";
import { soundFX } from "@/lib/audio";

interface TopMetricsRibbonProps {
  activeNodesCount: number;
  totalNodesCount: number;
  threatLevel: ThreatLevel;
  meshStatus: string;
  powerHealth: string;
  isSimOpen: boolean;
  onToggleSim: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onResetAll: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const TopMetricsRibbon: React.FC<TopMetricsRibbonProps> = ({
  activeNodesCount,
  totalNodesCount,
  threatLevel,
  powerHealth,
  isSimOpen,
  onToggleSim,
  isMuted,
  onToggleMute,
  onResetAll,
  isSidebarOpen = true,
  onToggleSidebar,
}) => {
  const [time, setTime] = useState<string>("");
  const [showImpactInfo, setShowImpactInfo] = useState<boolean>(false);

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
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-xs animate-pulse">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span>CRITICAL THREAT ACTIVE</span>
          </div>
        );
      case "ELEVATED":
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-semibold text-xs">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
            </span>
            <span>ELEVATED ATTENTION</span>
          </div>
        );
      case "LOW":
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold text-xs">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span>FOREST NORMAL &amp; SECURE</span>
          </div>
        );
    }
  };

  return (
    <header className="w-full bg-slate-950/90 border-b border-white/10 backdrop-blur-xl z-30 flex flex-col select-none shadow-md">
      {/* 1. Main Header Controls Row */}
      <div className="px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-500/15 border border-emerald-500/40 text-emerald-400 shadow-inner">
            <TreePine className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold tracking-tight text-base sm:text-lg text-white flex items-center gap-1.5">
                TerraPulse
                <span className="text-xs font-normal text-emerald-400 font-mono">Mesh v2.4</span>
              </h1>
              <span className="hidden sm:inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/10">
                Jim Corbett National Park
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Autonomous Acoustic Sensor Grid &amp; Ranger Dispatch
            </p>
          </div>
        </div>

        {/* Center Live Threat Capsule */}
        <div className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-white/10 text-xs shadow-inner">
          <div className="flex items-center gap-2 text-slate-200">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              <strong className="text-white font-bold">{activeNodesCount}/{totalNodesCount}</strong> Nodes
            </span>
          </div>

          <div className="w-px h-3.5 bg-white/10" />

          {getThreatStatusPill()}

          <div className="w-px h-3.5 bg-white/10" />

          <div className="flex items-center gap-2 text-slate-300">
            <SunMedium className="w-3.5 h-3.5 text-amber-400" />
            <span>100% Solar Uptime</span>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          {/* Local Clock */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/70 border border-white/10 text-xs text-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono font-semibold tracking-wide">{time || "11:00:00"} IST</span>
          </div>

          {/* Reset All Beats Button */}
          <button
            onClick={() => {
              soundFX.playBlip();
              onResetAll();
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs text-slate-300 hover:text-white transition-all shadow-sm"
            title="Reset all beats to normal baseline"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset All</span>
          </button>

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
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              isSimOpen
                ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20"
                : "bg-slate-900 hover:bg-slate-800 border-white/15 text-slate-200 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Simulation</span>
          </button>

          {/* Feed Toggle (for clutter-free full map view) */}
          {onToggleSidebar && (
            <button
              onClick={() => {
                soundFX.playBlip();
                onToggleSidebar();
              }}
              className={`p-2 rounded-xl border text-xs transition-all ${
                isSidebarOpen
                  ? "bg-slate-900/80 border-white/10 text-slate-300 hover:text-white"
                  : "bg-sky-500/20 border-sky-500/40 text-sky-300"
              }`}
              title={isSidebarOpen ? "Collapse Feed (Full Map View)" : "Show Incident Feed"}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Mission Impact Ribbon (Required by SIH Jury Specifications) */}
      <div className="bg-slate-900/60 border-t border-white/5 px-4 py-1.5 flex items-center justify-between text-xs overflow-x-auto gap-4 scrollbar-none">
        <div className="flex items-center gap-4 text-slate-300 min-w-max">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-emerald-400 font-bold">🌿 12,400 Hectares Protected</span>
            <span className="text-slate-500 text-[10px]">• Corbett Core &amp; Buffer</span>
          </div>

          <div className="w-1 h-1 rounded-full bg-white/20" />

          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-amber-300 font-bold">⚡ 100% Off-Grid Solar Uptime</span>
            <span className="text-slate-500 text-[10px]">• LiFePO4 PMIC</span>
          </div>

          <div className="w-1 h-1 rounded-full bg-white/20" />

          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-sky-300 font-bold">📡 4-Node LoRa Mesh Active (IN865)</span>
            <span className="text-slate-500 text-[10px]">• Sub-GHz Non-Line-of-Sight</span>
          </div>

          <div className="w-1 h-1 rounded-full bg-white/20" />

          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-rose-300 font-bold">🛡️ Threat Interception Window: &lt; 45 Seconds</span>
            <span className="text-slate-500 text-[10px]">• Edge TinyML AI</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-400 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          <span className="font-mono text-emerald-400 font-semibold">GATEWAY LIVE</span>
        </div>
      </div>
    </header>
  );
};
