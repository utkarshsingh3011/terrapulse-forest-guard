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
  MapPin,
  Activity,
  ArrowRight
} from "lucide-react";
import { soundFX } from "@/lib/audio";

interface AlertsFeedProps {
  alerts: ThreatAlert[];
  onDispatch: (alertId: string) => void;
  onAcknowledge: (alertId: string) => void;
  onSelectNodeById: (nodeId: string) => void;
  onOpenModal?: (alert: ThreatAlert) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const AlertsFeed: React.FC<AlertsFeedProps> = ({
  alerts,
  onDispatch,
  onAcknowledge,
  onSelectNodeById,
  onOpenModal,
  isCollapsed = false,
}) => {
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "DISPATCHED" | "RESOLVED">("ALL");

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === "ALL") return true;
    if (filter === "ACTIVE") return alert.status === "ACTIVE";
    if (filter === "DISPATCHED") return alert.status === "DISPATCHED";
    if (filter === "RESOLVED") return alert.status === "RESOLVED" || alert.status === "ACKNOWLEDGED";
    return true;
  });

  const getThreatCategoryDetails = (threat: ThreatCategory, confidence: number) => {
    switch (threat) {
      case "FOREST_FIRE":
        return {
          title: "Smoke Precursor Anomaly",
          matchText: `${confidence.toFixed(0)}% AI Match`,
          icon: <Flame className="w-4 h-4 text-rose-400" />,
          badgeStyle: "bg-rose-500/15 text-rose-300 border-rose-500/25",
          cardBorder: "border-rose-500/30 hover:border-rose-500/50 bg-rose-950/10",
        };
      case "CHAINSAW":
        return {
          title: "Chainsaw Sound Detected",
          matchText: `${confidence.toFixed(0)}% AI Match`,
          icon: <Axe className="w-4 h-4 text-amber-400" />,
          badgeStyle: "bg-amber-500/15 text-amber-300 border-amber-500/25",
          cardBorder: "border-amber-500/30 hover:border-amber-500/50 bg-amber-950/10",
        };
      case "GUNSHOT":
        return {
          title: "Gunshot Shockwave Detected",
          matchText: `${confidence.toFixed(0)}% AI Match`,
          icon: <Volume2 className="w-4 h-4 text-rose-400" />,
          badgeStyle: "bg-rose-500/15 text-rose-300 border-rose-500/25",
          cardBorder: "border-rose-500/30 hover:border-rose-500/50 bg-rose-950/10",
        };
      case "TAMPER":
        return {
          title: "Physical Tamper Detected",
          matchText: `${confidence.toFixed(0)}% AI Match`,
          icon: <AlertTriangle className="w-4 h-4 text-sky-400" />,
          badgeStyle: "bg-sky-500/15 text-sky-300 border-sky-500/25",
          cardBorder: "border-sky-500/30 hover:border-sky-500/50 bg-sky-950/10",
        };
      default:
        return {
          title: "Sensor Event Detected",
          matchText: `${confidence.toFixed(0)}% Match`,
          icon: <ShieldAlert className="w-4 h-4 text-slate-300" />,
          badgeStyle: "bg-slate-800 text-slate-300 border-slate-700",
          cardBorder: "border-slate-800 bg-slate-900/40",
        };
    }
  };

  const getStatusPill = (status: IncidentStatus, unit?: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
            Active Alert
          </span>
        );
      case "DISPATCHED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
            <Navigation className="w-3 h-3 text-sky-300 animate-pulse" />
            Patrol En Route {unit ? `(${unit})` : ""}
          </span>
        );
      case "ACKNOWLEDGED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/25">
            <CheckCircle2 className="w-3 h-3 text-amber-300" />
            Investigating
          </span>
        );
      case "RESOLVED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
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
    <aside className="w-full lg:w-[380px] flex flex-col h-full bg-slate-950/90 border-l border-white/10 backdrop-blur-2xl z-20 transition-all">
      {/* Feed Header */}
      <div className="p-3.5 border-b border-white/10 bg-slate-900/40 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-xs text-white flex items-center gap-2">
                Incident Feed
                {activeCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-rose-500 text-slate-950 font-bold text-[10px] rounded-full">
                    {activeCount} active
                  </span>
                )}
              </h2>
              <div className="text-[10px] text-emerald-400 font-mono mt-0.5 flex items-center gap-1 font-medium">
                <span>Avg Dispatch Window: 38s</span>
              </div>
            </div>
          </div>

          <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-white/5 font-mono">
            {alerts.length} Incidents
          </span>
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
                className={`flex-1 py-1 px-1.5 rounded-lg text-center font-medium transition-all text-[11px] flex items-center justify-center gap-1 ${
                  filter === tab
                    ? "bg-slate-800 text-white shadow-sm font-semibold border border-white/10"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>{tab === "ALL" ? "All" : tab === "ACTIVE" ? "Active" : tab === "DISPATCHED" ? "Patrol" : "Resolved"}</span>
                {count > 0 && (
                  <span className={`text-[9px] px-1 rounded-full ${filter === tab ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Incident Cards Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredAlerts.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 rounded-2xl border border-dashed border-white/10 text-slate-400">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-2.5 border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-semibold text-slate-200">All Quiet &amp; Secure</h3>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
              No active threats detected in Jim Corbett reserve.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const cat = getThreatCategoryDetails(alert.threat, alert.confidence);

            return (
              <div
                key={alert.id}
                className={`p-3 rounded-2xl border transition-all bg-slate-900/60 ${cat.cardBorder}`}
              >
                {/* Header Row: Title & Confidence */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-xl border ${cat.badgeStyle}`}>
                      {cat.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-white">
                        {cat.title}
                      </h4>
                      <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                        {cat.matchText}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {getStatusPill(alert.status, alert.dispatchedUnit)}
                    <span className="text-[9px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-2.5 h-2.5 text-slate-500" />
                      {alert.timestamp}
                    </span>
                  </div>
                </div>

                {/* Location Info */}
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-2.5 bg-slate-950/40 p-1.5 rounded-lg border border-white/5">
                  <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="text-slate-200 font-medium">{alert.nodeId}</span>
                  <span>•</span>
                  <span className="truncate">{alert.sector}</span>
                </div>

                {/* Action Buttons */}
                <div className="pt-0.5">
                  {alert.status === "ACTIVE" ? (
                    <button
                      onClick={() => {
                        soundFX.playBlip();
                        if (onOpenModal) {
                          onOpenModal(alert);
                        } else {
                          onDispatch(alert.id);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-all shadow-md shadow-rose-500/20"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Inspect &amp; Dispatch Ranger</span>
                    </button>
                  ) : alert.status === "DISPATCHED" ? (
                    <button
                      onClick={() => {
                        soundFX.playAcknowledgeTone();
                        onAcknowledge(alert.id);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-semibold text-xs transition-all"
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
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 text-xs transition-all font-medium"
                    >
                      <Navigation className="w-3.5 h-3.5 text-sky-400" />
                      Locate on Map
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
