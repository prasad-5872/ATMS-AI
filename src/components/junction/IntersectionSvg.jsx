import React, { useEffect, useState, useRef } from 'react';
import { PHASE_CONFIG } from '../../simulation/engine';

export const IntersectionSvg = ({ junction }) => {
  const [vehicles, setVehicles] = useState([]);
  const animRef = useRef(null);
  const nextIdRef = useRef(1);

  // Determine signal aspect per approach
  // Phase 0: N-S Through
  // Phase 1: N-S Right Turn
  // Phase 2: E-W Through
  // Phase 3: E-W Right Turn
  const activePhase = PHASE_CONFIG[junction.currentPhase] || PHASE_CONFIG[0];
  const phaseState = junction.phaseState; // GREEN, YELLOW, ALL_RED

  const getSignalColor = (approach) => {
    if (phaseState === "ALL_RED") return "RED";
    if (activePhase.activeApproaches.includes(approach)) {
      return phaseState; // GREEN or YELLOW
    }
    return "RED";
  };

  const northSignal = getSignalColor("north");
  const southSignal = getSignalColor("south");
  const eastSignal = getSignalColor("east");
  const westSignal = getSignalColor("west");

  // Spawn and advance simulated vehicle dots along lanes
  useEffect(() => {
    // Generate initial vehicle cohort
    const initialVehicles = [];
    const approaches = ["north", "south", "east", "west"];
    const types = ["car", "two_wheeler", "auto", "bus"];

    for (let i = 0; i < 22; i++) {
      const approach = approaches[Math.floor(Math.random() * approaches.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const lane = Math.floor(Math.random() * 2); // 0 or 1
      initialVehicles.push({
        id: nextIdRef.current++,
        approach,
        type,
        lane,
        progress: Math.random() * 0.45, // 0 = start of approach, 0.42 = stop line, 1.0 = exit
        speed: 0.003 + Math.random() * 0.002,
      });
    }
    setVehicles(initialVehicles);
  }, [junction.id]);

  useEffect(() => {
    let lastTime = performance.now();

    const loop = (time) => {
      const delta = Math.min(50, time - lastTime);
      lastTime = time;

      setVehicles((prev) => {
        const updated = [];

        // Randomly spawn new vehicle if under capacity
        if (prev.length < 28 && Math.random() < 0.08) {
          const approaches = ["north", "south", "east", "west"];
          const app = approaches[Math.floor(Math.random() * approaches.length)];
          const types = ["two_wheeler", "two_wheeler", "car", "auto", "bus", "truck"];
          updated.push({
            id: nextIdRef.current++,
            approach: app,
            type: types[Math.floor(Math.random() * types.length)],
            lane: Math.floor(Math.random() * 2),
            progress: 0.02,
            speed: 0.0028 + Math.random() * 0.002,
          });
        }

        prev.forEach((v) => {
          const sig = getSignalColor(v.approach);
          const stopLineProgress = 0.42;

          let targetSpeed = v.speed;

          // If before stopline and signal is RED or YELLOW, stop/queue
          if (v.progress < stopLineProgress && v.progress > 0.34) {
            if (sig === "RED" || (sig === "YELLOW" && v.progress < 0.38)) {
              targetSpeed = 0; // stop at stopline
            }
          }

          // Advance vehicle
          const newProgress = v.progress + targetSpeed * (delta / 16);

          // Keep if not departed past exit (1.0)
          if (newProgress < 1.05) {
            updated.push({
              ...v,
              progress: newProgress,
            });
          }
        });

        return updated;
      });

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [northSignal, southSignal, eastSignal, westSignal, activePhase, phaseState]);

  // Compute (x, y) coordinates for vehicle SVG dots
  const getVehicleCoordinates = (v) => {
    const center = 300;
    const laneOffset = v.lane === 0 ? -18 : -42; // offset from center divider
    const exitOffset = v.lane === 0 ? 18 : 42;

    switch (v.approach) {
      case "north": {
        // Enters from top (y=20), heads South towards stop line (y=210), exits at y=580
        const y = 20 + v.progress * 560;
        const x = v.progress <= 0.45 ? center + laneOffset : center + laneOffset;
        return { x, y, angle: 180 };
      }
      case "south": {
        // Enters from bottom (y=580), heads North towards stop line (y=390), exits at y=20
        const y = 580 - v.progress * 560;
        const x = center - laneOffset;
        return { x, y, angle: 0 };
      }
      case "west": {
        // Enters from left (x=20), heads East towards stop line (x=210), exits at x=580
        const x = 20 + v.progress * 560;
        const y = center - laneOffset;
        return { x, y, angle: 90 };
      }
      case "east": {
        // Enters from right (x=580), heads West towards stop line (x=390), exits at x=20
        const x = 580 - v.progress * 560;
        const y = center + laneOffset;
        return { x, y, angle: 270 };
      }
      default:
        return { x: 300, y: 300, angle: 0 };
    }
  };

  const getVehicleColor = (type) => {
    switch (type) {
      case "two_wheeler": return "#38BDF8"; // Cyan
      case "car": return "#818CF8"; // Indigo
      case "auto": return "#FBBF24"; // Amber
      case "bus": return "#F87171"; // Red
      case "truck": return "#FB923C"; // Orange
      default: return "#E2E8F0";
    }
  };

  const getVehicleSize = (type) => {
    switch (type) {
      case "two_wheeler": return { w: 4, h: 8 };
      case "car": return { w: 7, h: 13 };
      case "auto": return { w: 6, h: 10 };
      case "bus": return { w: 9, h: 22 };
      case "truck": return { w: 9, h: 20 };
      default: return { w: 6, h: 12 };
    }
  };

  // Signal Head SVG Component
  const SignalHead = ({ x, y, aspect, rotation = 0, label }) => {
    return (
      <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
        {/* Housing */}
        <rect x="-8" y="-22" width="16" height="44" rx="4" fill="#0A0F1D" stroke="#334155" strokeWidth="1.5" />
        {/* Red light */}
        <circle 
          cx="0" cy="-14" r="5" 
          fill={aspect === "RED" ? "#EF4444" : "#451a1a"} 
          className={aspect === "RED" ? "glow-red" : ""}
        />
        {/* Amber light */}
        <circle 
          cx="0" cy="0" r="5" 
          fill={aspect === "YELLOW" ? "#F59E0B" : "#45321a"} 
          className={aspect === "YELLOW" ? "glow-amber" : ""}
        />
        {/* Green light */}
        <circle 
          cx="0" cy="14" r="5" 
          fill={aspect === "GREEN" ? "#22C55E" : "#143a22"} 
          className={aspect === "GREEN" ? "glow-green" : ""}
        />
        {/* Label */}
        {label && (
          <text x="12" y="4" fill="#94A3B8" fontSize="8" fontFamily="monospace" fontWeight="bold">
            {label}
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="relative w-full aspect-square max-w-[580px] mx-auto bg-[#0B1322] rounded-xl border border-[#1F2A44] overflow-hidden shadow-2xl flex items-center justify-center select-none">
      <svg viewBox="0 0 600 600" className="w-full h-full">
        <defs>
          {/* Asphalt Texture Pattern */}
          <pattern id="roadGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <rect width="40" height="40" fill="#111B2C" />
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#172338" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* Outer Terrain */}
        <rect width="600" height="600" fill="#090E1A" />
        <rect width="600" height="600" fill="url(#roadGrid)" />

        {/* Curb Corner Radii */}
        {/* Top-Left Curb */}
        <path d="M 0,210 L 210,210 A 10,10 0 0,0 210,0 L 0,0 Z" fill="#0C1524" />
        {/* Top-Right Curb */}
        <path d="M 390,0 L 390,210 A 10,10 0 0,0 600,210 L 600,0 Z" fill="#0C1524" />
        {/* Bottom-Left Curb */}
        <path d="M 0,390 L 210,390 A 10,10 0 0,1 210,600 L 0,600 Z" fill="#0C1524" />
        {/* Bottom-Right Curb */}
        <path d="M 390,600 L 390,390 A 10,10 0 0,1 600,390 L 600,600 Z" fill="#0C1524" />

        {/* North-South Road Surface */}
        <rect x="210" y="0" width="180" height="600" fill="#141E30" />
        {/* East-West Road Surface */}
        <rect x="0" y="210" width="600" height="180" fill="#141E30" />

        {/* Intersection Core Box */}
        <rect x="210" y="210" width="180" height="180" fill="#18243A" />
        {/* Center conflict yellow box hashing */}
        <rect x="225" y="225" width="150" height="150" fill="none" stroke="#F59E0B" strokeWidth="1" strokeDasharray="6 6" opacity="0.35" />

        {/* Lane Dividers: Center Yellow Double Lines */}
        {/* North Arm Center */}
        <line x1="298" y1="0" x2="298" y2="210" stroke="#F59E0B" strokeWidth="2" />
        <line x1="302" y1="0" x2="302" y2="210" stroke="#F59E0B" strokeWidth="2" />
        {/* South Arm Center */}
        <line x1="298" y1="390" x2="298" y2="600" stroke="#F59E0B" strokeWidth="2" />
        <line x1="302" y1="390" x2="302" y2="600" stroke="#F59E0B" strokeWidth="2" />
        {/* West Arm Center */}
        <line x1="0" y1="298" x2="210" y2="298" stroke="#F59E0B" strokeWidth="2" />
        <line x1="0" y1="302" x2="210" y2="302" stroke="#F59E0B" strokeWidth="2" />
        {/* East Arm Center */}
        <line x1="390" y1="298" x2="600" y2="298" stroke="#F59E0B" strokeWidth="2" />
        <line x1="390" y1="302" x2="600" y2="302" stroke="#F59E0B" strokeWidth="2" />

        {/* Dashed White Lane Lines */}
        {/* North */}
        <line x1="255" y1="0" x2="255" y2="210" stroke="#64748B" strokeWidth="1.5" strokeDasharray="8 8" />
        <line x1="345" y1="0" x2="345" y2="210" stroke="#64748B" strokeWidth="1.5" strokeDasharray="8 8" />
        {/* South */}
        <line x1="255" y1="390" x2="255" y2="600" stroke="#64748B" strokeWidth="1.5" strokeDasharray="8 8" />
        <line x1="345" y1="390" x2="345" y2="600" stroke="#64748B" strokeWidth="1.5" strokeDasharray="8 8" />
        {/* West */}
        <line x1="0" y1="255" x2="210" y2="255" stroke="#64748B" strokeWidth="1.5" strokeDasharray="8 8" />
        <line x1="0" y1="345" x2="210" y2="345" stroke="#64748B" strokeWidth="1.5" strokeDasharray="8 8" />
        {/* East */}
        <line x1="390" y1="255" x2="600" y2="255" stroke="#64748B" strokeWidth="1.5" strokeDasharray="8 8" />
        <line x1="390" y1="345" x2="600" y2="345" stroke="#64748B" strokeWidth="1.5" strokeDasharray="8 8" />

        {/* Solid Stop Lines */}
        <line x1="210" y1="210" x2="300" y2="210" stroke="#F8FAFC" strokeWidth="4" />
        <line x1="300" y1="390" x2="390" y2="390" stroke="#F8FAFC" strokeWidth="4" />
        <line x1="210" y1="298" x2="210" y2="390" stroke="#F8FAFC" strokeWidth="4" />
        <line x1="390" y1="210" x2="390" y2="298" stroke="#F8FAFC" strokeWidth="4" />

        {/* Pedestrian Crosswalk Stripes (Zebra) */}
        {/* North Crosswalk */}
        {[215, 230, 245, 260, 275, 290, 305, 320, 335, 350, 365, 380].map((x) => (
          <rect key={`nw-${x}`} x={x} y="185" width="8" height="20" fill="#94A3B8" opacity="0.6" />
        ))}
        {/* South Crosswalk */}
        {[215, 230, 245, 260, 275, 290, 305, 320, 335, 350, 365, 380].map((x) => (
          <rect key={`sw-${x}`} x={x} y="395" width="8" height="20" fill="#94A3B8" opacity="0.6" />
        ))}
        {/* West Crosswalk */}
        {[215, 230, 245, 260, 275, 290, 305, 320, 335, 350, 365, 380].map((y) => (
          <rect key={`ww-${y}`} x="185" y={y} width="20" height="8" fill="#94A3B8" opacity="0.6" />
        ))}
        {/* East Crosswalk */}
        {[215, 230, 245, 260, 275, 290, 305, 320, 335, 350, 365, 380].map((y) => (
          <rect key={`ew-${y}`} x="395" y={y} width="20" height="8" fill="#94A3B8" opacity="0.6" />
        ))}

        {/* Virtual Detector Induction Loops / AI Traps (dashed rectangles) */}
        <rect x="220" y="150" width="70" height="25" fill="#22D3EE" fillOpacity="0.08" stroke="#22D3EE" strokeWidth="1" strokeDasharray="3 3" />
        <rect x="310" y="425" width="70" height="25" fill="#22D3EE" fillOpacity="0.08" stroke="#22D3EE" strokeWidth="1" strokeDasharray="3 3" />
        <rect x="150" y="310" width="25" height="70" fill="#22D3EE" fillOpacity="0.08" stroke="#22D3EE" strokeWidth="1" strokeDasharray="3 3" />
        <rect x="425" y="220" width="25" height="70" fill="#22D3EE" fillOpacity="0.08" stroke="#22D3EE" strokeWidth="1" strokeDasharray="3 3" />

        {/* Render Animated Vehicles */}
        {vehicles.map((v) => {
          const { x, y, angle } = getVehicleCoordinates(v);
          const { w, h } = getVehicleSize(v.type);
          const color = getVehicleColor(v.type);
          return (
            <g key={v.id} transform={`translate(${x}, ${y}) rotate(${angle})`}>
              {/* Vehicle body */}
              <rect
                x={-w / 2}
                y={-h / 2}
                width={w}
                height={h}
                rx={w > 6 ? 2 : 1}
                fill={color}
                stroke="#0F172A"
                strokeWidth="0.8"
              />
              {/* Windshield */}
              <rect
                x={-w / 2 + 1}
                y={-h / 4}
                width={w - 2}
                height={h / 3}
                fill="#0F172A"
                opacity="0.4"
                rx="0.5"
              />
              {/* Headlights */}
              <circle cx={-w / 2 + 1.2} cy={h / 2 - 1} r="0.8" fill="#FEF08A" />
              <circle cx={w / 2 - 1.2} cy={h / 2 - 1} r="0.8" fill="#FEF08A" />
            </g>
          );
        })}

        {/* 4 Signal Heads at the stop lines */}
        {/* North Signal Head */}
        <SignalHead x="200" y="195" aspect={northSignal} rotation={0} label="N" />
        {/* South Signal Head */}
        <SignalHead x="400" y="405" aspect={southSignal} rotation={180} label="S" />
        {/* West Signal Head */}
        <SignalHead x="195" y="400" aspect={westSignal} rotation={90} label="W" />
        {/* East Signal Head */}
        <SignalHead x="405" y="200" aspect={eastSignal} rotation={270} label="E" />

        {/* Compass Rose */}
        <g transform="translate(45, 45)">
          <circle cx="0" cy="0" r="18" fill="#111B2C" stroke="#2D3D60" strokeWidth="1.5" />
          <path d="M 0,-14 L 4,-2 L -4,-2 Z" fill="#EF4444" />
          <path d="M 0,14 L 4,2 L -4,2 Z" fill="#64748B" />
          <text x="-3.5" y="-16" fill="#EF4444" fontSize="8" fontWeight="bold" fontFamily="monospace">N</text>
        </g>

        {/* HUD Overlay: Phase State & Countdown Timer */}
        <g transform="translate(300, 300)">
          <circle cx="0" cy="0" r="28" fill="#0E1726" stroke="#22D3EE" strokeWidth="2" opacity="0.95" />
          <text x="0" y="-6" textAnchor="middle" fill="#94A3B8" fontSize="8" fontFamily="monospace" fontWeight="bold">
            {activePhase.code}
          </text>
          <text 
            x="0" 
            y="12" 
            textAnchor="middle" 
            fill={phaseState === "GREEN" ? "#22C55E" : phaseState === "YELLOW" ? "#F59E0B" : "#EF4444"} 
            fontSize="18" 
            fontFamily="monospace" 
            fontWeight="bold"
          >
            {Math.max(0, junction.phaseTimer)}s
          </text>
        </g>
      </svg>
    </div>
  );
};
