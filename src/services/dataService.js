/**
 * dataService.js
 * 
 * Unified Data Access Interface for ATLAS ATCMS.
 * 
 * ARCHITECTURAL NOTE:
 * This service currently routes queries and actions to the local Simulation Engine.
 * To integrate with a production FastAPI / MQTT backend:
 *   1. Replace the methods below with your `fetch('/api/v1/...')` or MQTT client subscriptions.
 *   2. Maintain the same return signatures and event callbacks.
 *   3. Set `BACKEND_TYPE = 'REST_MQTT'` instead of `'SIMULATED_LOCAL'`.
 */

import { simulationEngine } from '../simulation/engine';
import resultsData from '../data/results.json';
import timeOfDayPlansData from '../data/timeOfDayPlans.json';
import pcuConfigData from '../data/pcuConfig.json';

export const BACKEND_TYPE = 'SIMULATED_LOCAL'; // Toggle to 'REST_MQTT' for live field gateway

class DataService {
  /**
   * Subscribe to global live system updates (1-second tick)
   * @param {Function} callback 
   * @returns {Function} unsubscribe
   */
  subscribeSystemUpdates(callback) {
    return simulationEngine.subscribe(callback);
  }

  /**
   * Retrieve all junction topologies and current runtime state
   */
  async getJunctions() {
    return simulationEngine.getState().junctions;
  }

  /**
   * Retrieve single junction by ID
   */
  async getJunction(id) {
    const junctions = simulationEngine.getState().junctions;
    return junctions.find(j => j.id === id) || null;
  }

  /**
   * Get delay history over the past 60 minutes
   */
  async getDelayHistory() {
    return simulationEngine.getState().delayHistory;
  }

  /**
   * Get benchmark comparison experiment data (from results.json)
   */
  async getBenchmarkResults() {
    return resultsData;
  }

  /**
   * Get Time-of-day signal plans
   */
  async getSignalPlans() {
    return timeOfDayPlansData;
  }

  /**
   * Get PCU weight configuration
   */
  async getPCUConfig() {
    return pcuConfigData;
  }

  /**
   * Switch controller mode for a junction with safety verification
   * @param {string} junctionId 
   * @param {string} mode ('Adaptive' | 'Fixed-time' | 'Manual' | 'Fail-safe' | 'Emergency')
   */
  async setControllerMode(junctionId, mode) {
    return simulationEngine.setControllerMode(junctionId, mode);
  }

  /**
   * Force signal phase under operator manual control with Safety Interlock check
   * @param {string} junctionId 
   * @param {number} phaseId (0..3)
   */
  async forcePhase(junctionId, phaseId) {
    return simulationEngine.forcePhase(junctionId, phaseId);
  }

  /**
   * Trigger emergency preemption corridor simulation
   */
  async triggerEmergencyPreemption() {
    return simulationEngine.triggerEmergencySimulation();
  }

  /**
   * Set simulation speed multiplier (1x, 5x, 10x)
   */
  setSpeed(multiplier) {
    simulationEngine.setSpeed(multiplier);
  }

  /**
   * Set traffic demand scenario ('low' | 'medium' | 'peak' | 'unbalanced')
   */
  setScenario(scenarioKey) {
    simulationEngine.setScenario(scenarioKey);
  }

  /**
   * Acknowledge an incident alert
   */
  acknowledgeAlert(alertId) {
    simulationEngine.acknowledgeAlert(alertId);
  }

  /**
   * Resolve an incident alert
   */
  resolveAlert(alertId) {
    simulationEngine.resolveAlert(alertId);
  }

  /**
   * Toggle sensor detector health state for testing fail-safe logic
   */
  toggleDetectorStatus(junctionId, detectorId) {
    simulationEngine.toggleDetectorStatus(junctionId, detectorId);
  }
}

export const dataService = new DataService();
