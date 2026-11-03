import React from 'react';
import { useTraffic } from '../../context/TrafficContext';
import { AlertCircle, Cpu, Wifi } from 'lucide-react';

export const Footer = () => {
  const { systemState } = useTraffic();
  const tickMs = systemState?.serverStatus?.engineTickMs || 1000;

  return (
    <footer className="h-7 border-t border-[#1F2A44] dark:border-[#1F2A44] light:border-slate-200 bg-[#0A0F1D] text-slate-400 px-4 flex items-center justify-between text-[11px] font-mono shrink-0 select-none">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1 text-amber-400 font-medium">
          <AlertCircle className="w-3.5 h-3.5" />
          Research prototype, not for real road use.
        </span>
        <span className="text-slate-600 hidden md:inline">|</span>
        <span className="text-slate-400 hidden md:inline">
          Fictional topologies. Traffic flow simulated via Poisson stochastic arrival generator.
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Wifi className="w-3 h-3 text-emerald-400" />
          <span className="text-slate-300">
            DATA LAYER: <span className="text-cyan-400">dataService.js</span> (Pluggable FastAPI/MQTT)
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-500">
          <Cpu className="w-3 h-3 text-slate-400" />
          <span>TICK: {Math.round(tickMs)}ms</span>
        </div>
      </div>
    </footer>
  );
};
