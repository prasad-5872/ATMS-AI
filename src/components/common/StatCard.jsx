import React from 'react';

export const StatCard = ({ title, value, unit, change, changePositive, icon: Icon, color = "cyan" }) => {
  const colorMap = {
    cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    green: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    red: "text-red-400 bg-red-500/10 border-red-500/20",
    indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  };

  const badgeClass = colorMap[color] || colorMap.cyan;

  return (
    <div className="bg-[#111A2C] dark:bg-[#111A2C] light:bg-white rounded-lg border border-[#1F2A44] dark:border-[#1F2A44] light:border-slate-200 p-3.5 flex flex-col justify-between shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider font-mono">
          {title}
        </span>
        {Icon && (
          <div className={`p-1.5 rounded border ${badgeClass}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold font-mono text-white dark:text-white light:text-slate-900 tracking-tight">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono text-slate-400">
            {unit}
          </span>
        )}
      </div>

      {change !== undefined && (
        <div className="mt-2 flex items-center gap-1.5 text-[11px] font-mono">
          <span className={`font-semibold ${changePositive ? 'text-emerald-400' : 'text-amber-400'}`}>
            {changePositive ? '▼' : '▲'} {change}
          </span>
          <span className="text-slate-500">vs fixed baseline</span>
        </div>
      )}
    </div>
  );
};
