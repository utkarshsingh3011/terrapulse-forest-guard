"use client";

import React, { useState } from "react";
import { 
  Flame, 
  Axe, 
  Volume2, 
  AlertTriangle, 
  RotateCcw, 
  Send, 
  X, 
  Sparkles, 
  Copy, 
  Check,
  Terminal,
  Sliders
} from "lucide-react";
import { soundFX } from "@/lib/audio";

interface SimulationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerPreset: (preset: "FIRE" | "CHAINSAW" | "GUNSHOT" | "TAMPER" | "RESET") => Promise<void>;
  onSendCustomPayload: (payload: Record<string, unknown>) => Promise<void>;
  isLoading: boolean;
}

export const SimulationPanel: React.FC<SimulationPanelProps> = ({
  isOpen,
  onClose,
  onTriggerPreset,
  onSendCustomPayload,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<"PRESETS" | "CUSTOM" | "CURL">("PRESETS");
  const [copied, setCopied] = useState(false);

  // Custom form inputs
  const [nodeId, setNodeId] = useState("Node-02");
  const [threat, setThreat] = useState("FOREST_FIRE");
  const [temp, setTemp] = useState("54.2");
  const [humidity, setHumidity] = useState("28.0");
  const [voc, setVoc] = useState("9.4");
  const [confidence, setConfidence] = useState("96.5");

  if (!isOpen) return null;

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.playBlip();
    await onSendCustomPayload({
      nodeId,
      threat,
      temp: parseFloat(temp),
      hum: parseFloat(humidity),
      voc: parseFloat(voc),
      confidence: parseFloat(confidence),
    });
  };

  const curlCommand = `curl -X POST http://localhost:3000/api/telemetry \\
  -H "Content-Type: application/json" \\
  -d '{
    "nodeId": "${nodeId}",
    "threat": "${threat}",
    "temp": ${temp},
    "hum": ${humidity},
    "voc": ${voc},
    "confidence": ${confidence}
  }'`;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    soundFX.playBlip();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 w-[calc(100vw-48px)] sm:w-[460px] bg-slate-900/95 border border-white/15 rounded-3xl shadow-2xl backdrop-blur-2xl font-sans text-xs overflow-hidden transition-all animate-in fade-in slide-in-from-bottom-5">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-950/60 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-xs">Field Scenario Simulator</h3>
            <p className="text-[11px] text-slate-400">Trigger test acoustic events and evaluate ranger workflow</p>
          </div>
        </div>

        <button
          onClick={() => {
            soundFX.playBlip();
            onClose();
          }}
          className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 bg-slate-950/40 p-1.5 gap-1 text-xs">
        <button
          onClick={() => {
            soundFX.playBlip();
            setActiveTab("PRESETS");
          }}
          className={`flex-1 py-1.5 px-3 text-center rounded-xl font-medium transition-all ${
            activeTab === "PRESETS"
              ? "bg-slate-800 text-white font-semibold shadow-sm border border-white/10"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Preset Scenarios
        </button>
        <button
          onClick={() => {
            soundFX.playBlip();
            setActiveTab("CUSTOM");
          }}
          className={`flex-1 py-1.5 px-3 text-center rounded-xl font-medium transition-all ${
            activeTab === "CUSTOM"
              ? "bg-slate-800 text-white font-semibold shadow-sm border border-white/10"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Custom Input
        </button>
        <button
          onClick={() => {
            soundFX.playBlip();
            setActiveTab("CURL");
          }}
          className={`flex-1 py-1.5 px-3 text-center rounded-xl font-medium transition-all ${
            activeTab === "CURL"
              ? "bg-slate-800 text-white font-semibold shadow-sm border border-white/10"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Hardware API
        </button>
      </div>

      {/* Tab 1: Presets */}
      {activeTab === "PRESETS" && (
        <div className="p-4 space-y-3">
          <p className="text-xs text-slate-400">
            Click any scenario to inject live sensor telemetry:
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Fire Preset */}
            <button
              disabled={isLoading}
              onClick={() => onTriggerPreset("FIRE")}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-left transition-all hover:scale-[1.02] group"
            >
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300 group-hover:scale-110 transition-transform">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-rose-300 text-xs">Smoke &amp; Heat</div>
                <div className="text-[10px] text-slate-400">Node-02 (Bijrani)</div>
              </div>
            </button>

            {/* Chainsaw Preset */}
            <button
              disabled={isLoading}
              onClick={() => onTriggerPreset("CHAINSAW")}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-left transition-all hover:scale-[1.02] group"
            >
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 group-hover:scale-110 transition-transform">
                <Axe className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-amber-300 text-xs">Chainsaw Sound</div>
                <div className="text-[10px] text-slate-400">Node-01 (Dhikala)</div>
              </div>
            </button>

            {/* Gunshot Preset */}
            <button
              disabled={isLoading}
              onClick={() => onTriggerPreset("GUNSHOT")}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-left transition-all hover:scale-[1.02] group"
            >
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300 group-hover:scale-110 transition-transform">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-rose-300 text-xs">Gunshot Shock</div>
                <div className="text-[10px] text-slate-400">Node-03 (Jhirna)</div>
              </div>
            </button>

            {/* Tamper Preset */}
            <button
              disabled={isLoading}
              onClick={() => onTriggerPreset("TAMPER")}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/25 text-left transition-all hover:scale-[1.02] group"
            >
              <div className="p-2 rounded-xl bg-sky-500/20 text-sky-300 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-sky-300 text-xs">Device Tilt</div>
                <div className="text-[10px] text-slate-400">Node-04 (Dhela)</div>
              </div>
            </button>
          </div>

          {/* Reset button */}
          <button
            disabled={isLoading}
            onClick={() => onTriggerPreset("RESET")}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-200 hover:text-white font-semibold transition-all mt-1"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
            Reset All Stations to Normal Baseline
          </button>
        </div>
      )}

      {/* Tab 2: Custom Payload */}
      {activeTab === "CUSTOM" && (
        <form onSubmit={handleCustomSubmit} className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Target Station</label>
              <select
                value={nodeId}
                onChange={(e) => setNodeId(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-slate-100 text-xs focus:border-emerald-500 focus:outline-none"
              >
                <option value="Node-01">Node-01 (Dhikala Ridge)</option>
                <option value="Node-02">Node-02 (Bijrani Canopy)</option>
                <option value="Node-03">Node-03 (Jhirna Corridor)</option>
                <option value="Node-04">Node-04 (Dhela Post)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Threat Type</label>
              <select
                value={threat}
                onChange={(e) => setThreat(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-slate-100 text-xs focus:border-emerald-500 focus:outline-none"
              >
                <option value="NONE">NONE (Normal)</option>
                <option value="FOREST_FIRE">FOREST_FIRE (Smoke &amp; Heat)</option>
                <option value="CHAINSAW">CHAINSAW (Illegal Felling)</option>
                <option value="GUNSHOT">GUNSHOT (Poaching Shot)</option>
                <option value="TAMPER">TAMPER (Tilt / Motion)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-slate-100 text-xs focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Humidity (%)</label>
              <input
                type="number"
                step="0.1"
                value={humidity}
                onChange={(e) => setHumidity(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-slate-100 text-xs focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">VOC Gas (kΩ)</label>
              <input
                type="number"
                step="0.1"
                value={voc}
                onChange={(e) => setVoc(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-slate-100 text-xs focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-[11px] mb-1 text-slate-400">
              <span>Detection Match</span>
              <span className="font-semibold text-emerald-400">{confidence}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="99"
              value={confidence}
              onChange={(e) => setConfidence(e.target.value)}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold transition-all shadow-md shadow-emerald-500/20"
          >
            <Send className="w-3.5 h-3.5" />
            Send Custom Telemetry Packet
          </button>
        </form>
      )}

      {/* Tab 3: cURL Command */}
      {activeTab === "CURL" && (
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">cURL Hardware Test Snippet:</span>
            <button
              onClick={handleCopyCurl}
              className="flex items-center gap-1.5 text-xs text-emerald-400 hover:underline font-medium"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy cURL"}
            </button>
          </div>

          <pre className="p-3 rounded-2xl bg-slate-950 border border-white/10 text-[11px] text-slate-300 overflow-x-auto select-text font-mono leading-relaxed">
            {curlCommand}
          </pre>

          <p className="text-[11px] text-slate-400">
            HTTP Endpoint: <code className="text-emerald-400">POST /api/telemetry</code> accepts standard JSON payloads from gateway nodes.
          </p>
        </div>
      )}
    </div>
  );
};

