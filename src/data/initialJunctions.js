/**
 * Fictional junction topology for ATLAS control network.
 * Strict Honesty Rule: Clearly fictional names, research prototype.
 */

export const INITIAL_JUNCTIONS = [
  {
    id: "J-01",
    code: "J-01",
    name: "Junction J-01 Central Square",
    corridor: "Grand Arterial (North-South)",
    lat: 12.9719,
    lng: 77.5937,
    controllerMode: "Adaptive", // Adaptive, Fixed-time, Manual, Fail-safe, Emergency
    cycleLength: 105,
    currentPhase: 0, // 0: N-S Thru, 1: N-S Right, 2: E-W Thru, 3: E-W Right
    phaseState: "GREEN", // GREEN, YELLOW, ALL_RED
    phaseTimer: 24, // seconds remaining
    currentPhaseDuration: 35,
    saturationFlowRate: 1800, // veh/hr/lane
    approaches: {
      north: { name: "North Approach (Metro Blvd)", lanes: 3, queueVeh: 8, pcu: 7.2, countVeh: 640, detectorHealth: "NORMAL", lastAgeMs: 120 },
      south: { name: "South Approach (Central Park Way)", lanes: 3, queueVeh: 11, pcu: 9.8, countVeh: 710, detectorHealth: "NORMAL", lastAgeMs: 140 },
      east: { name: "East Approach (Civic Plaza Rd)", lanes: 2, queueVeh: 5, pcu: 4.1, countVeh: 390, detectorHealth: "NORMAL", lastAgeMs: 110 },
      west: { name: "West Approach (Grand Library St)", lanes: 2, queueVeh: 6, pcu: 5.3, countVeh: 420, detectorHealth: "NORMAL", lastAgeMs: 180 }
    },
    metrics: {
      avgDelaySec: 22.4,
      throughputVehH: 2160,
      congestionLevel: "medium", // low, medium, high
      stopsPerVeh: 0.68,
      vpH: 2160
    },
    detectors: [
      { id: "DET-01-N-CAM", type: "AI-CCTV", approach: "north", status: "OK", fps: 29.8, latencyMs: 18 },
      { id: "DET-01-S-CAM", type: "AI-CCTV", approach: "south", status: "OK", fps: 29.6, latencyMs: 19 },
      { id: "DET-01-E-LOOP", type: "Inductive Loop", approach: "east", status: "OK", latencyMs: 8 },
      { id: "DET-01-W-LOOP", type: "Inductive Loop", approach: "west", status: "OK", latencyMs: 9 }
    ]
  },
  {
    id: "J-02",
    code: "J-02",
    name: "Junction J-02 Tech Corridor East",
    corridor: "Silicon Expressway",
    lat: 12.9845,
    lng: 77.6102,
    controllerMode: "Adaptive",
    cycleLength: 120,
    currentPhase: 0,
    phaseState: "GREEN",
    phaseTimer: 32,
    currentPhaseDuration: 45,
    saturationFlowRate: 1800,
    approaches: {
      north: { name: "North Approach", lanes: 4, queueVeh: 16, pcu: 15.2, countVeh: 980, detectorHealth: "NORMAL", lastAgeMs: 105 },
      south: { name: "South Approach", lanes: 4, queueVeh: 14, pcu: 13.6, countVeh: 920, detectorHealth: "NORMAL", lastAgeMs: 130 },
      east: { name: "East Approach", lanes: 3, queueVeh: 7, pcu: 6.2, countVeh: 510, detectorHealth: "NORMAL", lastAgeMs: 115 },
      west: { name: "West Approach", lanes: 3, queueVeh: 9, pcu: 8.1, countVeh: 560, detectorHealth: "NORMAL", lastAgeMs: 95 }
    },
    metrics: {
      avgDelaySec: 36.8,
      throughputVehH: 2970,
      congestionLevel: "high",
      stopsPerVeh: 1.12,
      vpH: 2970
    },
    detectors: [
      { id: "DET-02-N-CAM", type: "AI-CCTV", approach: "north", status: "OK", fps: 30.0, latencyMs: 16 },
      { id: "DET-02-S-CAM", type: "AI-CCTV", approach: "south", status: "OK", fps: 29.7, latencyMs: 17 },
      { id: "DET-02-E-CAM", type: "AI-CCTV", approach: "east", status: "OK", fps: 29.5, latencyMs: 20 },
      { id: "DET-02-W-CAM", type: "AI-CCTV", approach: "west", status: "OK", fps: 29.9, latencyMs: 18 }
    ]
  },
  {
    id: "J-03",
    code: "J-03",
    name: "Junction J-03 Metro Interchange",
    corridor: "Transit Spine Corridor",
    lat: 12.9612,
    lng: 77.5855,
    controllerMode: "Adaptive",
    cycleLength: 95,
    currentPhase: 2,
    phaseState: "GREEN",
    phaseTimer: 18,
    currentPhaseDuration: 28,
    saturationFlowRate: 1750,
    approaches: {
      north: { name: "North Approach", lanes: 2, queueVeh: 4, pcu: 3.5, countVeh: 340, detectorHealth: "NORMAL", lastAgeMs: 110 },
      south: { name: "South Approach", lanes: 2, queueVeh: 5, pcu: 4.2, countVeh: 370, detectorHealth: "NORMAL", lastAgeMs: 125 },
      east: { name: "East Approach (Bus Terminal)", lanes: 3, queueVeh: 12, pcu: 14.8, countVeh: 780, detectorHealth: "NORMAL", lastAgeMs: 140 },
      west: { name: "West Approach", lanes: 3, queueVeh: 8, pcu: 7.9, countVeh: 610, detectorHealth: "NORMAL", lastAgeMs: 155 }
    },
    metrics: {
      avgDelaySec: 26.5,
      throughputVehH: 2100,
      congestionLevel: "medium",
      stopsPerVeh: 0.81,
      vpH: 2100
    },
    detectors: [
      { id: "DET-03-N-LOOP", type: "Inductive Loop", approach: "north", status: "OK", latencyMs: 6 },
      { id: "DET-03-S-LOOP", type: "Inductive Loop", approach: "south", status: "OK", latencyMs: 7 },
      { id: "DET-03-E-CAM", type: "AI-CCTV", approach: "east", status: "OK", fps: 29.4, latencyMs: 21 },
      { id: "DET-03-W-CAM", type: "AI-CCTV", approach: "west", status: "OK", fps: 29.8, latencyMs: 19 }
    ]
  },
  {
    id: "J-04",
    code: "J-04",
    name: "Junction J-04 Northern Ring Boulevard",
    corridor: "Outer Ring Orbital",
    lat: 12.9920,
    lng: 77.5780,
    controllerMode: "Adaptive",
    cycleLength: 110,
    currentPhase: 0,
    phaseState: "GREEN",
    phaseTimer: 28,
    currentPhaseDuration: 40,
    saturationFlowRate: 1800,
    approaches: {
      north: { name: "North Approach", lanes: 3, queueVeh: 7, pcu: 6.1, countVeh: 530, detectorHealth: "NORMAL", lastAgeMs: 115 },
      south: { name: "South Approach", lanes: 3, queueVeh: 8, pcu: 6.9, countVeh: 570, detectorHealth: "NORMAL", lastAgeMs: 120 },
      east: { name: "East Approach", lanes: 3, queueVeh: 11, pcu: 9.4, countVeh: 690, detectorHealth: "NORMAL", lastAgeMs: 145 },
      west: { name: "West Approach", lanes: 3, queueVeh: 10, pcu: 8.8, countVeh: 640, detectorHealth: "NORMAL", lastAgeMs: 130 }
    },
    metrics: {
      avgDelaySec: 21.0,
      throughputVehH: 2430,
      congestionLevel: "low",
      stopsPerVeh: 0.55,
      vpH: 2430
    },
    detectors: [
      { id: "DET-04-N-CAM", type: "AI-CCTV", approach: "north", status: "OK", fps: 29.7, latencyMs: 17 },
      { id: "DET-04-S-CAM", type: "AI-CCTV", approach: "south", status: "OK", fps: 29.8, latencyMs: 18 },
      { id: "DET-04-E-LOOP", type: "Inductive Loop", approach: "east", status: "OK", latencyMs: 9 },
      { id: "DET-04-W-LOOP", type: "Inductive Loop", approach: "west", status: "OK", latencyMs: 8 }
    ]
  },
  {
    id: "J-05",
    code: "J-05",
    name: "Junction J-05 Industrial Gateway",
    corridor: "Freight & Logistics Spur",
    lat: 12.9535,
    lng: 77.6250,
    controllerMode: "Fixed-time",
    cycleLength: 125,
    currentPhase: 1,
    phaseState: "GREEN",
    phaseTimer: 14,
    currentPhaseDuration: 25,
    saturationFlowRate: 1700,
    approaches: {
      north: { name: "North Approach", lanes: 2, queueVeh: 13, pcu: 17.5, countVeh: 680, detectorHealth: "DEGRADED", lastAgeMs: 1250 },
      south: { name: "South Approach", lanes: 2, queueVeh: 11, pcu: 14.8, countVeh: 610, detectorHealth: "NORMAL", lastAgeMs: 130 },
      east: { name: "East Approach (Heavy Cargo Port)", lanes: 3, queueVeh: 18, pcu: 24.6, countVeh: 890, detectorHealth: "NORMAL", lastAgeMs: 140 },
      west: { name: "West Approach", lanes: 2, queueVeh: 9, pcu: 10.2, countVeh: 490, detectorHealth: "NORMAL", lastAgeMs: 160 }
    },
    metrics: {
      avgDelaySec: 48.2,
      throughputVehH: 2670,
      congestionLevel: "high",
      stopsPerVeh: 1.45,
      vpH: 2670
    },
    detectors: [
      { id: "DET-05-N-CAM", type: "AI-CCTV", approach: "north", status: "DEGRADED", fps: 12.1, latencyMs: 98 },
      { id: "DET-05-S-LOOP", type: "Inductive Loop", approach: "south", status: "OK", latencyMs: 9 },
      { id: "DET-05-E-CAM", type: "AI-CCTV", approach: "east", status: "OK", fps: 29.3, latencyMs: 22 },
      { id: "DET-05-W-LOOP", type: "Inductive Loop", approach: "west", status: "OK", latencyMs: 10 }
    ]
  },
  {
    id: "J-06",
    code: "J-06",
    name: "Junction J-06 University Cross",
    corridor: "Academic Link",
    lat: 12.9680,
    lng: 77.5680,
    controllerMode: "Adaptive",
    cycleLength: 90,
    currentPhase: 0,
    phaseState: "GREEN",
    phaseTimer: 21,
    currentPhaseDuration: 30,
    saturationFlowRate: 1800,
    approaches: {
      north: { name: "North Approach", lanes: 2, queueVeh: 4, pcu: 2.8, countVeh: 380, detectorHealth: "NORMAL", lastAgeMs: 110 },
      south: { name: "South Approach", lanes: 2, queueVeh: 3, pcu: 2.3, countVeh: 350, detectorHealth: "NORMAL", lastAgeMs: 115 },
      east: { name: "East Approach", lanes: 2, queueVeh: 5, pcu: 3.9, countVeh: 410, detectorHealth: "NORMAL", lastAgeMs: 125 },
      west: { name: "West Approach", lanes: 2, queueVeh: 4, pcu: 3.1, countVeh: 390, detectorHealth: "NORMAL", lastAgeMs: 130 }
    },
    metrics: {
      avgDelaySec: 14.5,
      throughputVehH: 1530,
      congestionLevel: "low",
      stopsPerVeh: 0.42,
      vpH: 1530
    },
    detectors: [
      { id: "DET-06-N-CAM", type: "AI-CCTV", approach: "north", status: "OK", fps: 29.9, latencyMs: 17 },
      { id: "DET-06-S-CAM", type: "AI-CCTV", approach: "south", status: "OK", fps: 29.8, latencyMs: 18 },
      { id: "DET-06-E-LOOP", type: "Inductive Loop", approach: "east", status: "OK", latencyMs: 7 },
      { id: "DET-06-W-LOOP", type: "Inductive Loop", approach: "west", status: "OK", latencyMs: 8 }
    ]
  },
  {
    id: "J-07",
    code: "J-07",
    name: "Junction J-07 Riverside Avenue",
    corridor: "Waterfront Parkway",
    lat: 12.9805,
    lng: 77.5890,
    controllerMode: "Adaptive",
    cycleLength: 100,
    currentPhase: 2,
    phaseState: "GREEN",
    phaseTimer: 25,
    currentPhaseDuration: 35,
    saturationFlowRate: 1800,
    approaches: {
      north: { name: "North Approach", lanes: 3, queueVeh: 7, pcu: 5.9, countVeh: 610, detectorHealth: "NORMAL", lastAgeMs: 110 },
      south: { name: "South Approach", lanes: 3, queueVeh: 8, pcu: 6.8, countVeh: 640, detectorHealth: "NORMAL", lastAgeMs: 115 },
      east: { name: "East Approach", lanes: 2, queueVeh: 5, pcu: 4.2, countVeh: 430, detectorHealth: "NORMAL", lastAgeMs: 120 },
      west: { name: "West Approach", lanes: 2, queueVeh: 6, pcu: 4.8, countVeh: 460, detectorHealth: "NORMAL", lastAgeMs: 125 }
    },
    metrics: {
      avgDelaySec: 19.8,
      throughputVehH: 2140,
      congestionLevel: "low",
      stopsPerVeh: 0.58,
      vpH: 2140
    },
    detectors: [
      { id: "DET-07-N-CAM", type: "AI-CCTV", approach: "north", status: "OK", fps: 29.7, latencyMs: 18 },
      { id: "DET-07-S-CAM", type: "AI-CCTV", approach: "south", status: "OK", fps: 29.6, latencyMs: 19 },
      { id: "DET-07-E-CAM", type: "AI-CCTV", approach: "east", status: "OK", fps: 29.8, latencyMs: 17 },
      { id: "DET-07-W-LOOP", type: "Inductive Loop", approach: "west", status: "OK", latencyMs: 8 }
    ]
  },
  {
    id: "J-08",
    code: "J-08",
    name: "Junction J-08 Market Cross",
    corridor: "Commercial District Hub",
    lat: 12.9640,
    lng: 77.6020,
    controllerMode: "Adaptive",
    cycleLength: 115,
    currentPhase: 0,
    phaseState: "GREEN",
    phaseTimer: 19,
    currentPhaseDuration: 35,
    saturationFlowRate: 1750,
    approaches: {
      north: { name: "North Approach", lanes: 2, queueVeh: 12, pcu: 10.5, countVeh: 720, detectorHealth: "NORMAL", lastAgeMs: 130 },
      south: { name: "South Approach", lanes: 2, queueVeh: 11, pcu: 9.7, countVeh: 690, detectorHealth: "NORMAL", lastAgeMs: 140 },
      east: { name: "East Approach (Old Bazaar)", lanes: 2, queueVeh: 10, pcu: 8.6, countVeh: 630, detectorHealth: "NORMAL", lastAgeMs: 120 },
      west: { name: "West Approach", lanes: 2, queueVeh: 9, pcu: 7.9, countVeh: 590, detectorHealth: "NORMAL", lastAgeMs: 135 }
    },
    metrics: {
      avgDelaySec: 32.1,
      throughputVehH: 2630,
      congestionLevel: "medium",
      stopsPerVeh: 0.98,
      vpH: 2630
    },
    detectors: [
      { id: "DET-08-N-CAM", type: "AI-CCTV", approach: "north", status: "OK", fps: 29.5, latencyMs: 19 },
      { id: "DET-08-S-CAM", type: "AI-CCTV", approach: "south", status: "OK", fps: 29.4, latencyMs: 20 },
      { id: "DET-08-E-LOOP", type: "Inductive Loop", approach: "east", status: "OK", latencyMs: 8 },
      { id: "DET-08-W-LOOP", type: "Inductive Loop", approach: "west", status: "OK", latencyMs: 9 }
    ]
  },
  {
    id: "J-09",
    code: "J-09",
    name: "Junction J-09 Financial District Tower",
    corridor: "Grand Arterial (North-South)",
    lat: 12.9750,
    lng: 77.6060,
    controllerMode: "Adaptive",
    cycleLength: 120,
    currentPhase: 0,
    phaseState: "GREEN",
    phaseTimer: 27,
    currentPhaseDuration: 42,
    saturationFlowRate: 1850,
    approaches: {
      north: { name: "North Approach (Banking Enclave)", lanes: 4, queueVeh: 15, pcu: 14.2, countVeh: 950, detectorHealth: "NORMAL", lastAgeMs: 115 },
      south: { name: "South Approach", lanes: 4, queueVeh: 13, pcu: 12.4, countVeh: 910, detectorHealth: "NORMAL", lastAgeMs: 120 },
      east: { name: "East Approach", lanes: 3, queueVeh: 8, pcu: 7.1, countVeh: 540, detectorHealth: "NORMAL", lastAgeMs: 130 },
      west: { name: "West Approach", lanes: 3, queueVeh: 7, pcu: 6.4, countVeh: 510, detectorHealth: "NORMAL", lastAgeMs: 140 }
    },
    metrics: {
      avgDelaySec: 34.2,
      throughputVehH: 2910,
      congestionLevel: "high",
      stopsPerVeh: 1.05,
      vpH: 2910
    },
    detectors: [
      { id: "DET-09-N-CAM", type: "AI-CCTV", approach: "north", status: "OK", fps: 29.9, latencyMs: 17 },
      { id: "DET-09-S-CAM", type: "AI-CCTV", approach: "south", status: "OK", fps: 29.8, latencyMs: 18 },
      { id: "DET-09-E-CAM", type: "AI-CCTV", approach: "east", status: "OK", fps: 29.6, latencyMs: 19 },
      { id: "DET-09-W-CAM", type: "AI-CCTV", approach: "west", status: "OK", fps: 29.7, latencyMs: 18 }
    ]
  },
  {
    id: "J-10",
    code: "J-10",
    name: "Junction J-10 Harbor Link Connector",
    corridor: "Coastal Freight Feeder",
    lat: 12.9570,
    lng: 77.6180,
    controllerMode: "Adaptive",
    cycleLength: 105,
    currentPhase: 2,
    phaseState: "GREEN",
    phaseTimer: 20,
    currentPhaseDuration: 32,
    saturationFlowRate: 1800,
    approaches: {
      north: { name: "North Approach", lanes: 3, queueVeh: 6, pcu: 5.4, countVeh: 520, detectorHealth: "NORMAL", lastAgeMs: 125 },
      south: { name: "South Approach", lanes: 3, queueVeh: 7, pcu: 6.1, countVeh: 550, detectorHealth: "NORMAL", lastAgeMs: 135 },
      east: { name: "East Approach (Terminal Access)", lanes: 2, queueVeh: 6, pcu: 5.2, countVeh: 460, detectorHealth: "NORMAL", lastAgeMs: 110 },
      west: { name: "West Approach", lanes: 2, queueVeh: 5, pcu: 4.5, countVeh: 420, detectorHealth: "NORMAL", lastAgeMs: 120 }
    },
    metrics: {
      avgDelaySec: 20.5,
      throughputVehH: 1950,
      congestionLevel: "low",
      stopsPerVeh: 0.60,
      vpH: 1950
    },
    detectors: [
      { id: "DET-10-N-CAM", type: "AI-CCTV", approach: "north", status: "OK", fps: 29.8, latencyMs: 18 },
      { id: "DET-10-S-LOOP", type: "Inductive Loop", approach: "south", status: "OK", latencyMs: 8 },
      { id: "DET-10-E-LOOP", type: "Inductive Loop", approach: "east", status: "OK", latencyMs: 8 },
      { id: "DET-10-W-LOOP", type: "Inductive Loop", approach: "west", status: "OK", latencyMs: 9 }
    ]
  },
  {
    id: "J-11",
    code: "J-11",
    name: "Junction J-11 Aerodrome Expressway Gate",
    corridor: "Airport Rapid Bypass",
    lat: 12.9890,
    lng: 77.5990,
    controllerMode: "Adaptive",
    cycleLength: 115,
    currentPhase: 0,
    phaseState: "GREEN",
    phaseTimer: 30,
    currentPhaseDuration: 42,
    saturationFlowRate: 1900,
    approaches: {
      north: { name: "North Approach (Airport Way)", lanes: 4, queueVeh: 10, pcu: 9.1, countVeh: 850, detectorHealth: "NORMAL", lastAgeMs: 110 },
      south: { name: "South Approach", lanes: 4, queueVeh: 9, pcu: 8.3, countVeh: 810, detectorHealth: "NORMAL", lastAgeMs: 125 },
      east: { name: "East Approach", lanes: 2, queueVeh: 5, pcu: 4.1, countVeh: 390, detectorHealth: "NORMAL", lastAgeMs: 130 },
      west: { name: "West Approach", lanes: 2, queueVeh: 6, pcu: 4.9, countVeh: 430, detectorHealth: "NORMAL", lastAgeMs: 140 }
    },
    metrics: {
      avgDelaySec: 23.4,
      throughputVehH: 2480,
      congestionLevel: "medium",
      stopsPerVeh: 0.65,
      vpH: 2480
    },
    detectors: [
      { id: "DET-11-N-CAM", type: "AI-CCTV", approach: "north", status: "OK", fps: 29.9, latencyMs: 16 },
      { id: "DET-11-S-CAM", type: "AI-CCTV", approach: "south", status: "OK", fps: 29.8, latencyMs: 17 },
      { id: "DET-11-E-LOOP", type: "Inductive Loop", approach: "east", status: "OK", latencyMs: 7 },
      { id: "DET-11-W-LOOP", type: "Inductive Loop", approach: "west", status: "OK", latencyMs: 8 }
    ]
  },
  {
    id: "J-12",
    code: "J-12",
    name: "Junction J-12 Civic Center Circle",
    corridor: "Grand Arterial (North-South)",
    lat: 12.9775,
    lng: 77.5815,
    controllerMode: "Adaptive",
    cycleLength: 100,
    currentPhase: 1,
    phaseState: "GREEN",
    phaseTimer: 16,
    currentPhaseDuration: 26,
    saturationFlowRate: 1750,
    approaches: {
      north: { name: "North Approach", lanes: 3, queueVeh: 6, pcu: 5.2, countVeh: 560, detectorHealth: "NORMAL", lastAgeMs: 115 },
      south: { name: "South Approach", lanes: 3, queueVeh: 7, pcu: 6.0, countVeh: 590, detectorHealth: "NORMAL", lastAgeMs: 120 },
      east: { name: "East Approach (Secretariat Rd)", lanes: 3, queueVeh: 6, pcu: 5.1, countVeh: 530, detectorHealth: "NORMAL", lastAgeMs: 110 },
      west: { name: "West Approach", lanes: 2, queueVeh: 4, pcu: 3.4, countVeh: 380, detectorHealth: "NORMAL", lastAgeMs: 135 }
    },
    metrics: {
      avgDelaySec: 18.2,
      throughputVehH: 2060,
      congestionLevel: "low",
      stopsPerVeh: 0.52,
      vpH: 2060
    },
    detectors: [
      { id: "DET-12-N-CAM", type: "AI-CCTV", approach: "north", status: "OK", fps: 29.8, latencyMs: 18 },
      { id: "DET-12-S-CAM", type: "AI-CCTV", approach: "south", status: "OK", fps: 29.7, latencyMs: 19 },
      { id: "DET-12-E-CAM", type: "AI-CCTV", approach: "east", status: "OK", fps: 29.5, latencyMs: 18 },
      { id: "DET-12-W-LOOP", type: "Inductive Loop", approach: "west", status: "OK", latencyMs: 9 }
    ]
  }
];
