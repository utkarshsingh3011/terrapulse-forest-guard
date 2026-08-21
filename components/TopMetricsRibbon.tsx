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
  ChevronRight,
  RefreshCw
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
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 font-medium text-xs animate-pulse">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span>Critical Threat Active</span>
          </div>
        );
      case "ELEVATED":
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-medium text-xs">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
            </span>
            <span>Elevated Attention</span>
          </div>
        );
      case "LOW":
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 font-medium text-xs">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span>Forest Normal &amp; Secure</span>
          </div>
        );
    }
  };

  return (
    <header className="w-full bg-slate-950/80 border-b border-white/10 px-4 py-2.5 backdrop-blur-xl z-30 flex items-center justify-between gap-4 select-none shadow-sm">
      {/* 1. Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 shadow-inner">
          <TreePine className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-bold tracking-tight text-base sm:text-lg text-white">
              TerraPulse
            </h1>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-white/5">
              Jim Corbett Reserve
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-normal">
            Wildlife Protection &amp; Acoustic Sensor Grid
          </p>
        </div>
      </div>

      {/* 2. Unified Status Capsule (Clean & Decluttered) */}
      <div className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-white/10 text-xs shadow-inner">
        {/* Stations Active */}
        <div className="flex items-center gap-2 text-slate-200">
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            <strong className="text-white font-semibold">{activeNodesCount}/{totalNodesCount}</strong> Stations Active
          </span>
        </div>

        <div className="w-px h-3.5 bg-white/10" />

        {/* Forest Status Pill */}
        {getThreatStatusPill()}

        <div className="w-px h-3.5 bg-white/10" />

        {/* Power & Mesh */}
        <div className="flex items-center gap-2 text-slate-300">
          <SunMedium className="w-3.5 h-3.5 text-amber-400" />
          <span>98% Solar Backup</span>
        </div>

        <div className="w-px h-3.5 bg-white/10" />

        <div className="flex items-center gap-1.5 text-slate-400">
          <Radio className="w-3.5 h-3.5 text-sky-400" />
          <span>LoRa Mesh (IN865)</span>
        </div>
      </div>

      {/* 3. Right Action Controls */}
      <div className="flex items-center gap-2.5">
        {/* Local Clock */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-white/5 text-xs text-slate-300">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-mono font-medium tracking-wide">{time || "11:00:00"} IST</span>
        </div>

        {/* Reset All Beats Button */}
        <button
          onClick={() => {
            soundFX.playBlip();
            onResetAll();
          }}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 text-xs text-slate-300 hover:text-white transition-all"
          title="Reset all beats to normal baseline"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset</span>
        </button>

        {/* Audio Mute Toggle */}
        <button
          onClick={() => {
            soundFX.playBlip();
            onToggleMute();
          }}
          className={`p-2 rounded-lg border transition-all ${
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
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
            isSimOpen
              ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20"
              : "bg-slate-900/90 hover:bg-slate-800 border-white/15 text-slate-200 hover:text-white"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Simulation</span>
        </button>

        {/* Feed Toggle (for clutter-free full map view) */}
        {onToggleSidebar && (
          <button
            onClick={() => {
              soundFX.playBlip();
              onToggleSidebar();
            }}
            className={`p-2 rounded-lg border text-xs transition-all ${
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
    </header>
  );
};

