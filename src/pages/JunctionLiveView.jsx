import React, { useState } from 'react';
import { useTraffic } from '../context/TrafficContext';
import { IntersectionSvg } from '../components/junction/IntersectionSvg';
import { ApproachCard } from '../components/junction/ApproachCard';
import { GanttTimeline } from '../components/junction/GanttTimeline';
import { ControllerPanel } from '../components/junction/ControllerPanel';
import { SafetyInterlockPanel } from '../components/junction/SafetyInterlockPanel';
import { DetectorHealthPanel } from '../components/junction/DetectorHealthPanel';
import { GitCommit, Radio, Navigation, ShieldAlert, Cpu } from 'lucide-react';

export const JunctionLiveView = () => {
  const { systemState, selectedJunctionId, setSelectedJunctionId, selectedJunction } = useTraffic();
  const [interlockError, setInterlockError] = useState(null);

  const junctions = systemState?.junctions || [];
  const cycleHistory = systemState?.cycleHistory || {};

  if (!selectedJunction) {
    return (
      <div className="p-8 text-center text-slate-400 font-mono">
        Loading junction telemetry...
      </div>
    );
  }

  const approaches = selectedJunction.approaches;

  return (
    <div className="space-y-4 font-mono">
      {/* Top Junction Selector Bar */}
      <div className="bg-[#111A2C] dark:bg-[#111A2C] light:bg-white rounded-lg border border-[#1F2A44] dark:border-[#1F2A44] light:border-slate-200 p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <GitCommit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Select Controlled Node:
              </span>
              <select
                value={selectedJunctionId}
                onChange={(e) => {
                  setSelectedJunctionId(e.target.value);
                  setInterlockError(null);
                }}
                className="bg-[#16223B] text-cyan-300 font-bold text-xs px-2.5 py-1 rounded border border-[#1F2A44] focus:outline-none cursor-pointer"
              >
                {junctions.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.code}: {j.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Corridor: <span className="text-slate-300">{selectedJunction.corridor}</span> • Coordinates: {selectedJunction.lat.toFixed(4)}, {selectedJunction.lng.toFixed(4)}
            </p>
          </div>
        </div>

        {/* Junction High-Level Status Badges */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-2.5 py-1 rounded bg-[#16223B] border border-[#1F2A44] text-slate-300">
            Mode: <strong className="text-cyan-400">{selectedJunction.controllerMode}</strong>
          </div>
          <div className="px-2.5 py-1 rounded bg-[#16223B] border border-[#1F2A44] text-slate-300">
            Delay: <strong className="text-white">{selectedJunction.metrics.avgDelaySec}s</strong>
          </div>
          <div className="px-2.5 py-1 rounded bg-[#16223B] border border-[#1F2A44] text-slate-300">
            Congestion: <strong className={
              selectedJunction.metrics.congestionLevel === 'high' ? 'text-red-400 uppercase' :
              selectedJunction.metrics.congestionLevel === 'medium' ? 'text-amber-400 uppercase' : 'text-emerald-400 uppercase'
            }>
              {selectedJunction.metrics.congestionLevel}
            </strong>
          </div>
        </div>
      </div>

      {/* Main Grid: SVG Intersection on left, Approach Cards on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Top-Down 4-Way Intersection SVG (6 cols) */}
        <div className="lg:col-span-6 bg-[#111A2C] dark:bg-[#111A2C] light:bg-white rounded-lg border border-[#1F2A44] dark:border-[#1F2A44] light:border-slate-200 p-4 shadow-sm flex flex-col items-center justify-center">
          <div className="w-full flex items-center justify-between mb-3 text-xs">
            <span className="font-bold text-slate-200 uppercase tracking-wider">
              Geometric Intersection Plan & Aspect Vectors
            </span>
            <span className="text-[10px] text-slate-400">
              Live Phase: <span className="text-cyan-400 font-bold">{selectedJunction.phaseState}</span>
            </span>
          </div>

          <IntersectionSvg junction={selectedJunction} />
        </div>

        {/* 4 Approach Cards (6 cols: 2x2 grid) */}
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ApproachCard
            approachKey="north"
            data={approaches.north}
            currentPhase={selectedJunction.currentPhase}
            phaseState={selectedJunction.phaseState}
            timerRemaining={selectedJunction.phaseTimer}
          />
          <ApproachCard
            approachKey="south"
            data={approaches.south}
            currentPhase={selectedJunction.currentPhase}
            phaseState={selectedJunction.phaseState}
            timerRemaining={selectedJunction.phaseTimer}
          />
          <ApproachCard
            approachKey="east"
            data={approaches.east}
            currentPhase={selectedJunction.currentPhase}
            phaseState={selectedJunction.phaseState}
            timerRemaining={selectedJunction.phaseTimer}
          />
          <ApproachCard
            approachKey="west"
            data={approaches.west}
            currentPhase={selectedJunction.currentPhase}
            phaseState={selectedJunction.phaseState}
            timerRemaining={selectedJunction.phaseTimer}
          />
        </div>
      </div>

      {/* Gantt Timeline Strip (Last 5 Cycles + Next Planned) */}
      <GanttTimeline junction={selectedJunction} cycleHistory={cycleHistory} />

      {/* Controller Mode & Manual Override Panel */}
      <ControllerPanel
        junction={selectedJunction}
        onInterlockError={(reason) => setInterlockError(reason)}
      />

      {/* Safety Interlock Panel */}
      <SafetyInterlockPanel
        junction={selectedJunction}
        lastInterlockError={interlockError}
        clearError={() => setInterlockError(null)}
      />

      {/* Approach Detector Health & Fault Injection Panel */}
      <DetectorHealthPanel junction={selectedJunction} />
    </div>
  );
};
