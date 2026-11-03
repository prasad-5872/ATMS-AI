import React from 'react';
import { useTraffic } from '../../context/TrafficContext';
import { Siren, Clock, ShieldCheck, ArrowRight, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const EmergencyCorridorView = () => {
  const { systemState, triggerEmergency } = useTraffic();
  const emergency = systemState?.emergencyCorridor;
  const isEmergency = emergency?.active;
  const currentJunctionId = emergency?.route?.[emergency?.currentJunctionIndex];

  return (
    <div className="space-y-4 font-mono">
      {/* Top Banner & Trigger */}
      <div className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 transition-all ${
        isEmergency
          ? 'bg-red-500/15 border-red-500/50 text-red-200'
          : 'bg-[#111A2C] border-[#1F2A44] text-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${isEmergency ? 'bg-red-500 text-white animate-bounce' : 'bg-red-500/10 text-red-400'}`}>
            <Siren className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Emergency Vehicle Corridor Preemption
              </h3>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                isEmergency ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-700 text-slate-300'
              }`}>
                {isEmergency ? 'PRIORITY 1 ACTIVE' : 'STANDBY'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated green corridor progression along Grand Arterial (J-06 → J-01 → J-09 → J-02)
            </p>
          </div>
        </div>

        <button
          onClick={triggerEmergency}
          disabled={isEmergency}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            isEmergency
              ? 'bg-red-500/20 text-red-400 border border-red-500/40 cursor-not-allowed'
              : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>{isEmergency ? 'CORRIDOR IN PROGRESS...' : 'SIMULATE EMERGENCY RUN'}</span>
        </button>
      </div>

      {/* Corridor Progress Waypoints */}
      <div className="bg-[#111A2C] dark:bg-[#111A2C] light:bg-white rounded-lg border border-[#1F2A44] dark:border-[#1F2A44] light:border-slate-200 p-4 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#1F2A44] pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Active Priority Route Waypoints
          </span>
          <div className="flex items-center gap-2 text-xs">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Next Junction ETA:</span>
            <span className="text-cyan-300 font-bold text-sm">
              {isEmergency ? `${emergency.etaSeconds}s` : '--'}
            </span>
          </div>
        </div>

        {/* Step Progression Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {emergency?.route.map((jId, idx) => {
            const isPassed = isEmergency && idx < emergency.currentJunctionIndex;
            const isCurrent = isEmergency && idx === emergency.currentJunctionIndex;
            const isPending = !isEmergency || idx > emergency.currentJunctionIndex;

            return (
              <div
                key={jId}
                className={`p-3 rounded-lg border flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md ring-1 ring-emerald-400'
                    : isPassed
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                    : 'bg-[#16223B]/50 border-[#1F2A44] text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">{jId}</span>
                  <span className="text-[10px] uppercase font-bold">
                    {isCurrent ? (
                      <span className="text-emerald-400 animate-pulse">PREEMPTED</span>
                    ) : isPassed ? (
                      <span className="text-cyan-400">CLEARED</span>
                    ) : (
                      'QUEUED'
                    )}
                  </span>
                </div>

                <div className="my-2">
                  <div className="text-[11px] font-semibold text-slate-200">
                    {jId === "J-06" && "University Cross"}
                    {jId === "J-01" && "Central Square"}
                    {jId === "J-09" && "Financial District"}
                    {jId === "J-02" && "Tech Corridor"}
                  </div>
                  <div className="text-[10px] text-slate-400">Grand Arterial N-S</div>
                </div>

                <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px]">
                  <span>Signal Aspect:</span>
                  <span className={`font-bold ${isCurrent ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {isCurrent ? 'FORCED GREEN' : isPassed ? 'RESUMED ADAPTIVE' : 'NORMAL'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Aggregate Emergency Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-[#16223B]/60 p-3 rounded border border-[#1F2A44] text-center">
            <span className="text-[10px] text-slate-400 uppercase">Emergency Preemption Invocations</span>
            <div className="text-xl font-bold text-white mt-0.5">24 runs</div>
            <span className="text-[10px] text-emerald-400">100% fail-safe clearance</span>
          </div>

          <div className="bg-[#16223B]/60 p-3 rounded border border-[#1F2A44] text-center">
            <span className="text-[10px] text-slate-400 uppercase">Total Cumulative Delay Saved</span>
            <div className="text-xl font-bold text-cyan-300 mt-0.5">{emergency?.delaySavedSeconds || 142}s</div>
            <span className="text-[10px] text-slate-400">~2.3 min per ambulance transit</span>
          </div>

          <div className="bg-[#16223B]/60 p-3 rounded border border-[#1F2A44] text-center">
            <span className="text-[10px] text-slate-400 uppercase">Post-Clearance Network Recovery</span>
            <div className="text-xl font-bold text-amber-300 mt-0.5">3.4 cycles</div>
            <span className="text-[10px] text-slate-400">Return to baseline queue</span>
          </div>
        </div>
      </div>

      {/* Preemption Event Audit Log */}
      <div className="bg-[#111A2C] dark:bg-[#111A2C] light:bg-white rounded-lg border border-[#1F2A44] dark:border-[#1F2A44] light:border-slate-200 p-4 shadow-sm space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
          Preemption Event Historical Audit Log
        </h4>
        <div className="space-y-2 text-xs">
          {emergency?.log.map((entry, i) => (
            <div
              key={i}
              className="p-2.5 rounded bg-[#16223B]/50 border border-[#1F2A44] flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-slate-200">{entry.event}</div>
                  <div className="text-[10px] text-slate-400">{entry.time} IST • Priority Verified</div>
                </div>
              </div>
              <span className="text-[11px] font-bold text-cyan-300 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                +{entry.savedSec}s saved
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
