import React from 'react';
import { useTraffic } from '../../context/TrafficContext';
import { 
  Activity, 
  Bell, 
  Clock, 
  Sun, 
  Moon, 
  ShieldAlert, 
  Zap, 
  Sliders, 
  UserCheck,
  Server
} from 'lucide-react';

export const Header = () => {
  const { 
    systemState, 
    currentTime, 
    theme, 
    toggleTheme, 
    operatorRole, 
    setOperatorRole,
    setSpeed,
    setScenario,
    setActiveTab,
    triggerEmergency
  } = useTraffic();

  const speed = systemState?.speedMultiplier || 1;
  const scenario = systemState?.scenario || 'medium';
  const activeAlerts = systemState?.systemStats?.activeAlertsCount || 0;
  const isEmergency = systemState?.emergencyCorridor?.active;

  return (
    <header className="h-14 border-b border-[#1F2A44] dark:border-[#1F2A44] bg-[#0E1726] dark:bg-[#0E1726] light:bg-white light:border-slate-200 px-4 flex items-center justify-between z-30 shrink-0 select-none">
      {/* Brand & Honesty Badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-wider text-white dark:text-white light:text-slate-900 font-mono">
                ATLAS
              </span>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold tracking-tight">
                SIMULATED DATA
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 light:text-slate-500 -mt-0.5 tracking-tight hidden sm:block">
              Adaptive Traffic Control Management System
            </p>
          </div>
        </div>

        {/* Server & Engine Status Chip */}
        <div className="hidden lg:flex items-center gap-1.5 ml-4 px-2 py-1 rounded bg-[#16223B] dark:bg-[#16223B] light:bg-slate-100 border border-[#1F2A44] dark:border-[#1F2A44] light:border-slate-200 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <Server className="w-3 h-3 text-cyan-400" />
          <span className="font-mono text-slate-300 dark:text-slate-300 light:text-slate-700">
            ENGINE: 1000ms TICK
          </span>
        </div>
      </div>

      {/* Control Room Operator Bar */}
      <div className="flex items-center gap-3">
        {/* Scenario Selector */}
        <div className="hidden md:flex items-center gap-1 bg-[#111A2C] dark:bg-[#111A2C] light:bg-slate-100 p-0.5 rounded border border-[#1F2A44] dark:border-[#1F2A44] light:border-slate-200">
          <span className="text-[10px] font-mono text-slate-400 px-1.5 uppercase">Demand:</span>
          {['low', 'medium', 'peak', 'unbalanced'].map((scen) => (
            <button
              key={scen}
              onClick={() => setScenario(scen)}
              className={`px-2 py-0.5 text-xs font-mono rounded capitalize transition-all ${
                scenario === scen
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900'
              }`}
            >
              {scen}
            </button>
          ))}
        </div>

        {/* Sim Speed Toggle (1x, 5x, 10x) */}
        <div className="flex items-center bg-[#111A2C] dark:bg-[#111A2C] light:bg-slate-100 p-0.5 rounded border border-[#1F2A44] dark:border-[#1F2A44] light:border-slate-200">
          {[1, 5, 10].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-1.5 py-0.5 text-xs font-mono rounded transition-all ${
                speed === s
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Emergency Preemption Demo Trigger Button */}
        <button
          onClick={triggerEmergency}
          disabled={isEmergency}
          className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold font-mono transition-all ${
            isEmergency 
              ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse'
              : 'bg-red-500 hover:bg-red-600 text-white shadow-sm'
          }`}
          title="Simulate ambulance approaching corridor"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {isEmergency ? 'CORRIDOR ACTIVE' : 'SIMULATE EMERGENCY'}
          </span>
        </button>

        {/* Clock IST (UTC+5:30) */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#111A2C] dark:bg-[#111A2C] light:bg-slate-100 border border-[#1F2A44] dark:border-[#1F2A44] light:border-slate-200 text-slate-200 dark:text-slate-200 light:text-slate-800 font-mono text-xs font-semibold">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{currentTime || '14:57:00'}</span>
          <span className="text-[10px] text-slate-400 font-normal">IST</span>
        </div>

        {/* Alert Bell */}
        <button
          onClick={() => setActiveTab('alerts')}
          className="relative p-1.5 rounded bg-[#111A2C] dark:bg-[#111A2C] light:bg-slate-100 border border-[#1F2A44] dark:border-[#1F2A44] light:border-slate-200 text-slate-300 hover:text-white"
          title="Incident Alerts"
        >
          <Bell className="w-4 h-4" />
          {activeAlerts > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-mono font-bold flex items-center justify-center">
              {activeAlerts}
            </span>
          )}
        </button>

        {/* Role Badge Dropdown */}
        <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded bg-[#16223B] dark:bg-[#16223B] light:bg-slate-100 border border-[#1F2A44] dark:border-[#1F2A44] light:border-slate-200 text-xs">
          <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
          <select 
            value={operatorRole} 
            onChange={(e) => setOperatorRole(e.target.value)}
            className="bg-transparent text-slate-300 dark:text-slate-300 light:text-slate-800 font-mono text-xs focus:outline-none cursor-pointer"
          >
            <option value="Operator" className="bg-[#111A2C] text-white">Op: Rajesh K.</option>
            <option value="Engineer" className="bg-[#111A2C] text-white">Eng: S. Iyer</option>
            <option value="Admin" className="bg-[#111A2C] text-white">Admin: System</option>
          </select>
        </div>

        {/* Dark/Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded bg-[#111A2C] dark:bg-[#111A2C] light:bg-slate-100 border border-[#1F2A44] dark:border-[#1F2A44] light:border-slate-200 text-slate-400 hover:text-white"
          title="Toggle Control Room Lighting Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
      </div>
    </header>
  );
};
