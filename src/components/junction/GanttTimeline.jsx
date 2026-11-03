import React from 'react';

export const GanttTimeline = ({ junction, cycleHistory }) => {
  const currentJunctionHistory = cycleHistory?.[junction.id] || [];

  // Phase colors for Gantt chart
  const phaseColors = {
    0: { bg: 'bg-emerald-500', border: 'border-emerald-600', name: 'P1: N-S Thru' },
    1: { bg: 'bg-teal-500', border: 'border-teal-600', name: 'P2: N-S Right' },
    2: { bg: 'bg-sky-500', border: 'border-sky-600', name: 'P3: E-W Thru' },
    3: { bg: 'bg-indigo-500', border: 'border-indigo-600', name: 'P4: E-W Right' },
  };

  // Planned next cycle structure
  const plannedNextCycle = {
    totalDuration: junction.cycleLength,
    phases: [
      { phaseId: 0, green: Math.round(junction.cycleLength * 0.36), yellow: 3, allRed: 2 },
      { phaseId: 1, green: Math.round(junction.cycleLength * 0.18), yellow: 3, allRed: 2 },
      { phaseId: 2, green: Math.round(junction.cycleLength * 0.28), yellow: 3, allRed: 2 },
      { phaseId: 3, green: Math.round(junction.cycleLength * 0.18), yellow: 3, allRed: 2 },
    ]
  };

  return (
    <div className="bg-[#111A2C] dark:bg-[#111A2C] light:bg-white rounded-lg border border-[#1F2A44] dark:border-[#1F2A44] light:border-slate-200 p-3.5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-xs font-bold font-mono text-white dark:text-white light:text-slate-900 uppercase tracking-wider">
            Signal Phase Gantt Timeline Strip
          </h3>
          <p className="text-[11px] text-slate-400 font-mono">
            Historical 5 Cycles & Planned Next Adaptive Cycle (Cycle Length: {junction.cycleLength}s)
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
            <span className="text-slate-300">P1 (N-S Thru)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-teal-500"></span>
            <span className="text-slate-300">P2 (N-S Right)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-sky-500"></span>
            <span className="text-slate-300">P3 (E-W Thru)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-indigo-500"></span>
            <span className="text-slate-300">P4 (E-W Right)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
            <span className="text-amber-400 font-bold">Y (3s)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-red-600"></span>
            <span className="text-red-400 font-bold">AR (2s)</span>
          </div>
        </div>
      </div>

      {/* Timeline Rows */}
      <div className="space-y-2 font-mono text-[10px]">
        {/* Planned Cycle (Future) */}
        <div className="flex items-center gap-2">
          <div className="w-24 shrink-0 text-slate-400 flex items-center justify-between">
            <span className="text-cyan-400 font-bold">NEXT CYCLE</span>
            <span className="text-[9px] text-slate-500">PLANNED</span>
          </div>
          <div className="flex-1 h-6 bg-[#0B1220] rounded border border-dashed border-cyan-500/50 flex overflow-hidden p-0.5">
            {plannedNextCycle.phases.map((p, idx) => {
              const total = plannedNextCycle.totalDuration;
              const greenPct = (p.green / total) * 100;
              const yellowPct = (p.yellow / total) * 100;
              const allRedPct = (p.allRed / total) * 100;
              const color = phaseColors[p.phaseId];

              return (
                <React.Fragment key={`next-${idx}`}>
                  <div
                    style={{ width: `${greenPct}%` }}
                    className={`${color.bg} h-full flex items-center justify-center text-slate-950 font-bold text-[9px] truncate px-0.5`}
                    title={`P${p.phaseId + 1} Green: ${p.green}s`}
                  >
                    P{p.phaseId + 1} ({p.green}s)
                  </div>
                  <div
                    style={{ width: `${yellowPct}%` }}
                    className="bg-amber-500 h-full flex items-center justify-center text-slate-950 font-bold text-[8px]"
                    title="Yellow clearance 3s"
                  >
                    Y
                  </div>
                  <div
                    style={{ width: `${allRedPct}%` }}
                    className="bg-red-600 h-full flex items-center justify-center text-white font-bold text-[8px]"
                    title="All-Red clearance 2s"
                  >
                    AR
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Past 5 Cycles */}
        {currentJunctionHistory.slice(0, 5).map((cycle, cIdx) => (
          <div key={`hist-${cIdx}`} className="flex items-center gap-2">
            <div className="w-24 shrink-0 text-slate-400 flex items-center justify-between">
              <span>Cycle -{cIdx + 1}</span>
              <span className="text-[9px] text-slate-500">{cycle.totalDuration}s</span>
            </div>
            <div className="flex-1 h-5 bg-[#0B1220] rounded border border-[#1F2A44] flex overflow-hidden">
              {cycle.phases.map((p, pIdx) => {
                const total = cycle.totalDuration;
                const greenPct = (p.green / total) * 100;
                const yellowPct = (p.yellow / total) * 100;
                const allRedPct = (p.allRed / total) * 100;
                const color = phaseColors[p.phaseId] || phaseColors[0];

                return (
                  <React.Fragment key={`p-${pIdx}`}>
                    <div
                      style={{ width: `${greenPct}%` }}
                      className={`${color.bg} opacity-90 h-full flex items-center justify-center text-slate-950 font-semibold text-[8px] truncate`}
                      title={`Phase ${p.name}: ${p.green}s Green`}
                    >
                      {p.green > 14 ? `P${p.phaseId + 1}: ${p.green}s` : `P${p.phaseId + 1}`}
                    </div>
                    <div
                      style={{ width: `${yellowPct}%` }}
                      className="bg-amber-500 h-full flex items-center justify-center text-slate-950 font-bold text-[8px]"
                      title="Yellow: 3s"
                    >
                      {p.yellow}s
                    </div>
                    <div
                      style={{ width: `${allRedPct}%` }}
                      className="bg-red-600 h-full flex items-center justify-center text-white font-bold text-[8px]"
                      title="All-Red: 2s"
                    >
                      {p.allRed}s
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
