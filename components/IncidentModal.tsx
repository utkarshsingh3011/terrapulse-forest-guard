"use client";

import React, { useState } from "react";
import { ThreatAlert, RangerUnit } from "@/types/telemetry";
import { 
  Flame, 
  Axe, 
  Volume2, 
  AlertTriangle, 
  ShieldAlert, 
  Navigation, 
  X, 
  CheckCircle2, 
  Send,
  MapPin,
  ShieldCheck, 
  Radio, 
  Sparkles,
  Users
} from "lucide-react";
import { soundFX } from "@/lib/audio";
import { getRecommendedAction } from "@/lib/store";

interface IncidentModalProps {
  alert: ThreatAlert | null;
  rangerUnits: RangerUnit[];
  onClose: () => void;
  onDispatchUnit: (alertId: string, unitId: string) => void;
  onAcknowledge: (alertId: string) => void;
}

export const IncidentModal: React.FC<IncidentModalProps> = ({
  alert,
  rangerUnits,
  onClose,
  onDispatchUnit,
  onAcknowledge,
}) => {
  const [selectedUnitId, setSelectedUnitId] = useState<string>(rangerUnits[0]?.id || "RU-ALPHA");

  if (!alert) return null;

  const getThreatHeader = (threat: string) => {
    switch (threat) {
      case "FOREST_FIRE":
        return {
          title: "Smoke & Thermal Anomaly Detected",
          icon: <Flame className="w-5 h-5 text-rose-400" />,
          badgeStyle: "bg-rose-500/20 text-rose-300 border-rose-500/30",
          cardAccent: "border-rose-500/30 bg-rose-950/20",
        };
      case "CHAINSAW":
        return {
          title: "Acoustic Match: Active Chainsaw Detected",
          icon: <Axe className="w-5 h-5 text-amber-400" />,
          badgeStyle: "bg-amber-500/20 text-amber-300 border-amber-500/30",
          cardAccent: "border-amber-500/30 bg-amber-950/20",
        };
      case "GUNSHOT":
        return {
          title: "Acoustic Shock: Gunshot Sound Detected",
          icon: <Volume2 className="w-5 h-5 text-rose-400" />,
          badgeStyle: "bg-rose-500/20 text-rose-300 border-rose-500/30",
          cardAccent: "border-rose-500/30 bg-rose-950/20",
        };
      case "TAMPER":
        return {
          title: "Station Physical Disturbance / Tilt Alert",
          icon: <AlertTriangle className="w-5 h-5 text-sky-400" />,
          badgeStyle: "bg-sky-500/20 text-sky-300 border-sky-500/30",
          cardAccent: "border-sky-500/30 bg-sky-950/20",
        };
      default:
        return {
          title: "Sensor Event Alert",
          icon: <ShieldAlert className="w-5 h-5 text-slate-300" />,
          badgeStyle: "bg-slate-800 text-slate-300 border-slate-700",
          cardAccent: "border-slate-800 bg-slate-900/50",
        };
    }
  };

  const header = getThreatHeader(alert.threat);
  const recommendedAction = getRecommendedAction(alert.threat);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden font-sans text-xs">
        {/* Header Banner */}
        <div className="p-4 bg-slate-950/60 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-2xl border ${header.badgeStyle}`}>
              {header.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Incident Action Required
                </span>
                <span className="text-[11px] text-slate-400 font-mono">#{alert.id}</span>
              </div>
              <h2 className="text-sm font-bold text-white mt-1">
                {header.title}
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              soundFX.playBlip();
              onClose();
            }}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Field Actionable Triage Body */}
        <div className="p-5 space-y-3.5 text-xs text-slate-200">
          {/* Field 1: Threat Type & Details */}
          <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-white/5 space-y-1">
            <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
              <span>Detected Incident</span>
              <span className="font-semibold text-emerald-400">{alert.confidence.toFixed(0)}% AI Confidence</span>
            </div>
            <div className="font-semibold text-white text-xs">
              {header.title}
            </div>
            <div className="text-[11px] text-slate-300">
              {alert.details}
            </div>
          </div>

          {/* Field 2: Forest Beat Location */}
          <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-white/5 space-y-1">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Forest Beat Location</span>
            </div>
            <div className="font-semibold text-white text-xs">
              {alert.sector} <span className="text-slate-400 font-normal">({alert.nodeId}: {alert.nodeName})</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Coordinates: {alert.lat.toFixed(4)}° N, {alert.lng.toFixed(4)}° E • Jim Corbett National Park
            </div>
          </div>

          {/* Field 3: Recommended Action Protocol */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
            <div className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Recommended Standard Operating Procedure</span>
            </div>
            <div className="text-slate-200 text-xs leading-relaxed">
              {recommendedAction}
            </div>
          </div>

          {/* Patrol Unit Selector */}
          <div className="pt-1">
            <label className="text-slate-300 font-semibold block text-xs mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-sky-400" />
              Assign Duty Response Team:
            </label>
            <div className="grid grid-cols-1 gap-2">
              {rangerUnits.map((unit) => (
                <label
                  key={unit.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                    selectedUnitId === unit.id
                      ? "bg-sky-500/15 border-sky-500/40 text-white shadow-sm"
                      : "bg-slate-950/40 border-white/5 text-slate-300 hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="rangerUnit"
                      value={unit.id}
                      checked={selectedUnitId === unit.id}
                      onChange={() => setSelectedUnitId(unit.id)}
                      className="accent-emerald-500"
                    />
                    <div>
                      <div className="font-semibold text-white text-xs">{unit.callsign}</div>
                      <div className="text-[11px] text-slate-400">{unit.team}</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 font-semibold">
                    Ready
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-950/60 border-t border-white/10 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              soundFX.playAcknowledgeTone();
              onAcknowledge(alert.id);
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 font-medium text-xs transition-colors text-center"
          >
            Mark as False Alarm
          </button>

          <button
            onClick={() => {
              soundFX.playDispatchChirp();
              onDispatchUnit(alert.id, selectedUnitId);
            }}
            className="flex-[1.5] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs tracking-wide transition-all shadow-md shadow-rose-500/25"
          >
            <Send className="w-3.5 h-3.5" />
            Dispatch Response Team
          </button>
        </div>
      </div>
    </div>
  );
};

