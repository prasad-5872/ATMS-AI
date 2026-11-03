import React from 'react';
import { PHASE_CONFIG } from '../../simulation/engine';
import { Car, Layers, Clock, ArrowRight } from 'lucide-react';

export const ApproachCard = ({ approachKey, data, currentPhase, phaseState, timerRemaining }) => {
  const activePhase = PHASE_CONFIG[currentPhase] || PHASE_CONFIG[0];
  const nextPhase = PHASE_CONFIG[(currentPhase + 1) % 4];

  const isCurrentActive = activePhase.activeApproaches.includes(approachKey);
  const statusColor = isCurrentActive
    ? phaseState === "GREEN"
      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
      : phaseState === "YELLOW"
      ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
      : "text-red-400 bg-red-500/10 border-red-500/30"
    : "text-red-400 bg-red-500/10 border-red-500/30";

  const statusLabel = isCurrentActive ? phaseState : "STOP (RED)";

  return (
    <div className="bg-[#111A2C] dark:bg-[#111A2C] light:bg-white rounded-lg border border-[#1F2A44] dark:border-[#1F2A44] light:border-slate-200 p-3 shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1F2A44] pb-2">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
            Approach ({approachKey.toUpperCase()})
          </span>
          <h4 className="text-xs font-bold text-white dark:text-white light:text-slate-900 truncate">
            {data.name}
          </h4>
        </div>
        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 my-2.5 font-mono">
        {/* Queue Length */}
        <div className="bg-[#16223B]/60 p-2 rounded border border-[#1F2A44]/50">
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <Layers className="w-3 h-3 text-cyan-400" />
            <span>Queue</span>
          </div>
          <div className="text-base font-bold text-white mt-0.5">
            {data.queueVeh} <span className="text-[10px] font-normal text-slate-400">veh</span>
          </div>
        </div>

        {/* PCU Weight */}
        <div className="bg-[#16223B]/60 p-2 rounded border border-[#1F2A44]/50">
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <Car className="w-3 h-3 text-amber-400" />
            <span>PCU Load</span>
          </div>
          <div className="text-base font-bold text-amber-300 mt-0.5">
            {data.pcu} <span className="text-[10px] font-normal text-slate-400">PCU</span>
          </div>
        </div>

        {/* Flow Count */}
        <div className="bg-[#16223B]/60 p-2 rounded border border-[#1F2A44]/50">
          <div className="text-[10px] text-slate-400">Total Count</div>
          <div className="text-sm font-bold text-slate-200 mt-0.5">
            {data.countVeh} <span className="text-[10px] font-normal text-slate-400">veh/h</span>
          </div>
        </div>

        {/* Lanes & Health */}
        <div className="bg-[#16223B]/60 p-2 rounded border border-[#1F2A44]/50">
          <div className="text-[10px] text-slate-400">Lanes / Sensor</div>
          <div className="text-sm font-bold text-slate-200 mt-0.5 flex items-center justify-between">
            <span>{data.lanes}L</span>
            <span className={`text-[10px] px-1 rounded ${data.detectorHealth === 'NORMAL' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
              {data.detectorHealth}
            </span>
          </div>
        </div>
      </div>

      {/* Footer countdown and next phase */}
      <div className="pt-2 border-t border-[#1F2A44] flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-cyan-400" />
          <span>
            {isCurrentActive ? (
              <span className="text-cyan-300 font-bold">{timerRemaining}s left</span>
            ) : (
              <span>Red wait</span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px]">
          <span>Next:</span>
          <span className="text-slate-300 font-bold">{nextPhase.code}</span>
          <ArrowRight className="w-3 h-3 text-slate-500" />
        </div>
      </div>
    </div>
  );
};
