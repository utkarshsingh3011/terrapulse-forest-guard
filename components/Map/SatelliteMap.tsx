"use client";

import dynamic from "next/dynamic";
import React from "react";
import { NodeData, RangerUnit, ThreatAlert } from "@/types/telemetry";
import { Loader2, Radio } from "lucide-react";

interface SatelliteMapProps {
  nodes: NodeData[];
  selectedNode: NodeData | null;
  onSelectNode: (node: NodeData) => void;
  onOpenDrawer: (node: NodeData) => void;
  rangerUnits: RangerUnit[];
  activeAlerts: ThreatAlert[];
}

const DynamicMap = dynamic(
  () => import("./MapInner").then((mod) => mod.MapInner),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-tactical-950 text-cyan-neon font-mono gap-3">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-cyan-neon animate-spin" />
          <Radio className="w-6 h-6 text-emerald-neon absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="text-sm tracking-widest uppercase">Initializing Satellite Telemetry Map...</div>
        <div className="text-xs text-slate-400">Jim Corbett National Park (29.5300° N, 78.7747° E)</div>
      </div>
    ),
  }
);

export const SatelliteMap: React.FC<SatelliteMapProps> = (props) => {
  return <DynamicMap {...props} />;
};
