import React from 'react';
import { useTraffic } from '../../context/TrafficContext';
import { Camera, Radio, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';

export const DetectorHealthPanel = ({ junction }) => {
  const { toggleDetectorStatus } = useTraffic();

  return (
    <div className="bg-[#111A2C] dark:bg-[#111A2C] light:bg-white rounded-lg border border-[#1F2A44] dark:border-[#1F2A44] light:border-slate-200 p-3.5 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-[#1F2A44] pb-2">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold font-mono text-white dark:text-white light:text-slate-900 uppercase tracking-wider">
            Approach Detector Health & Telemetry
          </h4>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          Click any detector to simulate fault / fail-safe
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 font-mono text-xs">
        {junction.detectors.map((det) => {
          const isOk = det.status === "OK";
          const app = junction.approaches[det.approach];

          return (
            <div
              key={det.id}
              onClick={() => toggleDetectorStatus(junction.id, det.id)}
              className={`p-2.5 rounded border cursor-pointer transition-all ${
                isOk
                  ? 'bg-[#16223B]/60 border-[#1F2A44] hover:border-slate-500'
                  : 'bg-red-500/15 border-red-500/50 hover:border-red-400'
              }`}
              title="Click to toggle fault status"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">{det.id}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                    isOk
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-red-500/30 text-red-300 animate-pulse'
                  }`}
                >
                  {det.status}
                </span>
              </div>

              <div className="mt-1.5 text-[10px] text-slate-400 space-y-0.5">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="text-slate-300">{det.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Approach:</span>
                  <span className="text-cyan-300 uppercase">{det.approach}</span>
                </div>
                <div className="flex justify-between">
                  <span>Latency / FPS:</span>
                  <span className="text-slate-300 font-bold">
                    {det.fps ? `${det.fps} FPS / ` : ''}{app?.lastAgeMs || det.latencyMs}ms
                  </span>
                </div>
              </div>

              <div className="mt-2 pt-1 border-t border-[#1F2A44] text-[9px] text-slate-500 flex items-center justify-between">
                <span>Action:</span>
                <span className="text-cyan-400 hover:underline">
                  {isOk ? "Simulate Dropout" : "Restore Link"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
