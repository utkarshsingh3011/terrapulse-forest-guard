"use client";

import React, { useState, useEffect } from "react";
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
  Users,
  Car,
  Plane,
  Footprints,
  Activity,
  ArrowRight,
  ArrowLeft,
  Info,
  Clock,
  Compass,
  Zap,
  Gauge
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

// ----------------------------------------------------------------------
// Interactive Acoustic & Sensor Signature Visualizer Component
// ----------------------------------------------------------------------
const AcousticSpectrumVisualizer: React.FC<{ threat: string; confidence: number }> = ({ threat, confidence }) => {
  // 16 Frequency bands from 50Hz to 8kHz
  const bands = [
    { label: "63Hz", hz: 63 },
    { label: "125Hz", hz: 125 },
    { label: "250Hz", hz: 250 },
    { label: "350Hz", hz: 350 },
    { label: "500Hz", hz: 500 },
    { label: "750Hz", hz: 750 },
    { label: "1kHz", hz: 1000 },
    { label: "1.2k", hz: 1200 },
    { label: "1.6k", hz: 1600 },
    { label: "2kHz", hz: 2000 },
    { label: "2.5k", hz: 2500 },
    { label: "3.1k", hz: 3150 },
    { label: "4kHz", hz: 4000 },
    { label: "5kHz", hz: 5000 },
    { label: "6.3k", hz: 6300 },
    { label: "8kHz", hz: 8000 },
  ];

  // Determine heights and highlighting per threat category
  const getBandStyle = (index: number, hz: number) => {
    if (threat === "CHAINSAW") {
      // Harmonic concentration between 220Hz and 1100Hz (indexes 2 to 6)
      const isHarmonic = hz >= 220 && hz <= 1150;
      const height = isHarmonic 
        ? [88, 96, 82, 92, 85][index - 2] || 85
        : [25, 30, 20, 35, 28, 22, 18, 15, 12][index % 9] || 20;
      return {
        height: `${height}%`,
        isHighlight: isHarmonic,
        highlightColor: "bg-gradient-to-t from-amber-500 to-amber-300 shadow-lg shadow-amber-500/40",
        baseColor: "bg-slate-700/60",
      };
    } else if (threat === "GUNSHOT") {
      // High-crest factor transient spike above 1500Hz (indexes 7 to 13)
      const isSpike = hz >= 1500 && hz <= 4500;
      const height = isSpike 
        ? [98, 94, 90, 86, 78, 65, 50][index - 7] || 92
        : [15, 18, 22, 20, 25, 28, 20, 15, 12][index % 9] || 18;
      return {
        height: `${height}%`,
        isHighlight: isSpike,
        highlightColor: "bg-gradient-to-t from-rose-600 to-rose-400 shadow-lg shadow-rose-500/50 animate-pulse",
        baseColor: "bg-slate-700/60",
      };
    } else if (threat === "FOREST_FIRE") {
      // Thermal / Chemical infrared derivative curve
      const height = Math.min(95, 30 + Math.sin(index / 3) * 35 + (index * 3.5));
      const isThermal = index >= 4 && index <= 11;
      return {
        height: `${height}%`,
        isHighlight: isThermal,
        highlightColor: "bg-gradient-to-t from-orange-600 to-amber-400 shadow-lg shadow-orange-500/40",
        baseColor: "bg-slate-700/60",
      };
    } else {
      // Baseline / Ambient / Tamper
      const height = 20 + ((index * 7) % 25);
      return {
        height: `${height}%`,
        isHighlight: false,
        highlightColor: "bg-sky-400",
        baseColor: "bg-slate-700/60",
      };
    }
  };

  return (
    <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-white text-xs">
            {threat === "CHAINSAW" && "Real-Time Acoustic Spectrum (2-Stroke Harmonics)"}
            {threat === "GUNSHOT" && "Transient Acoustic Shockwave (Ballistic Impulse)"}
            {threat === "FOREST_FIRE" && "Atmospheric VOC & Thermal Gradient Spectrum"}
            {threat === "TAMPER" && "3-Axis Inertial Shock & Vibration Signature"}
            {threat === "NONE" && "Ambient Forest Baseline Acoustic Spectrum"}
          </span>
        </div>
        <span className="font-mono text-[10px] text-slate-400">16kHz YAMNet FFT</span>
      </div>

      {/* Spectral Graph Bars */}
      <div className="h-24 w-full flex items-end justify-between gap-1 px-2 pt-3 pb-1 bg-slate-900/90 rounded-xl border border-white/5 relative overflow-hidden">
        {/* Subtle grid lines */}
        <div className="absolute inset-x-0 top-1/4 border-b border-white/5 pointer-events-none" />
        <div className="absolute inset-x-0 top-2/4 border-b border-white/5 pointer-events-none" />
        <div className="absolute inset-x-0 top-3/4 border-b border-white/5 pointer-events-none" />

        {bands.map((band, idx) => {
          const style = getBandStyle(idx, band.hz);
          return (
            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
              <div
                style={{ height: style.height }}
                className={`w-full max-w-[12px] rounded-t-sm transition-all duration-300 ${
                  style.isHighlight ? style.highlightColor : style.baseColor
                }`}
              />
              <span className="text-[8px] text-slate-500 font-mono mt-1 hidden group-hover:block absolute -bottom-4 bg-slate-950 px-1 rounded z-10">
                {band.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Educational Badge per SIH Jury Requirement */}
      {threat === "CHAINSAW" && (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-snug">
            <span className="font-bold text-amber-300">220 Hz – 1100 Hz (2-Stroke Motor Harmonics):</span>{" "}
            <span className="text-slate-200">
              Harmonic energy concentration confirms active mechanical cutting tool.
            </span>
          </div>
        </div>
      )}

      {threat === "GUNSHOT" && (
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2">
          <Info className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-snug">
            <span className="font-bold text-rose-300">Transient Shockwave Spike (&gt;1500 Hz):</span>{" "}
            <span className="text-slate-200">
              High crest factor transient (&gt;1500 Hz) flags ballistic shockwave.
            </span>
          </div>
        </div>
      )}

      {threat === "FOREST_FIRE" && (
        <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-start gap-2">
          <Info className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-snug">
            <span className="font-bold text-orange-300">Thermal / Chemical Curve:</span>{" "}
            <span className="text-slate-200">
              Combustion precursor detected prior to thermal runaway.
            </span>
          </div>
        </div>
      )}

      {threat === "TAMPER" && (
        <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-start gap-2">
          <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-snug">
            <span className="font-bold text-sky-300">Enclosure Disturbance Vector:</span>{" "}
            <span className="text-slate-200">
              Station tilt / accelerometer deflection exceeds normal 1.8g boundary.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------------------------
// Main Incident Modal Component (3-Step Interactive SOP Dispatch Workflow)
// ----------------------------------------------------------------------
export const IncidentModal: React.FC<IncidentModalProps> = ({
  alert,
  rangerUnits,
  onClose,
  onDispatchUnit,
  onAcknowledge,
}) => {
  // Step State: 1 = Threat Review, 2 = Select Asset, 3 = Confirm Dispatch
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedAssetType, setSelectedAssetType] = useState<"VEHICLE" | "DRONE" | "FOOT">("VEHICLE");
  const [selectedUnitId, setSelectedUnitId] = useState<string>(
    rangerUnits.find(u => u.id === "RU-BRAVO")?.id || rangerUnits[0]?.id || "RU-ALPHA"
  );
  const [dispatchSuccess, setDispatchSuccess] = useState<boolean>(false);

  useEffect(() => {
    // Reset step when alert changes
    if (alert) {
      if (alert.status === "DISPATCHED") {
        setStep(3);
        setDispatchSuccess(true);
      } else {
        setStep(1);
        setDispatchSuccess(false);
      }
    }
  }, [alert]);

  if (!alert) return null;

  const getThreatHeader = (threat: string) => {
    switch (threat) {
      case "FOREST_FIRE":
        return {
          title: "Smoke & Thermal Anomaly Detected",
          icon: <Flame className="w-5 h-5 text-rose-400" />,
          badgeStyle: "bg-rose-500/20 text-rose-300 border-rose-500/30",
          accentColor: "rose",
        };
      case "CHAINSAW":
        return {
          title: "Acoustic Match: Active Chainsaw Detected",
          icon: <Axe className="w-5 h-5 text-amber-400" />,
          badgeStyle: "bg-amber-500/20 text-amber-300 border-amber-500/30",
          accentColor: "amber",
        };
      case "GUNSHOT":
        return {
          title: "Acoustic Shock: Gunshot Sound Detected",
          icon: <Volume2 className="w-5 h-5 text-rose-400" />,
          badgeStyle: "bg-rose-500/20 text-rose-300 border-rose-500/30",
          accentColor: "rose",
        };
      case "TAMPER":
        return {
          title: "Station Physical Disturbance / Tilt Alert",
          icon: <AlertTriangle className="w-5 h-5 text-sky-400" />,
          badgeStyle: "bg-sky-500/20 text-sky-300 border-sky-500/30",
          accentColor: "sky",
        };
      default:
        return {
          title: "Sensor Event Alert",
          icon: <ShieldAlert className="w-5 h-5 text-slate-300" />,
          badgeStyle: "bg-slate-800 text-slate-300 border-slate-700",
          accentColor: "slate",
        };
    }
  };

  const header = getThreatHeader(alert.threat);
  const recommendedAction = getRecommendedAction(alert.threat);

  // Asset configurations for Step 2
  const tacticalAssets = [
    {
      id: "RU-BRAVO",
      type: "VEHICLE" as const,
      name: "4WD Quick-Response Unit",
      callsign: "Bijrani Interceptor Unit (Vehicle)",
      speed: "45 km/h",
      eta: "4 Mins",
      crew: "3 Armed Forest Guards + Heavy Extinguisher Kit",
      icon: <Car className="w-5 h-5 text-amber-400" />,
      badge: "Fast Ground Intercept",
      badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    },
    {
      id: "RU-DRONE",
      type: "DRONE" as const,
      name: "SkyEye Recon Drone",
      callsign: "SkyEye-01 Thermal Recon UAV",
      speed: "65 km/h",
      eta: "2 Mins",
      crew: "Autonomous Flight • 4K Thermal FLIR Camera",
      icon: <Plane className="w-5 h-5 text-sky-400" />,
      badge: "Instant Aerial Survey",
      badgeColor: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    },
    {
      id: "RU-ALPHA",
      type: "FOOT" as const,
      name: "Foot Patrol Ranger Squad",
      callsign: "Dhikala Beat Rangers (4 Patrols)",
      speed: "5 km/h",
      eta: "8 Mins",
      crew: "Deep Forest Trail Infiltration • GPS Radios",
      icon: <Footprints className="w-5 h-5 text-emerald-400" />,
      badge: "Stealth Infiltration",
      badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    },
  ];

  const selectedAsset = tacticalAssets.find(a => a.id === selectedUnitId) || tacticalAssets[0];

  const handleExecuteDispatch = () => {
    if (selectedAsset.type === "DRONE") {
      soundFX.playDroneDeploySound();
    } else {
      soundFX.playDispatchChirp();
    }
    setDispatchSuccess(true);
    setStep(3);
    onDispatchUnit(alert.id, selectedUnitId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden font-sans text-xs flex flex-col max-h-[90vh]">
        {/* Header Banner */}
        <div className="p-4 bg-slate-950/70 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl border ${header.badgeStyle}`}>
              {header.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Incident Action Protocol
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

        {/* 3-Step Interactive Progress Tabs */}
        <div className="px-5 pt-3 pb-2 bg-slate-950/40 border-b border-white/5 shrink-0 flex items-center justify-between text-xs">
          <div 
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 cursor-pointer transition-all ${
              step === 1 ? "text-emerald-400 font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step === 1 ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-300"
            }`}>1</span>
            <span>Threat Review</span>
          </div>

          <div className="w-8 h-px bg-white/10" />

          <div 
            onClick={() => setStep(2)}
            className={`flex items-center gap-2 cursor-pointer transition-all ${
              step === 2 ? "text-emerald-400 font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step === 2 ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-300"
            }`}>2</span>
            <span>Select Tactical Asset</span>
          </div>

          <div className="w-8 h-px bg-white/10" />

          <div 
            onClick={() => dispatchSuccess && setStep(3)}
            className={`flex items-center gap-2 transition-all ${
              step === 3 ? "text-emerald-400 font-bold" : "text-slate-400"
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step === 3 ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-300"
            }`}>3</span>
            <span>Confirm Dispatch</span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5 text-xs text-slate-200">
          {/* ------------------------------------------------------------- */}
          {/* STEP 1: Threat Review & Confidence Check */}
          {/* ------------------------------------------------------------- */}
          {step === 1 && (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              {/* Location & AI Confidence Header Card */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-semibold text-white text-xs">
                      {alert.sector} • <span className="text-slate-400">{alert.nodeId} ({alert.nodeName})</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      GPS: {alert.lat.toFixed(4)}° N, {alert.lng.toFixed(4)}° E • Jim Corbett Reserve
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">AI Confidence</div>
                  <div className="text-base font-bold text-emerald-400">{alert.confidence.toFixed(0)}% Match</div>
                </div>
              </div>

              {/* 1. Dynamic Acoustic Spectrum Visualizer */}
              <AcousticSpectrumVisualizer threat={alert.threat} confidence={alert.confidence} />

              {/* Telemetry Snapshot Pill Matrix */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 text-center">
                  <div className="text-[10px] text-slate-400">Canopy Temp</div>
                  <div className="text-xs font-bold text-white mt-0.5">{alert.temp.toFixed(1)}°C</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 text-center">
                  <div className="text-[10px] text-slate-400">Air Humidity</div>
                  <div className="text-xs font-bold text-white mt-0.5">{alert.humidity.toFixed(0)}%</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 text-center">
                  <div className="text-[10px] text-slate-400">VOC / Smoke</div>
                  <div className={`text-xs font-bold mt-0.5 ${alert.vocGas < 30 ? "text-rose-400" : "text-emerald-400"}`}>
                    {alert.vocGas.toFixed(1)} kΩ
                  </div>
                </div>
              </div>

              {/* Recommended Action Protocol */}
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <div className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Standard Operating Protocol (SOP)</span>
                </div>
                <p className="text-slate-200 text-xs leading-relaxed">
                  {recommendedAction}
                </p>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STEP 2: Select Tactical Response Asset */}
          {/* ------------------------------------------------------------- */}
          {step === 2 && (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              <div className="text-slate-300 font-medium text-xs flex items-center justify-between">
                <span>Select Tactical Unit for Immediate Dispatch:</span>
                <span className="text-[11px] text-sky-400 font-mono">3 Units On Standby</span>
              </div>

              <div className="space-y-2.5">
                {tacticalAssets.map((asset) => {
                  const isSelected = selectedUnitId === asset.id;
                  return (
                    <div
                      key={asset.id}
                      onClick={() => {
                        soundFX.playBlip();
                        setSelectedUnitId(asset.id);
                        setSelectedAssetType(asset.type);
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-slate-900 border-sky-500/50 shadow-lg shadow-sky-500/10"
                          : "bg-slate-950/50 border-white/5 hover:border-white/15"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl border ${
                            isSelected ? "bg-sky-500/20 border-sky-500/40 text-sky-300" : "bg-slate-800/80 border-white/5 text-slate-400"
                          }`}>
                            {asset.icon}
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs flex items-center gap-2">
                              {asset.name}
                              <span className={`text-[10px] px-2 py-0.2 rounded-full border ${asset.badgeColor}`}>
                                {asset.badge}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{asset.callsign}</div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-[10px] text-slate-400">ETA to Beat</div>
                          <div className="text-xs font-bold text-emerald-400">{asset.eta}</div>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Speed: <strong className="text-slate-200">{asset.speed}</strong></span>
                        <span className="truncate max-w-[260px]">{asset.crew}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STEP 3: Confirm Dispatch & Live Tracking */}
          {/* ------------------------------------------------------------- */}
          {step === 3 && (
            <div className="space-y-4 animate-in zoom-in-95 duration-200">
              {/* Confirmed Dispatch Pulse Card */}
              <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-center space-y-3 relative overflow-hidden">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto animate-pulse">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>

                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Tactical Order Dispatched
                  </span>
                  <h3 className="text-base font-bold text-white mt-2">
                    {selectedAsset.name} En Route
                  </h3>
                  <p className="text-xs text-emerald-300/90 font-mono mt-1">
                    ETA: {selectedAsset.eta} • Coordinates: {alert.lat.toFixed(4)}° N, {alert.lng.toFixed(4)}° E
                  </p>
                </div>

                {/* LoRa Tactical Link Telemetry */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 text-left space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-sky-400" />
                      Encrypted LoRa Tactical Link:
                    </span>
                    <span className="font-mono text-emerald-400 font-semibold">Active (IN865 / 865.2 MHz)</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Assigned Beat Sector:</span>
                    <span className="text-slate-200">{alert.sector}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Threat Interception Window:</span>
                    <span className="text-amber-300 font-semibold">&lt; 45 Seconds</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer Buttons */}
        <div className="p-4 bg-slate-950/70 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
          {step === 1 && (
            <>
              <button
                onClick={() => {
                  soundFX.playAcknowledgeTone();
                  onAcknowledge(alert.id);
                }}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 font-medium text-xs transition-colors text-center"
              >
                Mark as False Alarm
              </button>

              <button
                onClick={() => {
                  soundFX.playBlip();
                  setStep(2);
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs tracking-wide transition-all shadow-md shadow-emerald-500/20"
              >
                <span>Select Tactical Asset</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button
                onClick={() => {
                  soundFX.playBlip();
                  setStep(1);
                }}
                className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 font-medium text-xs transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={handleExecuteDispatch}
                className="flex-[1.5] flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs tracking-wide transition-all shadow-md shadow-rose-500/25"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Execute Emergency Dispatch</span>
              </button>
            </>
          )}

          {step === 3 && (
            <button
              onClick={() => {
                soundFX.playBlip();
                onClose();
              }}
              className="w-full py-2.5 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs tracking-wide transition-all text-center"
            >
              Monitor Response on Satellite Map
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
