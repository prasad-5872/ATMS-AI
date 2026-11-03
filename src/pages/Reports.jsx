import React, { useState } from 'react';
import { useTraffic } from '../context/TrafficContext';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Calendar, 
  GitCommit, 
  CheckCircle,
  Clock,
  Car,
  TrendingDown,
  Layers
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

export const Reports = () => {
  const { systemState } = useTraffic();
  const junctions = systemState?.junctions || [];

  const [selectedJunctionId, setSelectedJunctionId] = useState('ALL');
  const [dateRange, setDateRange] = useState('TODAY'); // TODAY, YESTERDAY, 7DAYS, 30DAYS

  // Selected or aggregated metrics
  const selectedJunc = selectedJunctionId === 'ALL'
    ? null
    : junctions.find(j => j.id === selectedJunctionId);

  // Hourly report preview chart data
  const reportHourlyData = [
    { hour: '06:00', delayAdaptive: 14.2, delayFixed: 22.5, flow: 1200 },
    { hour: '07:00', delayAdaptive: 21.5, delayFixed: 32.8, flow: 2100 },
    { hour: '08:00', delayAdaptive: 34.6, delayFixed: 52.4, flow: 3400 },
    { hour: '09:00', delayAdaptive: 38.2, delayFixed: 61.0, flow: 3850 },
    { hour: '10:00', delayAdaptive: 32.0, delayFixed: 48.5, flow: 3200 },
    { hour: '11:00', delayAdaptive: 22.4, delayFixed: 33.2, flow: 2300 },
    { hour: '12:00', delayAdaptive: 24.1, delayFixed: 35.0, flow: 2450 },
    { hour: '13:00', delayAdaptive: 23.5, delayFixed: 34.1, flow: 2400 },
    { hour: '14:00', delayAdaptive: 26.8, delayFixed: 38.6, flow: 2600 },
  ];

  // Export to CSV function
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Junction ID,Junction Name,Corridor,Controller Mode,Avg Delay (s),Throughput (veh/h),Congestion Level\n";

    const rows = selectedJunc ? [selectedJunc] : junctions;
    rows.forEach(j => {
      csvContent += `"${j.code}","${j.name}","${j.corridor}","${j.controllerMode}",${j.metrics.avgDelaySec},${j.metrics.throughputVehH},"${j.metrics.congestionLevel}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ATLAS_Report_${selectedJunctionId}_${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Top Filter Bar (No print) */}
      <div className="no-print bg-[#111A2C] dark:bg-[#111A2C] light:bg-white rounded-lg border border-[#1F2A44] dark:border-[#1F2A44] light:border-slate-200 p-3.5 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Traffic Operations Reporting & Audit Center
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Generate certified ITMS delay reduction reports, compliance sheets, and CSV exports
            </p>
          </div>
        </div>

        {/* Filter selectors */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Junction Selector */}
          <div className="flex items-center gap-1.5 bg-[#16223B] px-2 py-1 rounded border border-[#1F2A44]">
            <GitCommit className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={selectedJunctionId}
              onChange={(e) => setSelectedJunctionId(e.target.value)}
              className="bg-transparent text-slate-200 font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#111A2C]">Network Wide (All 12 Nodes)</option>
              {junctions.map((j) => (
                <option key={j.id} value={j.id} className="bg-[#111A2C]">
                  {j.code}: {j.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-1.5 bg-[#16223B] px-2 py-1 rounded border border-[#1F2A44]">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent text-slate-200 font-bold focus:outline-none cursor-pointer"
            >
              <option value="TODAY" className="bg-[#111A2C]">Current Shift (Today)</option>
              <option value="YESTERDAY" className="bg-[#111A2C]">Yesterday (24h)</option>
              <option value="7DAYS" className="bg-[#111A2C]">Past 7 Days Aggregate</option>
              <option value="30DAYS" className="bg-[#111A2C]">Month to Date (30d)</option>
            </select>
          </div>

          {/* Export Buttons */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded bg-[#16223B] hover:bg-[#1F2A44] border border-[#1F2A44] text-slate-200 font-bold flex items-center gap-1.5"
            title="Export CSV data"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            CSV Export
          </button>

          <button
            onClick={handlePrintPDF}
            className="px-3 py-1.5 rounded bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold flex items-center gap-1.5 shadow"
            title="Print or Save PDF report"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / PDF
          </button>
        </div>
      </div>

      {/* Printable Report Document Body */}
      <div className="card-print bg-[#111A2C] dark:bg-[#111A2C] light:bg-white rounded-lg border border-[#1F2A44] dark:border-[#1F2A44] light:border-slate-200 p-6 shadow-sm space-y-6">
        {/* Formal Report Header */}
        <div className="border-b border-[#1F2A44] pb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold tracking-wider text-white dark:text-white light:text-slate-900">
                ATLAS TRAFFIC PERFORMANCE AUDIT REPORT
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                SIMULATED DATASET
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Target Scope: {selectedJunc ? `${selectedJunc.code} - ${selectedJunc.name}` : 'Metropolitan Network (12 Controlled Nodes)'}
            </p>
          </div>

          <div className="text-right text-xs text-slate-400 space-y-0.5">
            <div>Generated: 2026-11-02 14:57 IST</div>
            <div>Evaluation Standard: IRC:106-1990 PCU Guidelines</div>
            <div className="text-emerald-400 font-bold">Hardware Safety Clearance: 100% OK</div>
          </div>
        </div>

        {/* Executive Summary Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded bg-[#16223B]/60 border border-[#1F2A44]">
            <span className="text-[10px] text-slate-400 uppercase">Average Travel Delay</span>
            <div className="text-xl font-bold text-white mt-1">
              {selectedJunc ? selectedJunc.metrics.avgDelaySec : '24.6'} <span className="text-xs font-normal text-slate-400">s/veh</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">▼ 26.4% vs Fixed-Time</span>
          </div>

          <div className="p-3 rounded bg-[#16223B]/60 border border-[#1F2A44]">
            <span className="text-[10px] text-slate-400 uppercase">Total Serviced Flow</span>
            <div className="text-xl font-bold text-cyan-300 mt-1">
              {selectedJunc ? selectedJunc.metrics.throughputVehH.toLocaleString() : '24,800'} <span className="text-xs font-normal text-slate-400">veh/h</span>
            </div>
            <span className="text-[10px] text-slate-400">Capacity utilization: 84%</span>
          </div>

          <div className="p-3 rounded bg-[#16223B]/60 border border-[#1F2A44]">
            <span className="text-[10px] text-slate-400 uppercase">Average Queue Length</span>
            <div className="text-xl font-bold text-amber-300 mt-1">
              {selectedJunc ? '8.4' : '7.9'} <span className="text-xs font-normal text-slate-400">veh/lane</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">▼ 18.2% queue reduction</span>
          </div>

          <div className="p-3 rounded bg-[#16223B]/60 border border-[#1F2A44]">
            <span className="text-[10px] text-slate-400 uppercase">Estimated Carbon Savings</span>
            <div className="text-xl font-bold text-emerald-300 mt-1">
              -14.8% <span className="text-xs font-normal text-slate-400">CO2</span>
            </div>
            <span className="text-[10px] text-slate-400">Reduced idling stop cycles</span>
          </div>
        </div>

        {/* Hourly Delay Profile Chart */}
        <div className="p-4 rounded bg-[#16223B]/40 border border-[#1F2A44] space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-200">
            <span>Hourly Delay Profile: Adaptive ATCMS vs Pretimed Webster Baseline</span>
            <span className="text-[10px] text-slate-400">Time Window: 06:00 - 14:00 IST</span>
          </div>

          <div className="h-[220px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reportHourlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2A44" />
                <XAxis dataKey="hour" stroke="#64748B" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748B" unit="s" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0E1726', borderColor: '#1F2A44', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="delayAdaptive"
                  name="ATLAS Adaptive Delay (s)"
                  stroke="#22D3EE"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="delayFixed"
                  name="Fixed-Time Baseline (s)"
                  stroke="#EF4444"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Junction Detailed Breakdown Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Node-by-Node Controller Performance Audit Table
          </h4>

          <div className="overflow-x-auto rounded border border-[#1F2A44]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#16223B] text-slate-400 text-[10px] uppercase">
                <tr>
                  <th className="py-2 px-3">Node Code</th>
                  <th className="py-2 px-3">Junction Name</th>
                  <th className="py-2 px-3">Corridor</th>
                  <th className="py-2 px-3">Control Mode</th>
                  <th className="py-2 px-3">Cycle (s)</th>
                  <th className="py-2 px-3">Avg Delay (s)</th>
                  <th className="py-2 px-3">Throughput (veh/h)</th>
                  <th className="py-2 px-3">Sensor Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2A44] text-slate-300">
                {(selectedJunc ? [selectedJunc] : junctions).map((j) => (
                  <tr key={j.id} className="hover:bg-[#16223B]/30">
                    <td className="py-2 px-3 font-bold text-cyan-400">{j.code}</td>
                    <td className="py-2 px-3 font-semibold text-white">{j.name}</td>
                    <td className="py-2 px-3 text-slate-400">{j.corridor}</td>
                    <td className="py-2 px-3 text-slate-300">{j.controllerMode}</td>
                    <td className="py-2 px-3">{j.cycleLength}s</td>
                    <td className="py-2 px-3 font-bold">{j.metrics.avgDelaySec}s</td>
                    <td className="py-2 px-3">{j.metrics.throughputVehH.toLocaleString()}</td>
                    <td className="py-2 px-3 text-emerald-400 font-bold">100% OK</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Formal Report Signoff Footer */}
        <div className="border-t border-[#1F2A44] pt-4 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
          <div>
            <div>System: ATLAS ITMS v2.4.1 (Simulated Local Engine)</div>
            <div>Research Prototype • Not for actual field road deployment</div>
          </div>
          <div className="text-right">
            <div>Traffic Control Center Directorate</div>
            <div className="text-slate-500">Certified Digital Audit Record</div>
          </div>
        </div>
      </div>
    </div>
  );
};
