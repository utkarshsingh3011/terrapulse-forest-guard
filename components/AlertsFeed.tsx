"use client";

import React, { useState } from "react";
import { 
  ThreatAlert, 
  IncidentStatus, 
  ThreatCategory 
} from "@/types/telemetry";
import { 
  Flame, 
  Axe, 
  Volume2, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Send, 
  Navigation, 
  Clock, 
  Sparkles,
  MapPin,
  ChevronRight,
  Activity,
  XCircle,
  Radio
} from "lucide-react";
import { soundFX } from "@/lib/audio";

interface AlertsFeedProps {
  alerts: ThreatAlert[];
  onDispatch: (alertId: string) => void;
  onAcknowledge: (alertId: string) => void;
  onSelectNodeById: (nodeId: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const AlertsFeed: React.FC<AlertsFeedProps> = ({
  alerts,
  onDispatch,
  onAcknowledge,
  onSelectNodeById,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "DISPATCHED" | "RESOLVED">("ALL");

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === "ALL") return true;
    if (filter === "ACTIVE") return alert.status === "ACTIVE";
    if (filter === "DISPATCHED") return alert.status === "DISPATCHED";
    if (filter === "RESOLVED") return alert.status === "RESOLVED" || alert.status === "ACKNOWLEDGED";
    return true;
  });

  const getThreatCategoryDetails = (threat: ThreatCategory) => {
    switch (threat) {
      case "FOREST_FIRE":
        return {
          title: "Smoke & Thermal Anomaly",
          subtitle: "Sudden temperature rise & smoke air quality drop",
          icon: <Flame className="w-4 h-4 text-rose-400" />,
          badgeStyle: "bg-rose-500/15 text-rose-300 border-rose-500/25",
          cardBorder: "border-rose-500/30 hover:border-rose-500/50 bg-rose-950/10",
          isAcoustic: false,
        };
      case "CHAINSAW":
        return {
          title: "Chainsaw Acoustic Match",
          subtitle: "2-stroke motorized cutting pattern detected",
          icon: <Axe className="w-4 h-4 text-amber-400" />,
          badgeStyle: "bg-amber-500/15 text-amber-300 border-amber-500/25",
          cardBorder: "border-amber-500/30 hover:border-amber-500/50 bg-amber-950/10",
          isAcoustic: true,
        };
      case "GUNSHOT":
        return {
          title: "Gunshot Acoustic Shockwave",
          subtitle: "High-peak explosive acoustic transient detected",
          icon: <Volume2 className="w-4 h-4 text-rose-400" />,
          badgeStyle: "bg-rose-500/15 text-rose-300 border-rose-500/25",
          cardBorder: "border-rose-500/30 hover:border-rose-500/50 bg-rose-950/10",
          isAcoustic: true,
        };
      case "TAMPER":
        return {
          title: "Station Physical Tilt / Tamper",
          subtitle: "Accelerometer detected enclosure disturbance",
          icon: <AlertTriangle className="w-4 h-4 text-sky-400" />,
          badgeStyle: "bg-sky-500/15 text-sky-300 border-sky-500/25",
          cardBorder: "border-sky-500/30 hover:border-sky-500/50 bg-sky-950/10",
          isAcoustic: false,
        };
      default:
        return {
          title: "Environmental Alert",
          subtitle: "General sensor event threshold crossed",
          icon: <ShieldAlert className="w-4 h-4 text-slate-300" />,
          badgeStyle: "bg-slate-800 text-slate-300 border-slate-700",
          cardBorder: "border-slate-800 bg-slate-900/40",
          isAcoustic: false,
        };
    }
  };

  const getStatusPill = (status: IncidentStatus, unit?: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
            Active Alert
          </span>
        );
      case "DISPATCHED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
            <Navigation className="w-3 h-3 text-sky-300 animate-pulse" />
            Patrol Dispatched {unit ? `(${unit})` : ""}
          </span>
        );
      case "ACKNOWLEDGED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/25">
            <CheckCircle2 className="w-3 h-3 text-amber-300" />
            Investigating
          </span>
        );
      case "RESOLVED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Resolved
          </span>
        );
    }
  };

  if (isCollapsed) {
    return null;
  }

  const activeCount = alerts.filter(a => a.status === "ACTIVE").length;

  return (
    <aside className="w-full lg:w-[400px] flex flex-col h-full bg-slate-950/90 border-l border-white/10 backdrop-blur-2xl z-20 transition-all">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-slate-900/40 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-white flex items-center gap-2">
                Live Incident Feed
                {activeCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-rose-500 text-slate-950 font-bold text-[10px] rounded-full">
                    {activeCount} active
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Acoustic &amp; sensor anomaly notifications
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-white/5 font-mono">
              {alerts.length} Total
            </span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/5 text-xs">
          {(["ALL", "ACTIVE", "DISPATCHED", "RESOLVED"] as const).map((tab) => {
            const count = tab === "ALL" ? alerts.length : tab === "ACTIVE" ? alerts.filter(a => a.status === "ACTIVE").length : tab === "DISPATCHED" ? alerts.filter(a => a.status === "DISPATCHED").length : alerts.filter(a => a.status === "RESOLVED" || a.status === "ACKNOWLEDGED").length;
            return (
              <button
                key={tab}
                onClick={() => {
                  soundFX.playBlip();
                  setFilter(tab);
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg text-center font-medium transition-all text-xs flex items-center justify-center gap-1 ${
                  filter === tab
                    ? "bg-slate-800 text-white shadow-sm font-semibold border border-white/10"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>{tab === "ALL" ? "All" : tab === "ACTIVE" ? "Active" : tab === "DISPATCHED" ? "Patrol" : "Resolved"}</span>
                {count > 0 && (
                  <span className={`text-[10px] px-1 rounded-full ${filter === tab ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Incident Cards Feed */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 rounded-2xl border border-dashed border-white/10 text-slate-400">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-3 border border-emerald-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">All Quiet &amp; Secure</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
              No alerts found in this view. All Jim Corbett reserve sectors are operating normally.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const cat = getThreatCategoryDetails(alert.threat);
            const isCritical = alert.status === "ACTIVE";

            return (
              <div
                key={alert.id}
                className={`p-3.5 rounded-2xl border transition-all glass-card ${cat.cardBorder}`}
              >
                {/* Top Row: Icon, Title & Status */}
                <div className="flex items-start justify-between gap-2.5 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl border ${cat.badgeStyle}`}>
                      {cat.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs text-white">
                        {cat.title}
                      </h4>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        <span className="text-slate-300 font-medium">{alert.nodeId}</span>
                        <span>•</span>
                        <span>{alert.sector}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {getStatusPill(alert.status, alert.dispatchedUnit)}
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-slate-500" />
                      {alert.timestamp}
                    </span>
                  </div>
                </div>

                {/* Plain-Language Details */}
                <div className="text-xs text-slate-300 mb-3 p-2.5 rounded-xl bg-slate-950/40 border border-white/5 leading-relaxed">
                  {alert.details || cat.subtitle}
                </div>

                {/* Acoustic Visualizer & Confidence */}
                <div className="mb-3.5 flex items-center justify-between gap-3 text-xs bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2">
                    {cat.isAcoustic ? (
                      <div className="flex items-center gap-0.5 h-4 text-emerald-400">
                        <span className="w-1 bg-emerald-400 rounded-full h-3 animate-pulse" />
                        <span className="w-1 bg-emerald-400 rounded-full h-4 animate-pulse delay-75" />
                        <span className="w-1 bg-emerald-400 rounded-full h-2 animate-pulse delay-150" />
                        <span className="w-1 bg-emerald-400 rounded-full h-4 animate-pulse" />
                        <span className="w-1 bg-emerald-400 rounded-full h-2.5 animate-pulse delay-100" />
                      </div>
                    ) : (
                      <Activity className="w-4 h-4 text-sky-400" />
                    )}
                    <span className="text-slate-400 text-[11px]">
                      {cat.isAcoustic ? "Acoustic Signature Match" : "Sensor AI Confidence"}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-white text-xs">
                      {alert.confidence.toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Human-Centered Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {alert.status === "ACTIVE" ? (
                    <>
                      <button
                        onClick={() => {
                          soundFX.playDispatchChirp();
                          onDispatch(alert.id);
                        }}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs transition-all shadow-md shadow-rose-500/20"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Dispatch Patrol
                      </button>

                      <button
                        onClick={() => {
                          soundFX.playAcknowledgeTone();
                          onAcknowledge(alert.id);
                        }}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 font-medium text-xs transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                        False Alarm
                      </button>
                    </>
                  ) : alert.status === "DISPATCHED" ? (
                    <button
                      onClick={() => {
                        soundFX.playAcknowledgeTone();
                        onAcknowledge(alert.id);
                      }}
                      className="col-span-2 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-semibold text-xs transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark Resolved
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        soundFX.playBlip();
                        onSelectNodeById(alert.nodeId);
                      }}
                      className="col-span-2 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 text-xs transition-all font-medium"
                    >
                      <Navigation className="w-3.5 h-3.5 text-sky-400" />
                      Locate Station on Map
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};

