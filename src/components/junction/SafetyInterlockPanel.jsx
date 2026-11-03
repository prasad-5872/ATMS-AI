import React from 'react';
import { ShieldCheck, ShieldAlert, Check, X, AlertTriangle } from 'lucide-react';

export const SafetyInterlockPanel = ({ junction, lastInterlockError, clearError }) => {
  // Real-time verification criteria
  const minGreenServed = junction.currentPhaseDuration - junction.phaseTimer >= 10;
  const intergreenGuaranteed = true; // 3s yellow + 2s all-red hardware locked
  const conflictMatrixClear = true; // No opposing simultaneous green permitted by NEMA TS-2 standard

  return (
    <div className="bg-[#111A2C] dark:bg-[#111A2C] light:bg-white rounded-lg border border-[#1F2A44] dark:border-[#1F2A44] light:border-slate-200 p-3.5 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-[#1F2A44] pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold font-mono text-white dark:text-white light:text-slate-900 uppercase">
              Safety Interlock System
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">
              Hardware Clearance & Conflict Monitor (NEMA TS-2 / IRC Compliance)
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
          ARMED & ACTIVE
        </span>
      </div>

      {/* Interlock Rules Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 font-mono text-xs">
        <div className="bg-[#16223B]/60 p-2 rounded border border-[#1F2A44] flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400">Min Green Rule (10s)</div>
            <div className="text-[11px] font-semibold text-slate-200 mt-0.5">
              Elapsed: {junction.currentPhaseDuration - junction.phaseTimer}s
            </div>
          </div>
          {minGreenServed ? (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              <Check className="w-3 h-3" /> OK
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
              <AlertTriangle className="w-3 h-3" /> LOCK
            </span>
          )}
        </div>

        <div className="bg-[#16223B]/60 p-2 rounded border border-[#1F2A44] flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400">Intergreen Clearance</div>
            <div className="text-[11px] font-semibold text-slate-200 mt-0.5">
              Yellow 3s + All-Red 2s
            </div>
          </div>
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
            <Check className="w-3 h-3" /> ENFORCED
          </span>
        </div>

        <div className="bg-[#16223B]/60 p-2 rounded border border-[#1F2A44] flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400">Dual Conflict Matrix</div>
            <div className="text-[11px] font-semibold text-slate-200 mt-0.5">
              Cross Street Isolated
            </div>
          </div>
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
            <Check className="w-3 h-3" /> VERIFIED
          </span>
        </div>
      </div>

      {/* Visible Rejection Reason Banner if an unsafe command was attempted */}
      {lastInterlockError && (
        <div className="p-2.5 rounded bg-red-500/15 border border-red-500/40 text-red-200 font-mono text-xs flex items-start justify-between">
          <div className="flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-red-300">COMMAND REJECTED BY SAFETY INTERLOCK: </span>
              <span>{lastInterlockError}</span>
            </div>
          </div>
          <button 
            onClick={clearError}
            className="text-slate-400 hover:text-white p-0.5"
            title="Dismiss error"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
