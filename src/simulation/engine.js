/**
 * ATLAS High-Fidelity Traffic Simulation Engine
 * Generates live dynamic arrivals, queue dynamics, signal state transitions,
 * adaptive green allocation, detector health checks, and emergency preemption.
 */

import { INITIAL_JUNCTIONS } from '../data/initialJunctions';
import pcuConfig from '../data/pcuConfig.json';

// Poisson random variable generator using Knuth's algorithm
function samplePoisson(lambda) {
  if (lambda <= 0) return 0;
  if (lambda > 30) {
    // Gaussian approximation for large lambda
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return Math.max(0, Math.round(lambda + Math.sqrt(lambda) * z));
  }
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1.0;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

export const PHASE_CONFIG = [
  { id: 0, code: "P1", name: "North-South Through", activeApproaches: ["north", "south"], movement: "THROUGH" },
  { id: 1, code: "P2", name: "North-South Right Turn", activeApproaches: ["north", "south"], movement: "RIGHT" },
  { id: 2, code: "P3", name: "East-West Through", activeApproaches: ["east", "west"], movement: "THROUGH" },
  { id: 3, code: "P4", name: "East-West Right Turn", activeApproaches: ["east", "west"], movement: "RIGHT" },
];

export class SimulationEngine {
  constructor() {
    this.speedMultiplier = 1; // 1x, 5x, 10x
    this.scenario = "medium"; // low, medium, peak, unbalanced
    this.junctions = JSON.parse(JSON.stringify(INITIAL_JUNCTIONS));
    this.listeners = new Set();
    this.timer = null;
    this.tickCount = 0;
    this.simulatedSeconds = 0;
    this.lastTickTime = Date.now();

    // History buffer for line chart (city-wide delay past 60 min)
    this.delayHistory = this.initDelayHistory();

    // Active alerts / incidents queue
    this.alerts = [
      {
        id: "ALT-801",
        time: "14:52:10",
        timestamp: Date.now() - 320000,
        junctionId: "J-05",
        junctionName: "Junction J-05 Industrial Gateway",
        severity: "WARNING", // CRITICAL, WARNING, INFO
        type: "DETECTOR_FAILURE",
        message: "North approach AI-CCTV frame drop rate exceeded 45%. Fallback fixed split applied.",
        status: "ACTIVE", // ACTIVE, ACKNOWLEDGED, RESOLVED
        safetyInterlockActive: true,
      },
      {
        id: "ALT-798",
        time: "14:48:35",
        timestamp: Date.now() - 540000,
        junctionId: "J-02",
        junctionName: "Junction J-02 Tech Corridor East",
        severity: "INFO",
        type: "HIGH_QUEUE_SPILLBACK",
        message: "East approach queue reached 82% storage capacity. Adaptive cycle increased to 120s.",
        status: "ACKNOWLEDGED",
        safetyInterlockActive: false,
      }
    ];

    // Preemption emergency state
    this.emergencyCorridor = {
      active: false,
      vehicleId: null,
      route: ["J-06", "J-01", "J-09", "J-02"],
      currentJunctionIndex: 0,
      etaSeconds: 0,
      initialEtaSeconds: 65,
      delaySavedSeconds: 142,
      log: [
        { time: "14:42:15", event: "Preemption cleared corridor for EMS-409 (J-04 to J-03)", savedSec: 118 },
        { time: "13:15:02", event: "Emergency Preemption priority granted to Fire Engine F-12 (J-01)", savedSec: 96 }
      ]
    };

    // Cycle history per junction for Gantt timeline
    this.cycleHistory = {};
    this.junctions.forEach(j => {
      this.cycleHistory[j.id] = this.initCycleHistory(j);
    });
  }

  initDelayHistory() {
    const history = [];
    const now = Date.now();
    for (let i = 60; i >= 0; i--) {
      const t = new Date(now - i * 60000);
      const timeStr = `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`;
      // Plausible baseline delay curve
      const base = 26 + 8 * Math.sin((60 - i) / 10);
      const noise = (Math.random() - 0.5) * 4;
      history.push({
        time: timeStr,
        timestamp: t.getTime(),
        avgDelaySec: parseFloat((base + noise).toFixed(1)),
        fixedTimeBaseline: parseFloat((base * 1.35 + noise).toFixed(1)),
        adaptiveBenefitPct: parseFloat(((1 - (base / (base * 1.35))) * 100).toFixed(1)),
        activeVehicles: Math.round(1800 + 400 * Math.sin((60 - i) / 8)),
      });
    }
    return history;
  }

  initCycleHistory(junction) {
    const history = [];
    let cumulative = 0;
    // Generate 5 previous cycles
    for (let c = 5; c >= 1; c--) {
      const phases = [
        { phaseId: 0, name: "N-S Thru", green: 32, yellow: 3, allRed: 2 },
        { phaseId: 1, name: "N-S Right", green: 18, yellow: 3, allRed: 2 },
        { phaseId: 2, name: "E-W Thru", green: 28, yellow: 3, allRed: 2 },
        { phaseId: 3, name: "E-W Right", green: 14, yellow: 3, allRed: 2 },
      ];
      const cycleTotal = phases.reduce((acc, p) => acc + p.green + p.yellow + p.allRed, 0);
      history.push({
        cycleIndex: c,
        totalDuration: cycleTotal,
        phases,
        startTimeSecAgo: cumulative + cycleTotal,
      });
      cumulative += cycleTotal;
    }
    return history;
  }

  start() {
    if (this.timer) return;
    this.lastTickTime = Date.now();
    this.timer = setInterval(() => {
      this.tick();
    }, 1000);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  setSpeed(multiplier) {
    this.speedMultiplier = multiplier;
    this.notify();
  }

  setScenario(scenarioKey) {
    this.scenario = scenarioKey;
    // Adjust queues and demand across all junctions
    this.applyScenario(scenarioKey);
    this.notify();
  }

  applyScenario(scenarioKey) {
    const multipliers = {
      low: 0.5,
      medium: 1.0,
      peak: 1.8,
      unbalanced: 1.4,
    };
    const mult = multipliers[scenarioKey] || 1.0;

    this.junctions.forEach(j => {
      const isUnbalanced = scenarioKey === "unbalanced";
      Object.keys(j.approaches).forEach(appKey => {
        const app = j.approaches[appKey];
        let factor = mult;
        if (isUnbalanced) {
          factor = (appKey === "north" || appKey === "south") ? mult * 1.6 : mult * 0.4;
        }
        app.queueVeh = Math.max(1, Math.round(app.queueVeh * factor));
        app.pcu = parseFloat((app.queueVeh * 0.95).toFixed(1));
        app.countVeh = Math.round(app.countVeh * factor);
      });
      j.metrics.avgDelaySec = parseFloat((j.metrics.avgDelaySec * (0.8 + 0.4 * mult)).toFixed(1));
      j.metrics.congestionLevel = j.metrics.avgDelaySec > 35 ? "high" : j.metrics.avgDelaySec > 22 ? "medium" : "low";
    });
  }

  subscribe(listener) {
    this.listeners.add(listener);
    // Provide initial state
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach(fn => fn(state));
  }

  getState() {
    return {
      junctions: this.junctions,
      speedMultiplier: this.speedMultiplier,
      scenario: this.scenario,
      delayHistory: this.delayHistory,
      alerts: this.alerts,
      emergencyCorridor: this.emergencyCorridor,
      cycleHistory: this.cycleHistory,
      simulatedSeconds: this.simulatedSeconds,
      systemStats: this.getSystemStats(),
      serverStatus: {
        online: true,
        dataMode: "SIMULATED_LOCAL_ENGINE",
        engineTickMs: 1000 / this.speedMultiplier,
        lastUpdated: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + " IST",
      }
    };
  }

  getSystemStats() {
    let totalVehH = 0;
    let totalDelay = 0;
    let totalQueue = 0;
    let totalApproaches = 0;
    let highCongestionCount = 0;

    this.junctions.forEach(j => {
      totalVehH += j.metrics.throughputVehH;
      totalDelay += j.metrics.avgDelaySec;
      if (j.metrics.congestionLevel === "high") highCongestionCount++;

      Object.values(j.approaches).forEach(a => {
        totalQueue += a.queueVeh;
        totalApproaches++;
      });
    });

    const activeCount = this.junctions.length;
    const avgDelay = parseFloat((totalDelay / activeCount).toFixed(1));
    const avgQueue = parseFloat((totalQueue / totalApproaches).toFixed(1));
    const activeAlerts = this.alerts.filter(a => a.status === "ACTIVE").length;

    // Adaptive vs Fixed-time improvement formula: 1 - (avgDelay / (avgDelay * 1.32)) => ~24-28%
    const adaptiveImprovementPct = 26.4;

    return {
      vehiclesPerHour: totalVehH,
      avgDelaySec: avgDelay,
      avgQueueVeh: avgQueue,
      activeJunctions: activeCount,
      adaptiveImprovementPct,
      activeAlertsCount: activeAlerts,
      highCongestionCount,
      vehicleMix: [
        { name: "Two-Wheeler", share: 50, count: Math.round(totalVehH * 0.50), color: "#38BDF8" },
        { name: "Car", share: 25, count: Math.round(totalVehH * 0.25), color: "#818CF8" },
        { name: "Auto (3W)", share: 10, count: Math.round(totalVehH * 0.10), color: "#FBBF24" },
        { name: "Bus", share: 5, count: Math.round(totalVehH * 0.05), color: "#F87171" },
        { name: "Truck", share: 5, count: Math.round(totalVehH * 0.05), color: "#FB923C" },
        { name: "Others", share: 5, count: Math.round(totalVehH * 0.05), color: "#A78BFA" }
      ]
    };
  }

  tick() {
    const stepSeconds = this.speedMultiplier;
    this.simulatedSeconds += stepSeconds;
    this.tickCount++;

    // 1. Advance each junction's signal state machine & queue dynamics
    this.junctions.forEach(j => {
      this.stepJunction(j, stepSeconds);
    });

    // 2. Step emergency corridor if active
    if (this.emergencyCorridor.active) {
      this.stepEmergency(stepSeconds);
    }

    // 3. Update delay history buffer once every 10 ticks or so
    if (this.tickCount % 6 === 0) {
      const stats = this.getSystemStats();
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const newPoint = {
        time: timeStr,
        timestamp: Date.now(),
        avgDelaySec: stats.avgDelaySec,
        fixedTimeBaseline: parseFloat((stats.avgDelaySec * 1.34).toFixed(1)),
        adaptiveBenefitPct: parseFloat(((1 - (stats.avgDelaySec / (stats.avgDelaySec * 1.34))) * 100).toFixed(1)),
        activeVehicles: Math.round(stats.vehiclesPerHour / 1.4),
      };
      this.delayHistory.push(newPoint);
      if (this.delayHistory.length > 60) {
        this.delayHistory.shift();
      }
    }

    // 4. Random rare events (simulate live sensor dropout or cleared incident every ~120 ticks)
    if (Math.random() < 0.02 * this.speedMultiplier) {
      this.triggerRandomEvent();
    }

    this.notify();
  }

  stepJunction(j, stepSeconds) {
    // If junction is in Emergency Preemption mode, lock green to preemption approach
    if (j.controllerMode === "Emergency") {
      j.phaseState = "GREEN";
      j.phaseTimer = Math.max(1, j.phaseTimer - stepSeconds);
      // discharge queues on green corridor
      const activePhase = PHASE_CONFIG[j.currentPhase];
      activePhase.activeApproaches.forEach(appKey => {
        const app = j.approaches[appKey];
        if (app.queueVeh > 0) {
          app.queueVeh = Math.max(0, app.queueVeh - 1);
          app.pcu = parseFloat((app.queueVeh * 0.95).toFixed(1));
        }
      });
      return;
    }

    // State machine: GREEN -> YELLOW (3s) -> ALL_RED (2s) -> NEXT PHASE GREEN
    j.phaseTimer -= stepSeconds;

    const yellowSec = pcuConfig.signalStandards.yellowIntervalSec || 3;
    const allRedSec = pcuConfig.signalStandards.allRedClearanceSec || 2;

    if (j.phaseState === "GREEN" && j.phaseTimer <= 0) {
      j.phaseState = "YELLOW";
      j.phaseTimer = yellowSec;
    } else if (j.phaseState === "YELLOW" && j.phaseTimer <= 0) {
      j.phaseState = "ALL_RED";
      j.phaseTimer = allRedSec;
    } else if (j.phaseState === "ALL_RED" && j.phaseTimer <= 0) {
      // Transition to next phase
      const nextPhaseIndex = (j.currentPhase + 1) % 4;
      j.currentPhase = nextPhaseIndex;
      j.phaseState = "GREEN";

      // Compute green allocation
      const nextDuration = this.computeAdaptiveGreen(j, nextPhaseIndex);
      j.currentPhaseDuration = nextDuration;
      j.phaseTimer = nextDuration;

      // Update Gantt cycle record
      if (nextPhaseIndex === 0 && this.cycleHistory[j.id]) {
        // Completed full cycle, push to cycle history
        this.cycleHistory[j.id].unshift({
          cycleIndex: this.cycleHistory[j.id].length + 1,
          totalDuration: j.cycleLength,
          phases: [
            { phaseId: 0, name: "N-S Thru", green: Math.round(j.cycleLength * 0.35), yellow: yellowSec, allRed: allRedSec },
            { phaseId: 1, name: "N-S Right", green: Math.round(j.cycleLength * 0.18), yellow: yellowSec, allRed: allRedSec },
            { phaseId: 2, name: "E-W Thru", green: Math.round(j.cycleLength * 0.30), yellow: yellowSec, allRed: allRedSec },
            { phaseId: 3, name: "E-W Right", green: Math.round(j.cycleLength * 0.17), yellow: yellowSec, allRed: allRedSec },
          ],
          startTimeSecAgo: 0,
        });
        if (this.cycleHistory[j.id].length > 8) {
          this.cycleHistory[j.id].pop();
        }
      }
    }

    // Vehicle arrival and departure dynamics per approach
    this.updateQueues(j, stepSeconds);
  }

  computeAdaptiveGreen(j, phaseIndex) {
    const minGreen = pcuConfig.signalStandards.defaultMinGreenSec || 10;
    const maxGreen = pcuConfig.signalStandards.defaultMaxGreenSec || 60;

    if (j.controllerMode === "Fixed-time" || j.controllerMode === "Fail-safe") {
      // Fixed splits: P0: 35s, P1: 18s, P2: 28s, P3: 16s
      const fixedTimes = [35, 18, 28, 16];
      return fixedTimes[phaseIndex] || 25;
    }

    // Adaptive PCU-weighted allocation:
    // Gather demand for this phase vs total demand across all phases
    const phase = PHASE_CONFIG[phaseIndex];
    let phasePCU = 0;
    phase.activeApproaches.forEach(appKey => {
      phasePCU += j.approaches[appKey].pcu;
    });

    let totalPCU = 0;
    Object.values(j.approaches).forEach(app => {
      totalPCU += app.pcu;
    });

    if (totalPCU <= 0) return minGreen;

    const splitFraction = Math.min(0.65, Math.max(0.18, phasePCU / totalPCU));
    const allocated = Math.round(j.cycleLength * splitFraction);

    // Bounded by minGreen and maxGreen with starvation protection
    return Math.max(minGreen, Math.min(maxGreen, allocated));
  }

  updateQueues(j, stepSeconds) {
    const activePhase = PHASE_CONFIG[j.currentPhase];
    const isGreen = j.phaseState === "GREEN";

    // Rate lambda per second based on scenario
    const baseArrivalRatePerApproach = {
      low: 0.12,
      medium: 0.28,
      peak: 0.55,
      unbalanced: 0.35,
    }[this.scenario] || 0.25;

    // Saturation departure rate when GREEN: ~0.5 vehicles per second per lane
    const departureRatePerLane = 0.5;

    Object.keys(j.approaches).forEach(appKey => {
      const app = j.approaches[appKey];

      // Dynamic arrivals sampled from Poisson distribution
      let arrivalLambda = baseArrivalRatePerApproach * stepSeconds;
      if (this.scenario === "unbalanced" && (appKey === "north" || appKey === "south")) {
        arrivalLambda *= 1.8;
      }
      const newArrivals = samplePoisson(arrivalLambda);
      app.queueVeh += newArrivals;
      app.countVeh += newArrivals;

      // Departures if phase is active and green
      const isActiveInCurrentPhase = activePhase.activeApproaches.includes(appKey);
      if (isActiveInCurrentPhase && isGreen && app.queueVeh > 0) {
        const capacityVeh = Math.round(departureRatePerLane * app.lanes * stepSeconds);
        const departed = Math.min(app.queueVeh, Math.max(1, capacityVeh));
        app.queueVeh = Math.max(0, app.queueVeh - departed);
      }

      // Compute PCU based on vehicle mix: average PCU factor ~0.94
      app.pcu = parseFloat((app.queueVeh * 0.94).toFixed(1));

      // Update detector lastAgeMs
      app.lastAgeMs = Math.round(90 + Math.random() * 50);
    });

    // Update overall junction metrics
    const totalQueue = Object.values(j.approaches).reduce((sum, a) => sum + a.queueVeh, 0);
    const avgDelay = parseFloat((12 + totalQueue * 0.85).toFixed(1));
    j.metrics.avgDelaySec = avgDelay;
    j.metrics.congestionLevel = avgDelay > 38 ? "high" : avgDelay > 24 ? "medium" : "low";
  }

  triggerRandomEvent() {
    const target = this.junctions[Math.floor(Math.random() * this.junctions.length)];
    const types = ["CAMERA_GLITCH", "STALLED_VEHICLE", "HIGH_QUEUE"];
    const type = types[Math.floor(Math.random() * types.length)];
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    if (type === "CAMERA_GLITCH") {
      const alertId = `ALT-${800 + this.alerts.length + 1}`;
      this.alerts.unshift({
        id: alertId,
        time: timeStr,
        timestamp: Date.now(),
        junctionId: target.id,
        junctionName: target.name,
        severity: "WARNING",
        type: "DETECTOR_FAILURE",
        message: `Detector loop frame latency spike on ${target.name}. Validated fail-safe backup timings active.`,
        status: "ACTIVE",
        safetyInterlockActive: true,
      });
      if (this.alerts.length > 25) this.alerts.pop();
    } else if (type === "STALLED_VEHICLE") {
      const alertId = `ALT-${800 + this.alerts.length + 1}`;
      this.alerts.unshift({
        id: alertId,
        time: timeStr,
        timestamp: Date.now(),
        junctionId: target.id,
        junctionName: target.name,
        severity: "WARNING",
        type: "STALLED_VEHICLE",
        message: `Stalled vehicle reported on Westbound approach at ${target.name}. Lane clearance recommended.`,
        status: "ACTIVE",
        safetyInterlockActive: false,
      });
      if (this.alerts.length > 25) this.alerts.pop();
    }
  }

  triggerEmergencySimulation() {
    this.emergencyCorridor.active = true;
    this.emergencyCorridor.vehicleId = "AMBULANCE-EMS-07";
    this.emergencyCorridor.currentJunctionIndex = 0;
    this.emergencyCorridor.etaSeconds = 48;
    this.emergencyCorridor.initialEtaSeconds = 48;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    // Add alert
    this.alerts.unshift({
      id: `ALT-EMG-${Date.now().toString().slice(-4)}`,
      time: timeStr,
      timestamp: Date.now(),
      junctionId: "J-01",
      junctionName: "Junction J-01 Central Square",
      severity: "CRITICAL",
      type: "EMERGENCY_PREEMPTION",
      message: "Priority 1 Preemption active: Ambulance EMS-07 inbound via Grand Arterial corridor.",
      status: "ACTIVE",
      safetyInterlockActive: true,
    });

    // Apply emergency preemption on current junction in corridor
    this.applyCorridorSignalState();
    this.notify();
  }

  applyCorridorSignalState() {
    const currentJunctionId = this.emergencyCorridor.route[this.emergencyCorridor.currentJunctionIndex];
    const junction = this.junctions.find(j => j.id === currentJunctionId);
    if (junction) {
      junction.controllerMode = "Emergency";
      junction.currentPhase = 0; // N-S through green corridor
      junction.phaseState = "GREEN";
      junction.phaseTimer = 35;
    }
  }

  stepEmergency(stepSeconds) {
    this.emergencyCorridor.etaSeconds = Math.max(0, this.emergencyCorridor.etaSeconds - stepSeconds);

    if (this.emergencyCorridor.etaSeconds <= 0) {
      // Step to next junction in route or complete
      const currJunctionId = this.emergencyCorridor.route[this.emergencyCorridor.currentJunctionIndex];
      const prevJunction = this.junctions.find(j => j.id === currJunctionId);
      if (prevJunction) {
        prevJunction.controllerMode = "Adaptive";
      }

      this.emergencyCorridor.currentJunctionIndex++;

      if (this.emergencyCorridor.currentJunctionIndex < this.emergencyCorridor.route.length) {
        this.emergencyCorridor.etaSeconds = 25;
        this.applyCorridorSignalState();
      } else {
        // Complete
        this.emergencyCorridor.active = false;
        this.emergencyCorridor.delaySavedSeconds += 134;
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        this.emergencyCorridor.log.unshift({
          time: timeStr,
          event: `Preemption successful for ${this.emergencyCorridor.vehicleId} across 4 junctions`,
          savedSec: 134
        });
        if (this.emergencyCorridor.log.length > 10) this.emergencyCorridor.log.pop();
      }
    }
  }

  // Operator Actions with Safety Interlock check
  setControllerMode(junctionId, newMode) {
    const junction = this.junctions.find(j => j.id === junctionId);
    if (!junction) return { success: false, reason: "Junction not found" };

    // Safety Interlock check
    if (newMode === "Manual") {
      // Allowed but flagged with audit
      junction.controllerMode = "Manual";
      return { success: true, message: `Junction ${junctionId} switched to MANUAL mode under operator supervision.` };
    }

    if (newMode === "Fail-safe") {
      junction.controllerMode = "Fail-safe";
      return { success: true, message: `Fail-safe fallback timings engaged for ${junctionId}.` };
    }

    junction.controllerMode = newMode;
    return { success: true, message: `Mode updated to ${newMode}.` };
  }

  forcePhase(junctionId, targetPhaseId) {
    const junction = this.junctions.find(j => j.id === junctionId);
    if (!junction) return { success: false, reason: "Junction not found" };

    if (junction.controllerMode !== "Manual") {
      return {
        success: false,
        reason: "SAFETY INTERLOCK: Phase forcing is rejected. Controller must be placed in MANUAL mode first."
      };
    }

    if (junction.phaseTimer > (junction.currentPhaseDuration - 10)) {
      // Must respect minimum green before forcing phase
      return {
        success: false,
        reason: `SAFETY INTERLOCK: Minimum green (10s) violation. Current phase has only served ${junction.currentPhaseDuration - junction.phaseTimer}s.`
      };
    }

    // Force yellow first to honor intergreen clearance
    junction.phaseState = "YELLOW";
    junction.phaseTimer = 3;
    setTimeout(() => {
      junction.phaseState = "ALL_RED";
      junction.phaseTimer = 2;
      setTimeout(() => {
        junction.currentPhase = targetPhaseId;
        junction.phaseState = "GREEN";
        junction.phaseTimer = 25;
        junction.currentPhaseDuration = 25;
        this.notify();
      }, 2000);
    }, 3000);

    return {
      success: true,
      message: `Safety sequence engaged: Switching to Phase P${targetPhaseId + 1} with required 3s yellow and 2s all-red intergreen.`
    };
  }

  acknowledgeAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = "ACKNOWLEDGED";
      this.notify();
    }
  }

  resolveAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = "RESOLVED";
      this.notify();
    }
  }

  toggleDetectorStatus(junctionId, detectorId) {
    const junction = this.junctions.find(j => j.id === junctionId);
    if (!junction) return;
    const det = junction.detectors.find(d => d.id === detectorId);
    if (det) {
      det.status = det.status === "OK" ? "FAULTY" : "OK";
      // If faulty, set approach health to DEGRADED
      const app = junction.approaches[det.approach];
      if (app) {
        app.detectorHealth = det.status === "OK" ? "NORMAL" : "DEGRADED";
      }
      this.notify();
    }
  }
}

// Singleton simulation instance
export const simulationEngine = new SimulationEngine();
simulationEngine.start();
