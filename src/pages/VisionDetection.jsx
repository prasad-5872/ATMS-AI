import React, { useState } from 'react';
import { useTraffic } from '../context/TrafficContext';
import { VisionDetectorCanvas } from '../components/vision/VisionDetectorCanvas';
import { ModelInfoCard } from '../components/vision/ModelInfoCard';
import { Camera, CheckCircle, Video, Server, Shield, Layers, Radio } from 'lucide-react';

export const VisionDetection = () => {
  const { systemState, selectedJunctionId, setSelectedJunctionId, selectedJunction } = useTraffic();
  const junctions = systemState?.junctions || [];

  return (
    <div className="space-y-4 font-mono">
      {/* Top Banner and Junction Picker */}
      <div className="bg-[#111A2C] dark:bg-[#111A2C] light:bg-white rounded-lg border border-[#1F2A44] dark:border-[#1F2A44] light:border-slate-200 p-3.5 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Edge CCTV Stream Analyzer:
              </span>
              <select
                value={selectedJunctionId}
                onChange={(e) => setSelectedJunctionId(e.target.value)}
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
              Live Edge Processing Pipeline: RTSP stream decoded &rarr; TensorRT YOLOv8n &rarr; ByteTrack Association &rarr; Virtual Loop Trigger
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            RTSP 1080p STREAM LIVE
          </span>
        </div>
      </div>

      {/* Main Vision Canvas with Bounding Boxes & Polygons */}
      <VisionDetectorCanvas junction={selectedJunction} />

      {/* Edge Model Info & Benchmark Card */}
      <ModelInfoCard />
    </div>
  );
};
