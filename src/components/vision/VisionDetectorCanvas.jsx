import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCw, Eye, EyeOff, ShieldCheck, Zap } from 'lucide-react';

export const VisionDetectorCanvas = ({ junction }) => {
  const canvasRef = useRef(null);
  const [selectedCam, setSelectedCam] = useState('north');
  const [showBoxes, setShowBoxes] = useState(true);
  const [showPolygons, setShowPolygons] = useState(true);
  const [showTripwires, setShowTripwires] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.55);

  const [fps, setFps] = useState(29.8);
  const [latency, setLatency] = useState(18.4);

  // Simulated bounding box tracking state
  const trackersRef = useRef([
    { id: 101, class: 'car', conf: 0.94, x: 260, y: 120, w: 70, h: 48, vx: 0.2, vy: 1.2, lane: 1 },
    { id: 102, class: 'two_wheeler', conf: 0.89, x: 210, y: 200, w: 26, h: 40, vx: 0.1, vy: 1.6, lane: 0 },
    { id: 103, class: 'auto', conf: 0.91, x: 340, y: 160, w: 55, h: 50, vx: -0.1, vy: 1.1, lane: 2 },
    { id: 104, class: 'bus', conf: 0.96, x: 280, y: 290, w: 90, h: 75, vx: 0.05, vy: 0.9, lane: 1 },
    { id: 105, class: 'car', conf: 0.87, x: 390, y: 340, w: 75, h: 52, vx: -0.1, vy: 1.3, lane: 2 },
  ]);

  const laneCounts = {
    lane0: 142,
    lane1: 310,
    lane2: 228
  };

  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = performance.now();

    const render = (time) => {
      frameCount++;
      if (time - fpsTimer >= 1000) {
        setFps(parseFloat((28 + Math.random() * 2.5).toFixed(1)));
        setLatency(parseFloat((17 + Math.random() * 2.8).toFixed(1)));
        fpsTimer = time;
      }

      const width = canvas.width;
      const height = canvas.height;

      // 1. Draw CCTV Camera Feed Backdrop (realistic dark perspective street scene)
      ctx.fillStyle = '#0B1220';
      ctx.fillRect(0, 0, width, height);

      // Road perspective surface
      const horizonY = 80;
      ctx.fillStyle = '#131D2F';
      ctx.beginPath();
      ctx.moveTo(width * 0.35, horizonY);
      ctx.lineTo(width * 0.65, horizonY);
      ctx.lineTo(width * 0.95, height);
      ctx.lineTo(width * 0.05, height);
      ctx.closePath();
      ctx.fill();

      // Road markings & perspective lanes
      ctx.strokeStyle = '#2A3C5B';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      // Lane 1 divider
      ctx.moveTo(width * 0.45, horizonY);
      ctx.lineTo(width * 0.35, height);
      // Lane 2 divider
      ctx.moveTo(width * 0.55, horizonY);
      ctx.lineTo(width * 0.65, height);
      ctx.stroke();

      // Yellow stop line near bottom
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(width * 0.12, height - 70);
      ctx.lineTo(width * 0.88, height - 70);
      ctx.stroke();

      // 2. Draw Virtual Detector Polygons / Induction Traps
      if (showPolygons) {
        ctx.fillStyle = 'rgba(34, 211, 238, 0.07)';
        ctx.strokeStyle = '#22D3EE';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);

        // Lane 0 ROI
        ctx.beginPath();
        ctx.moveTo(120, height - 80);
        ctx.lineTo(260, height - 80);
        ctx.lineTo(240, height - 160);
        ctx.lineTo(150, height - 160);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Lane 1 ROI
        ctx.beginPath();
        ctx.moveTo(270, height - 80);
        ctx.lineTo(440, height - 80);
        ctx.lineTo(390, height - 160);
        ctx.lineTo(250, height - 160);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.setLineDash([]);
      }

      // 3. Virtual Tripwire Line
      if (showTripwires) {
        ctx.strokeStyle = '#EC4899';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(80, height - 140);
        ctx.lineTo(width - 80, height - 140);
        ctx.stroke();

        ctx.fillStyle = '#EC4899';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText('TRIPWIRE_DET_L1: COUNT', 90, height - 146);
      }

      // 4. Update & Draw Bounding Boxes
      const trackers = trackersRef.current;
      trackers.forEach((trk) => {
        // Advance vehicle forward down the street
        trk.y += trk.vy * (1.2 + trk.y / 280);
        trk.x += trk.vx;
        trk.w = 40 + (trk.y / height) * 45;
        trk.h = 30 + (trk.y / height) * 35;

        // Reset if reached bottom
        if (trk.y > height - 30) {
          trk.y = horizonY + 10 + Math.random() * 30;
          trk.x = width * 0.38 + (Math.random() - 0.5) * 120;
          trk.conf = parseFloat((0.82 + Math.random() * 0.16).toFixed(2));
        }

        // Draw bounding box if enabled & above threshold
        if (showBoxes && trk.conf >= confidenceThreshold) {
          const color = trk.class === 'two_wheeler' ? '#38BDF8' : trk.class === 'car' ? '#818CF8' : trk.class === 'bus' ? '#F87171' : '#FBBF24';

          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.strokeRect(trk.x, trk.y, trk.w, trk.h);

          // Corner accents
          const cornerLen = 6;
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          // Top-left
          ctx.beginPath();
          ctx.moveTo(trk.x, trk.y + cornerLen);
          ctx.lineTo(trk.x, trk.y);
          ctx.lineTo(trk.x + cornerLen, trk.y);
          ctx.stroke();

          // Label chip
          const label = `${trk.class} #${trk.id} ${(trk.conf * 100).toFixed(0)}%`;
          ctx.fillStyle = color;
          ctx.font = 'bold 9px "JetBrains Mono", monospace';
          const textWidth = ctx.measureText(label).width;
          ctx.fillRect(trk.x, trk.y - 14, textWidth + 8, 14);

          ctx.fillStyle = '#0F172A';
          ctx.fillText(label, trk.x + 4, trk.y - 3);
        }
      });

      // 5. CCTV HUD Overlay: Crosshairs, Camera ID, Live timestamp
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      // Center crosshair
      ctx.beginPath();
      ctx.moveTo(width / 2 - 15, height / 2);
      ctx.lineTo(width / 2 + 15, height / 2);
      ctx.moveTo(width / 2, height / 2 - 15);
      ctx.lineTo(width / 2, height / 2 + 15);
      ctx.stroke();

      // Top CCTV Info
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.fillRect(10, 10, width - 20, 24);

      ctx.fillStyle = '#22D3EE';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.fillText(`CAM-DET-01 [${selectedCam.toUpperCase()}] • ${junction.code} ${junction.name}`, 18, 26);

      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(width - 95, 22, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#E2E8F0';
      ctx.fillText('REC • LIVE', width - 85, 26);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [selectedCam, showBoxes, showPolygons, showTripwires, confidenceThreshold, junction]);

  return (
    <div className="bg-[#111A2C] dark:bg-[#111A2C] light:bg-white rounded-lg border border-[#1F2A44] dark:border-[#1F2A44] light:border-slate-200 p-3.5 shadow-sm space-y-3">
      {/* Feed Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1F2A44] pb-2 font-mono">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            AI Vision Edge Stream
          </h3>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            ByteTrack-YOLOv8
          </span>
        </div>

        {/* Camera Selector Tabs */}
        <div className="flex items-center gap-1 bg-[#16223B] p-0.5 rounded border border-[#1F2A44] text-xs">
          {['north', 'south', 'east', 'west'].map((cam) => (
            <button
              key={cam}
              onClick={() => setSelectedCam(cam)}
              className={`px-2 py-0.5 rounded text-[11px] capitalize transition-all ${
                selectedCam === cam
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cam} Cam
            </button>
          ))}
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div className="relative rounded-lg overflow-hidden border border-[#1F2A44] bg-[#0A0F1D] shadow-inner">
        <canvas
          ref={canvasRef}
          width={640}
          height={380}
          className="w-full h-auto block max-h-[460px] object-cover"
        />

        {/* Real-time telemetry badges overlay */}
        <div className="absolute bottom-2 left-2 flex items-center gap-2 text-[10px] font-mono">
          <div className="bg-black/70 backdrop-blur px-2 py-0.5 rounded border border-white/10 text-slate-200">
            FPS: <span className="text-cyan-400 font-bold">{fps}</span>
          </div>
          <div className="bg-black/70 backdrop-blur px-2 py-0.5 rounded border border-white/10 text-slate-200">
            LATENCY: <span className="text-emerald-400 font-bold">{latency}ms</span>
          </div>
          <div className="bg-black/70 backdrop-blur px-2 py-0.5 rounded border border-white/10 text-slate-200">
            RESOL: <span className="text-slate-300">640x380 (letterbox)</span>
          </div>
        </div>

        {/* Overlay toggle toolbar */}
        <div className="absolute top-10 right-2 flex flex-col gap-1 text-[10px] font-mono">
          <button
            onClick={() => setShowBoxes(!showBoxes)}
            className={`px-2 py-1 rounded backdrop-blur border text-left flex items-center gap-1.5 ${
              showBoxes
                ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
                : 'bg-black/60 border-white/10 text-slate-400'
            }`}
          >
            {showBoxes ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            BBoxes
          </button>
          <button
            onClick={() => setShowPolygons(!showPolygons)}
            className={`px-2 py-1 rounded backdrop-blur border text-left ${
              showPolygons
                ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
                : 'bg-black/60 border-white/10 text-slate-400'
            }`}
          >
            ROI Polygons
          </button>
          <button
            onClick={() => setShowTripwires(!showTripwires)}
            className={`px-2 py-1 rounded backdrop-blur border text-left ${
              showTripwires
                ? 'bg-pink-500/20 border-pink-400/50 text-pink-300'
                : 'bg-black/60 border-white/10 text-slate-400'
            }`}
          >
            Tripwires
          </button>
        </div>
      </div>

      {/* Detection Confidence Slider & Live Lane Counters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs pt-1">
        <div className="bg-[#16223B]/60 p-2.5 rounded border border-[#1F2A44] flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400">Confidence Threshold</span>
            <div className="text-xs font-bold text-slate-200">
              Min: {(confidenceThreshold * 100).toFixed(0)}%
            </div>
          </div>
          <input
            type="range"
            min="0.30"
            max="0.90"
            step="0.05"
            value={confidenceThreshold}
            onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
            className="w-36 accent-cyan-400 cursor-pointer"
          />
        </div>

        <div className="bg-[#16223B]/60 p-2.5 rounded border border-[#1F2A44] flex items-center justify-around text-center">
          <div>
            <div className="text-[10px] text-slate-400">Lane 1 (Left)</div>
            <div className="text-sm font-bold text-cyan-300">{laneCounts.lane0} veh</div>
          </div>
          <div className="h-6 w-px bg-[#1F2A44]"></div>
          <div>
            <div className="text-[10px] text-slate-400">Lane 2 (Thru)</div>
            <div className="text-sm font-bold text-emerald-300">{laneCounts.lane1} veh</div>
          </div>
          <div className="h-6 w-px bg-[#1F2A44]"></div>
          <div>
            <div className="text-[10px] text-slate-400">Lane 3 (Right)</div>
            <div className="text-sm font-bold text-amber-300">{laneCounts.lane2} veh</div>
          </div>
        </div>
      </div>
    </div>
  );
};
