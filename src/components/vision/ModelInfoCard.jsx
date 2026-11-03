import React from 'react';
import { Cpu, CheckCircle, Zap, ShieldCheck, Layers, Award } from 'lucide-react';

export const ModelInfoCard = () => {
  return (
    <div className="bg-[#111A2C] dark:bg-[#111A2C] light:bg-white rounded-lg border border-[#1F2A44] dark:border-[#1F2A44] light:border-slate-200 p-4 shadow-sm font-mono space-y-4">
      <div className="flex items-center justify-between border-b border-[#1F2A44] pb-2.5">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-white dark:text-white light:text-slate-900 uppercase tracking-wider">
            Vision Inference Architecture (Edge Deploy)
          </h3>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
          TENSORRT-FP16 ACCELERATED
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-2.5 rounded bg-[#16223B]/60 border border-[#1F2A44]">
          <span className="text-[10px] text-slate-400">Object Detector</span>
          <div className="text-sm font-bold text-cyan-300 mt-0.5">YOLOv8n (Nano)</div>
          <p className="text-[10px] text-slate-400 mt-0.5">3.2M params • 8.7 GFLOPs</p>
        </div>

        <div className="p-2.5 rounded bg-[#16223B]/60 border border-[#1F2A44]">
          <span className="text-[10px] text-slate-400">Multi-Object Tracker</span>
          <div className="text-sm font-bold text-emerald-300 mt-0.5">ByteTrack</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Kalman Filter + IoU assoc.</p>
        </div>

        <div className="p-2.5 rounded bg-[#16223B]/60 border border-[#1F2A44]">
          <span className="text-[10px] text-slate-400">Target Accuracy</span>
          <div className="text-sm font-bold text-amber-300 mt-0.5">78.4% mAP@0.5</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Evaluated on UrbanTraffic-20k</p>
        </div>

        <div className="p-2.5 rounded bg-[#16223B]/60 border border-[#1F2A44]">
          <span className="text-[10px] text-slate-400">Inference Hardware</span>
          <div className="text-sm font-bold text-slate-200 mt-0.5">NVIDIA Jetson Orin</div>
          <p className="text-[10px] text-slate-400 mt-0.5">15W power envelope • 40 TOPS</p>
        </div>
      </div>

      {/* Class distribution table & weights */}
      <div className="p-3 rounded bg-[#16223B]/40 border border-[#1F2A44] space-y-2">
        <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
          <span>Supported Classes & IRC:106 PCU Weight Mapping</span>
          <span className="text-[10px] text-slate-400">Occlusion Recovery: Active</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-[10px]">
          <div className="bg-[#111A2C] p-2 rounded border border-[#1F2A44]">
            <span className="text-sky-400 font-bold">Two-Wheeler</span>
            <div className="text-slate-300 mt-0.5 font-bold">0.5 PCU</div>
            <div className="text-slate-500">Conf &gt; 0.50</div>
          </div>
          <div className="bg-[#111A2C] p-2 rounded border border-[#1F2A44]">
            <span className="text-indigo-400 font-bold">Passenger Car</span>
            <div className="text-slate-300 mt-0.5 font-bold">1.0 PCU</div>
            <div className="text-slate-500">Conf &gt; 0.55</div>
          </div>
          <div className="bg-[#111A2C] p-2 rounded border border-[#1F2A44]">
            <span className="text-amber-400 font-bold">Auto-Rickshaw</span>
            <div className="text-slate-300 mt-0.5 font-bold">0.8 PCU</div>
            <div className="text-slate-500">Conf &gt; 0.55</div>
          </div>
          <div className="bg-[#111A2C] p-2 rounded border border-[#1F2A44]">
            <span className="text-red-400 font-bold">Transit Bus</span>
            <div className="text-slate-300 mt-0.5 font-bold">2.2 PCU</div>
            <div className="text-slate-500">Conf &gt; 0.60</div>
          </div>
          <div className="bg-[#111A2C] p-2 rounded border border-[#1F2A44]">
            <span className="text-orange-400 font-bold">Heavy Truck</span>
            <div className="text-slate-300 mt-0.5 font-bold">2.5 PCU</div>
            <div className="text-slate-500">Conf &gt; 0.60</div>
          </div>
          <div className="bg-[#111A2C] p-2 rounded border border-[#1F2A44]">
            <span className="text-purple-400 font-bold">Emergency EMS</span>
            <div className="text-slate-300 mt-0.5 font-bold">PRIORITY 1</div>
            <div className="text-red-400 font-bold">Flash Preempt</div>
          </div>
        </div>
      </div>
    </div>
  );
};
