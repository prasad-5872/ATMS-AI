import React, { useState } from 'react';
import { useTraffic } from '../context/TrafficContext';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  Check, 
  ShieldAlert,
  Radio,
  FileCheck
} from 'lucide-react';

export const AlertsIncidents = () => {
  const { systemState, acknowledgeAlert, resolveAlert, setSelectedJunctionId, setActiveTab } = useTraffic();
  const alerts = systemState?.alerts || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL'); // ALL, CRITICAL, WARNING, INFO
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ACTIVE, ACKNOWLEDGED, RESOLVED

  const filteredAlerts = alerts.filter((a) => {
    const matchesSearch = 
      a.junctionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = severityFilter === 'ALL' || a.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse';
      case 'WARNING':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'INFO':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'ACKNOWLEDGED':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'RESOLVED':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-700 text-slate-400';
    }
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Header Summary */}
      <div className="bg-[#111A2C] dark:bg-[#111A2C] light:bg-white rounded-lg border border-[#1F2A44] dark:border-[#1F2A44] light:border-slate-200 p-3.5 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Control Center Incident Management System (ITMS)
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live audit table for detector dropouts, stalled vehicle alarms, and hardware safety interlocks
            </p>
          </div>
        </div>

        {/* Quick count chips */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-2.5 py-1 rounded bg-[#16223B] border border-[#1F2A44] text-slate-300">
            Active: <strong className="text-red-400">{alerts.filter(a => a.status === 'ACTIVE').length}</strong>
          </div>
          <div className="px-2.5 py-1 rounded bg-[#16223B] border border-[#1F2A44] text-slate-300">
            Acknowledged: <strong className="text-amber-400">{alerts.filter(a => a.status === 'ACKNOWLEDGED').length}</strong>
          </div>
          <div className="px-2.5 py-1 rounded bg-[#16223B] border border-[#1F2A44] text-slate-300">
            Resolved: <strong className="text-emerald-400">{alerts.filter(a => a.status === 'RESOLVED').length}</strong>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#111A2C] p-3 rounded-lg border border-[#1F2A44] flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by incident ID, junction, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded bg-[#16223B] border border-[#1F2A44] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 text-[10px] uppercase">Severity:</span>
          {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                severityFilter === sev
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-[#16223B] text-slate-400 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 text-[10px] uppercase">Status:</span>
          {['ALL', 'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'].map((stat) => (
            <button
              key={stat}
              onClick={() => setStatusFilter(stat)}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                statusFilter === stat
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-[#16223B] text-slate-400 hover:text-white'
              }`}
            >
              {stat}
            </button>
          ))}
        </div>
      </div>

      {/* Incident Table */}
      <div className="bg-[#111A2C] dark:bg-[#111A2C] light:bg-white rounded-lg border border-[#1F2A44] dark:border-[#1F2A44] light:border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#16223B] text-slate-400 border-b border-[#1F2A44] text-[10px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Alert ID</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Time (IST)</th>
                <th className="py-2.5 px-3">Junction</th>
                <th className="py-2.5 px-3">Incident Type</th>
                <th className="py-2.5 px-3">Message Description</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Operator Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2A44] text-slate-300">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500">
                    No matching incidents found.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((a) => (
                  <tr key={a.id} className="hover:bg-[#16223B]/40 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-cyan-400">{a.id}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getSeverityBadge(a.severity)}`}>
                        {a.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{a.time}</td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => {
                          setSelectedJunctionId(a.junctionId);
                          setActiveTab('junction');
                        }}
                        className="text-white hover:text-cyan-400 font-bold underline decoration-dotted"
                      >
                        {a.junctionName}
                      </button>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[11px] text-slate-300 font-medium">
                        {a.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 max-w-xs truncate" title={a.message}>
                      {a.message}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getStatusBadge(a.status)}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-1.5">
                      {a.status === 'ACTIVE' && (
                        <button
                          onClick={() => acknowledgeAlert(a.id)}
                          className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold"
                        >
                          Ack
                        </button>
                      )}
                      {a.status !== 'RESOLVED' && (
                        <button
                          onClick={() => resolveAlert(a.id)}
                          className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold"
                        >
                          Resolve
                        </button>
                      )}
                      {a.status === 'RESOLVED' && (
                        <span className="text-slate-500 text-[10px] flex items-center justify-end gap-1">
                          <Check className="w-3 h-3 text-emerald-400" /> Done
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
