import React, { useState } from 'react';
import { useTraffic } from '../../context/TrafficContext';
import { Sliders, AlertTriangle, ShieldCheck, Play, Radio, CheckCircle, Info } from 'lucide-react';

export const ControllerPanel = ({ junction, onInterlockError }) => {
  const { setControllerMode, forcePhase } = useTraffic();
  const [pendingMode, setPendingMode] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);

  const modes = [
    { id: "Adaptive", label: "Adaptive (PCU-Weighted)", desc: "Dynamic green allocation based on live detector queue PCU", color: "text-cyan-400 border-cyan-500" },
    { id: "Fixed-time", label: "Fixed-time (Webster)", desc: "Predetermined TOD cycle splits without sensor adaptation", color: "text-slate-300 border-slate-500" },
    { id: "Manual", label: "Manual Operator Override", desc: "Supervised phase hold and advance; safety interlock enforced", color: "text-amber-400 border-amber-500" },
    { id: "Fail-safe", label: "Fail-safe Fallback", desc: "Conservative flashing or fixed timing for sensor fault mitigation", color: "text-orange-400 border-orange-500" },
    { id: "Emergency", label: "Emergency Preemption", desc: "Corridor priority override for inbound emergency vehicles", color: "text-red-400 border-red-500" },
  ];

  const handleModeClick = (modeId) => {
    if (modeId === junction.controllerMode) return;
    setPendingMode(modeId);
    setShowConfirmModal(true);
  };

  const confirmModeSwitch = async () => {
    if (!pendingMode) return;
    const res = await setControllerMode(junction.id, pendingMode);
    setShowConfirmModal(false);
    setPendingMode(null);
    if (res.success) {
      setActionFeedback({ type: 'success', text: res.message });
      setTimeout(() => setActionFeedback(null), 4000);
    } else {
      onInterlockError(res.reason);
    }
  };

  const handleForcePhase = async (phaseId) => {
    const res = await forcePhase(junction.id, phaseId);
    if (res.success) {
      setActionFeedback({ type: 'success', text: res.message });
      setTimeout(() => setActionFeedback(null), 5000);
    } else {
      onInterlockError(res.reason);
    }
  };

  return (
    <div className="bg-[#111A2C] dark:bg-[#111A2C] light:bg-white rounded-lg border border-[#1F2A44] dark:border-[#1F2A44] light:border-slate-200 p-3.5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1F2A44] pb-2">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold font-mono text-white dark:text-white light:text-slate-900 uppercase tracking-wider">
            Controller Operating Mode & Splits
          </h3>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
          Active: {junction.controllerMode}
        </span>
      </div>

      {/* Mode Buttons Grid */}
      <div>
        <div className="text-[10px] font-mono uppercase text-slate-400 mb-1.5">
          Select Signal Controller Mode (Operator Confirmation Required):
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 font-mono">
          {modes.map((m) => {
            const isActive = junction.controllerMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => handleModeClick(m.id)}
                className={`p-2 rounded border text-left flex flex-col justify-between transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-sm'
                    : 'bg-[#16223B]/60 border-[#1F2A44] text-slate-400 hover:border-slate-500 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold">{m.id}</span>
                  {isActive && <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />}
                </div>
                <p className="text-[9px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                  {m.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual Phase Force Controls */}
      <div className="p-2.5 rounded bg-[#16223B]/50 border border-[#1F2A44] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-mono font-bold text-slate-200">
              Manual Phase Forcing
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {junction.controllerMode === "Manual" ? (
              <span className="text-emerald-400 font-bold">MANUAL MODE ENABLED</span>
            ) : (
              <span className="text-amber-400 font-bold">INTERLOCKED (Set Manual First)</span>
            )}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
          {[
            { id: 0, code: "P1", name: "North-South Thru" },
            { id: 1, code: "P2", name: "North-South Right" },
            { id: 2, code: "P3", name: "East-West Thru" },
            { id: 3, code: "P4", name: "East-West Right" },
          ].map((phase) => {
            const isCurrent = junction.currentPhase === phase.id;
            return (
              <button
                key={phase.id}
                onClick={() => handleForcePhase(phase.id)}
                disabled={isCurrent}
                className={`py-1.5 px-2 rounded border text-center transition-all ${
                  isCurrent
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold cursor-default'
                    : 'bg-[#111A2C] border-[#1F2A44] text-slate-300 hover:border-amber-500 hover:text-amber-300'
                }`}
              >
                <div className="font-bold">{phase.code}: {phase.name}</div>
                <div className="text-[9px] text-slate-400">
                  {isCurrent ? "ACTIVE NOW" : "FORCE ADVANCE"}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Controller Parameters & Splits */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="bg-[#16223B]/60 p-2.5 rounded border border-[#1F2A44]">
          <span className="text-[10px] text-slate-400">Cycle Length</span>
          <div className="text-base font-bold text-white mt-0.5">
            {junction.cycleLength} <span className="text-[10px] font-normal text-slate-400">s</span>
          </div>
        </div>

        <div className="bg-[#16223B]/60 p-2.5 rounded border border-[#1F2A44]">
          <span className="text-[10px] text-slate-400">Min / Max Green</span>
          <div className="text-base font-bold text-white mt-0.5">
            10s / 60s
          </div>
        </div>

        <div className="bg-[#16223B]/60 p-2.5 rounded border border-[#1F2A44]">
          <span className="text-[10px] text-slate-400">Yellow / All-Red</span>
          <div className="text-base font-bold text-white mt-0.5">
            3s / 2s
          </div>
        </div>

        <div className="bg-[#16223B]/60 p-2.5 rounded border border-[#1F2A44]">
          <span className="text-[10px] text-slate-400">N-S vs E-W Split</span>
          <div className="text-base font-bold text-cyan-300 mt-0.5">
            58% / 42%
          </div>
        </div>
      </div>

      {/* Action feedback toast */}
      {actionFeedback && (
        <div className="p-2 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{actionFeedback.text}</span>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111A2C] border border-[#1F2A44] rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4 font-mono">
            <div className="flex items-center gap-2 text-amber-400 border-b border-[#1F2A44] pb-3">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Confirm Controller Mode Switch
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              You are about to switch <strong className="text-cyan-400">{junction.name}</strong> from{" "}
              <strong className="text-slate-200">{junction.controllerMode}</strong> to{" "}
              <strong className="text-amber-400">{pendingMode}</strong>.
            </p>

            <div className="p-3 rounded bg-[#16223B] border border-[#1F2A44] text-[11px] text-slate-400">
              <div className="font-bold text-slate-300 mb-1 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                Interlock Verification:
              </div>
              All mode transitions will execute safe transition clearance (3s yellow followed by 2s all-red) before engaging new timing patterns.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-3 py-1.5 rounded text-xs text-slate-300 hover:bg-[#1F2A44]"
              >
                Cancel
              </button>
              <button
                onClick={confirmModeSwitch}
                className="px-4 py-1.5 rounded text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow"
              >
                Authorize Switch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
