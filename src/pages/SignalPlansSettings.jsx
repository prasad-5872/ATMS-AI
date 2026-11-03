import React, { useState } from 'react';
import { useTraffic } from '../context/TrafficContext';
import timeOfDayPlansData from '../data/timeOfDayPlans.json';
import { 
  SlidersHorizontal, 
  Check, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  Save, 
  History, 
  UserCheck, 
  Lock 
} from 'lucide-react';

export const SignalPlansSettings = () => {
  const { operatorRole } = useTraffic();
  const [plans, setPlans] = useState(timeOfDayPlansData.plans);
  const [activePlanId, setActivePlanId] = useState(timeOfDayPlansData.activePlanId);
  const [selectedPlanId, setSelectedPlanId] = useState('plan-morning-peak');

  const [auditLog, setAuditLog] = useState([
    { id: 1, time: '14:30:15', role: 'Engineer: S. Iyer', action: 'Optimized P1 green (+5s) for Morning Peak Arterial' },
    { id: 2, time: '12:10:00', role: 'Admin: System', action: 'Loaded IRC:106 winter timing schedules' },
    { id: 3, time: '09:00:22', role: 'Operator: Rajesh K.', action: 'Activated Morning Peak Arterial Priority plan' },
  ]);

  const [saveFeedback, setSaveFeedback] = useState(null);

  const currentPlan = plans.find(p => p.id === selectedPlanId) || plans[0];

  const handlePhaseTimeChange = (phaseId, field, newVal) => {
    if (operatorRole === 'Operator') {
      alert('Read-only: Switch role to Engineer or Admin to modify signal plan timings.');
      return;
    }

    const val = parseInt(newVal, 10) || 0;
    setPlans(prev => prev.map(p => {
      if (p.id !== selectedPlanId) return p;
      const updatedPhases = p.phases.map(ph => {
        if (ph.id !== phaseId) return ph;
        return { ...ph, [field]: val };
      });
      // Recalculate cycle length
      const newCycle = updatedPhases.reduce((acc, ph) => acc + ph.greenSec + ph.yellowSec + ph.allRedSec, 0);
      return { ...p, phases: updatedPhases, cycleLength: newCycle };
    }));
  };

  const handleSavePlan = () => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    setAuditLog(prev => [
      {
        id: Date.now(),
        time: timeStr,
        role: `${operatorRole}`,
        action: `Saved updated timings for ${currentPlan.name} (Cycle: ${currentPlan.cycleLength}s)`
      },
      ...prev
    ]);

    setSaveFeedback(`Plan "${currentPlan.name}" saved & validated successfully.`);
    setTimeout(() => setSaveFeedback(null), 4000);
  };

  const handleActivatePlan = (planId) => {
    setActivePlanId(planId);
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setAuditLog(prev => [
      {
        id: Date.now(),
        time: timeStr,
        role: `${operatorRole}`,
        action: `Engaged active TOD plan: ${plans.find(p => p.id === planId)?.name}`
      },
      ...prev
    ]);
  };

  // Validation checks
  const isMinGreenValid = currentPlan.phases.every(p => p.greenSec >= currentPlan.bounds.minGreenSec);
  const isMaxGreenValid = currentPlan.phases.every(p => p.greenSec <= currentPlan.bounds.maxGreenSec);
  const isYellowValid = currentPlan.phases.every(p => p.yellowSec >= 3);
  const isAllRedValid = currentPlan.phases.every(p => p.allRedSec >= 2);
  const allValid = isMinGreenValid && isMaxGreenValid && isYellowValid && isAllRedValid;

  return (
    <div className="space-y-4 font-mono">
      {/* Top Banner and Role Permission indicator */}
      <div className="bg-[#111A2C] dark:bg-[#111A2C] light:bg-white rounded-lg border border-[#1F2A44] dark:border-[#1F2A44] light:border-slate-200 p-3.5 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Time-of-Day (TOD) Signal Plans & Parameters
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Programmed cycle splits, minimum clearance envelopes, and role-governed parameter edits
            </p>
          </div>
        </div>

        {/* Role Permission Badge */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Current Role:</span>
          <span className={`px-2.5 py-1 rounded font-bold border ${
            operatorRole === 'Admin'
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
              : operatorRole === 'Engineer'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              : 'bg-slate-700 text-slate-300 border-slate-600'
          }`}>
            {operatorRole} ({operatorRole === 'Operator' ? 'View/Activate' : 'Full Edit'})
          </span>
        </div>
      </div>

      {/* Plan Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {plans.map((p) => {
          const isSelected = selectedPlanId === p.id;
          const isActive = activePlanId === p.id;

          return (
            <div
              key={p.id}
              onClick={() => setSelectedPlanId(p.id)}
              className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-md'
                  : 'bg-[#111A2C] border-[#1F2A44] text-slate-400 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{p.name}</span>
                {isActive && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                    ACTIVE NOW
                  </span>
                )}
              </div>

              <div className="my-2 text-[11px] space-y-0.5">
                <div className="text-cyan-300 font-semibold">{p.timeWindow}</div>
                <div className="text-slate-400">Cycle Length: {p.cycleLength}s</div>
              </div>

              <div className="pt-2 border-t border-[#1F2A44] flex items-center justify-between text-[10px]">
                <span className="text-slate-400">{p.phases.length} Phases</span>
                {!isActive && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActivatePlan(p.id);
                    }}
                    className="text-cyan-400 hover:underline font-bold"
                  >
                    Activate Plan
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Plan Phase Timings Editor */}
      <div className="bg-[#111A2C] dark:bg-[#111A2C] light:bg-white rounded-lg border border-[#1F2A44] dark:border-[#1F2A44] light:border-slate-200 p-4 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1F2A44] pb-2">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Phase Timing Configuration: {currentPlan.name}
            </h4>
            <p className="text-[11px] text-slate-400">
              Computed Total Cycle: <strong className="text-cyan-300">{currentPlan.cycleLength}s</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSavePlan}
              disabled={!allValid || operatorRole === 'Operator'}
              className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition-all ${
                allValid && operatorRole !== 'Operator'
                  ? 'bg-cyan-500 hover:bg-cyan-600 text-slate-950 shadow'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              Save Plan Timings
            </button>
          </div>
        </div>

        {/* Phase Row Sliders / Inputs */}
        <div className="space-y-3">
          {currentPlan.phases.map((ph) => (
            <div
              key={ph.id}
              className="p-3 rounded bg-[#16223B]/60 border border-[#1F2A44] flex flex-wrap items-center justify-between gap-3 text-xs"
            >
              <div className="w-48">
                <div className="font-bold text-slate-200">{ph.id}: {ph.name}</div>
                <div className="text-[10px] text-slate-400">
                  Total Phase Interval: {ph.greenSec + ph.yellowSec + ph.allRedSec}s
                </div>
              </div>

              {/* Green Slider & Input */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-emerald-400 font-bold w-12">Green:</span>
                <input
                  type="range"
                  min={currentPlan.bounds.minGreenSec}
                  max={currentPlan.bounds.maxGreenSec}
                  value={ph.greenSec}
                  disabled={operatorRole === 'Operator'}
                  onChange={(e) => handlePhaseTimeChange(ph.id, 'greenSec', e.target.value)}
                  className="w-28 accent-emerald-400"
                />
                <span className="font-bold text-white w-8">{ph.greenSec}s</span>
              </div>

              {/* Yellow clearance */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-amber-400 font-bold">Yellow:</span>
                <input
                  type="number"
                  min="3"
                  max="6"
                  value={ph.yellowSec}
                  disabled={operatorRole === 'Operator'}
                  onChange={(e) => handlePhaseTimeChange(ph.id, 'yellowSec', e.target.value)}
                  className="w-12 bg-[#111A2C] border border-[#1F2A44] rounded px-1.5 py-0.5 text-center text-white"
                />
                <span className="text-slate-400 text-[10px]">s</span>
              </div>

              {/* All Red clearance */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-red-400 font-bold">All-Red:</span>
                <input
                  type="number"
                  min="2"
                  max="5"
                  value={ph.allRedSec}
                  disabled={operatorRole === 'Operator'}
                  onChange={(e) => handlePhaseTimeChange(ph.id, 'allRedSec', e.target.value)}
                  className="w-12 bg-[#111A2C] border border-[#1F2A44] rounded px-1.5 py-0.5 text-center text-white"
                />
                <span className="text-slate-400 text-[10px]">s</span>
              </div>

              {/* Pedestrian walk time */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-sky-400 font-bold">Ped Walk:</span>
                <input
                  type="number"
                  min="0"
                  max="25"
                  value={ph.pedestrianSec}
                  disabled={operatorRole === 'Operator'}
                  onChange={(e) => handlePhaseTimeChange(ph.id, 'pedestrianSec', e.target.value)}
                  className="w-12 bg-[#111A2C] border border-[#1F2A44] rounded px-1.5 py-0.5 text-center text-white"
                />
                <span className="text-slate-400 text-[10px]">s</span>
              </div>
            </div>
          ))}
        </div>

        {/* Validation Status Checklist */}
        <div className="p-3 rounded bg-[#16223B]/40 border border-[#1F2A44] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              {isMinGreenValid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
              Min Green &ge; {currentPlan.bounds.minGreenSec}s
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              {isMaxGreenValid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
              Max Green &le; {currentPlan.bounds.maxGreenSec}s
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              {isYellowValid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
              Yellow &ge; 3s
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              {isAllRedValid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
              All-Red &ge; 2s
            </span>
          </div>

          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${allValid ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
            {allValid ? 'VALIDATION: ALL RULES PASSED' : 'VALIDATION: CONFLICT DETECTED'}
          </span>
        </div>

        {saveFeedback && (
          <div className="p-2 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{saveFeedback}</span>
          </div>
        )}
      </div>

      {/* Audit Log */}
      <div className="bg-[#111A2C] dark:bg-[#111A2C] light:bg-white rounded-lg border border-[#1F2A44] dark:border-[#1F2A44] light:border-slate-200 p-4 shadow-sm font-mono space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
          <History className="w-4 h-4 text-cyan-400" />
          <span>Configuration Audit & Role Change History</span>
        </div>

        <div className="space-y-2 text-xs">
          {auditLog.map((log) => (
            <div
              key={log.id}
              className="p-2 rounded bg-[#16223B]/50 border border-[#1F2A44] flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[10px]">{log.time} IST</span>
                <span className="text-cyan-300 font-bold text-[11px]">{log.role}:</span>
                <span className="text-slate-200">{log.action}</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">VERIFIED</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
