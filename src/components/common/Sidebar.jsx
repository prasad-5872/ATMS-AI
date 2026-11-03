import React from 'react';
import { useTraffic } from '../../context/TrafficContext';
import { 
  LayoutDashboard, 
  GitCommit, 
  Camera, 
  BarChart3, 
  AlertTriangle, 
  Siren, 
  SlidersHorizontal, 
  FileSpreadsheet,
  Activity,
  CheckCircle2
} from 'lucide-react';

export const Sidebar = () => {
  const { activeTab, setActiveTab, systemState, selectedJunction } = useTraffic();

  const activeAlerts = systemState?.systemStats?.activeAlertsCount || 0;
  const isEmergency = systemState?.emergencyCorridor?.active;

  const navItems = [
    { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard, badge: '12 Junc' },
    { id: 'junction', label: 'Junction Live View', icon: GitCommit, badge: selectedJunction?.code || 'J-01' },
    { id: 'vision', label: 'Vision Detection', icon: Camera, badge: '30 FPS' },
    { id: 'analytics', label: 'Analytics & Models', icon: BarChart3, badge: 'results.json' },
    { id: 'alerts', label: 'Alerts & Incidents', icon: AlertTriangle, badge: activeAlerts > 0 ? `${activeAlerts} active` : null, alert: activeAlerts > 0 },
    { id: 'emergency', label: 'Emergency Priority', icon: Siren, badge: isEmergency ? 'ACTIVE' : 'Standby', emergency: isEmergency },
    { id: 'plans', label: 'Signal Plans & Settings', icon: SlidersHorizontal, badge: 'TOD' },
    { id: 'reports', label: 'Reports & Export', icon: FileSpreadsheet, badge: 'CSV/PDF' },
  ];

  return (
    <aside className="w-64 border-r border-[#1F2A44] dark:border-[#1F2A44] light:border-slate-200 bg-[#0E1726] dark:bg-[#0E1726] light:bg-white flex flex-col justify-between shrink-0 select-none">
      {/* Top Nav links */}
      <div className="p-3 space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
          ITMS Control Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-all ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#16223B]/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    item.emergency
                      ? 'bg-red-500/30 text-red-300 font-bold animate-pulse'
                      : item.alert
                      ? 'bg-amber-500/20 text-amber-300 font-bold'
                      : isActive
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : 'bg-[#1F2A44] text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom status widget */}
      <div className="p-3 border-t border-[#1F2A44] dark:border-[#1F2A44] light:border-slate-200 bg-[#0B1220]/60 text-[11px] font-mono text-slate-400 space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Safety Interlock
          </span>
          <span className="text-emerald-400 font-bold">ARMED</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            Adaptive Algorithm
          </span>
          <span className="text-cyan-400">IRC PCU-v4</span>
        </div>
        <div className="pt-1 border-t border-[#1F2A44]/60 text-[10px] text-slate-500 text-center">
          ATLAS ITMS v2.4.1-PROD
        </div>
      </div>
    </aside>
  );
};
