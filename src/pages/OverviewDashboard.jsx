import React, { useState, useEffect } from 'react';
import { useTraffic } from '../context/TrafficContext';
import { StatCard } from '../components/common/StatCard';
import { 
  Car, 
  Clock, 
  Layers, 
  Network, 
  TrendingUp, 
  AlertTriangle,
  ArrowUpRight,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

export const OverviewDashboard = () => {
  const { systemState, setSelectedJunctionId, setActiveTab } = useTraffic();
  const stats = systemState?.systemStats;
  const junctions = systemState?.junctions || [];
  const delayHistory = systemState?.delayHistory || [];
  const alerts = systemState?.alerts || [];

  // Top 5 congested junctions for bar chart
  const topCongested = [...junctions]
    .sort((a, b) => b.metrics.avgDelaySec - a.metrics.avgDelaySec)
    .slice(0, 5)
    .map(j => ({
      name: j.code,
      fullName: j.name,
      delay: j.metrics.avgDelaySec,
      queue: Object.values(j.approaches).reduce((acc, a) => acc + a.queueVeh, 0),
    }));

  // Create custom Leaflet DivIcon with pulsing dot based on congestion
  const createJunctionIcon = (congestion) => {
    const color = congestion === 'high' ? '#EF4444' : congestion === 'medium' ? '#F59E0B' : '#22C55E';
    const pulseClass = congestion === 'high' ? 'animate-ping' : '';

    return L.divIcon({
      className: 'custom-junction-marker',
      html: `
        <div style="position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: ${color}; opacity: 0.35;" class="${pulseClass}"></div>
          <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${color}; border: 2px solid #0E1726; box-shadow: 0 0 8px ${color};"></div>
        </div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
      popupAnchor: [0, -10]
    });
  };

  const handleMarkerClick = (junctionId) => {
    setSelectedJunctionId(junctionId);
    setActiveTab('junction');
  };

  return (
    <div className="space-y-4">
      {/* 1. KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          title="Throughput"
          value={stats?.vehiclesPerHour?.toLocaleString() || "24,800"}
          unit="veh/h"
          change="4.2%"
          changePositive={true}
          icon={Car}
          color="cyan"
        />
        <StatCard
          title="Avg Network Delay"
          value={stats?.avgDelaySec || "24.6"}
          unit="s"
          change="26.4%"
          changePositive={true}
          icon={Clock}
          color="green"
        />
        <StatCard
          title="Avg Queue Length"
          value={stats?.avgQueueVeh || "8.2"}
          unit="veh"
          change="18.1%"
          changePositive={true}
          icon={Layers}
          color="indigo"
        />
        <StatCard
          title="Active Junctions"
          value={`${stats?.activeJunctions || 12}/12`}
          unit="online"
          icon={Network}
          color="cyan"
        />
        <StatCard
          title="Adaptive Gain"
          value={`+${stats?.adaptiveImprovementPct || 26.4}`}
          unit="%"
          change="vs Fixed"
          changePositive={true}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Active Alerts"
          value={stats?.activeAlertsCount || 0}
          unit="incidents"
          icon={AlertTriangle}
          color={stats?.activeAlertsCount > 0 ? "amber" : "cyan"}
        />
      </div>

      {/* 2. Middle Row: Interactive Leaflet City Map + Top Congested Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Leaflet City Map (7 cols) */}
        <div className="lg:col-span-7 bg-[#111A2C] dark:bg-[#111A2C] light:bg-white rounded-lg border border-[#1F2A44] dark:border-[#1F2A44] light:border-slate-200 p-3.5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-bold font-mono text-white dark:text-white light:text-slate-900 uppercase tracking-wider">
                Metropolitan Network Congestion Map
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                12 Fictional Junctions • Color Encoded Congestion Level
              </p>
            </div>
            {/* Map Legend */}
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Low (&lt;24s)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Med (24-38s)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> High (&gt;38s)
              </span>
            </div>
          </div>

          {/* Map Viewport Container */}
          <div className="h-[360px] w-full rounded border border-[#1F2A44] overflow-hidden z-10 dark-tiles">
            <MapContainer
              center={[12.9750, 77.5950]}
              zoom={13}
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%', background: '#0A0F1D' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {junctions.map((j) => (
                <Marker
                  key={j.id}
                  position={[j.lat, j.lng]}
                  icon={createJunctionIcon(j.metrics.congestionLevel)}
                >
                  <Popup>
                    <div className="font-mono text-xs text-slate-900 p-1">
                      <div className="font-bold text-sm text-cyan-800">{j.code}</div>
                      <div className="font-semibold">{j.name}</div>
                      <div className="text-[11px] text-slate-600 mt-1">
                        Corridor: {j.corridor}
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[11px]">
                        <span>Delay: <strong>{j.metrics.avgDelaySec}s</strong></span>
                        <span>Mode: <strong>{j.controllerMode}</strong></span>
                      </div>
                      <button
                        onClick={() => handleMarkerClick(j.id)}
                        className="mt-2 w-full px-2 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-[11px] font-bold"
                      >
                        Open Junction Live View →
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Top 5 Congested Junctions (5 cols) */}
        <div className="lg:col-span-5 bg-[#111A2C] dark:bg-[#111A2C] light:bg-white rounded-lg border border-[#1F2A44] dark:border-[#1F2A44] light:border-slate-200 p-3.5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-bold font-mono text-white dark:text-white light:text-slate-900 uppercase tracking-wider">
                Top Bottlenecks & Critical Delays
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Ranking by Mean Approach Vehicle Delay (s)
              </p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">Live Queue (veh)</span>
          </div>

          <div className="h-[200px] w-full font-mono text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCongested} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2A44" horizontal={false} />
                <XAxis type="number" stroke="#64748B" unit="s" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" stroke="#94A3B8" tick={{ fontSize: 11, fontWeight: 'bold' }} width={42} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0E1726', borderColor: '#1F2A44', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                  formatter={(val) => [`${val} s delay`, 'Average Delay']}
                />
                <Bar dataKey="delay" fill="#22D3EE" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Click Table */}
          <div className="mt-2 space-y-1 font-mono text-xs border-t border-[#1F2A44] pt-2">
            {topCongested.map((item, idx) => (
              <div
                key={item.name}
                onClick={() => handleMarkerClick(item.name)}
                className="flex items-center justify-between p-1.5 rounded hover:bg-[#16223B] cursor-pointer text-[11px] text-slate-300 transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-bold">#{idx + 1}</span>
                  <span className="font-bold text-cyan-400">{item.name}</span>
                  <span className="truncate max-w-[130px] text-slate-400">{item.fullName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{item.delay}s</span>
                  <span className="text-slate-500">({item.queue} veh)</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Bottom Row: 60-Minute City Delay Line Chart + Vehicle Mix Donut + Event Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* City-wide Delay Over 60 Min (6 cols) */}
        <div className="lg:col-span-6 bg-[#111A2C] dark:bg-[#111A2C] light:bg-white rounded-lg border border-[#1F2A44] dark:border-[#1F2A44] light:border-slate-200 p-3.5 shadow-sm font-mono">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-bold text-white dark:text-white light:text-slate-900 uppercase tracking-wider">
                Network Delay Trend (Past 60 Minutes)
              </h3>
              <p className="text-[11px] text-slate-400">
                Adaptive Control vs Fixed-Time Webster Baseline
              </p>
            </div>
            <div className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
              Avg Gain: +26.4%
            </div>
          </div>

          <div className="h-[210px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={delayHistory} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2A44" />
                <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 9 }} interval={9} />
                <YAxis stroke="#64748B" tick={{ fontSize: 9 }} unit="s" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0E1726', borderColor: '#1F2A44', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="avgDelaySec"
                  name="Adaptive ATCMS"
                  stroke="#22D3EE"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="fixedTimeBaseline"
                  name="Fixed-Time Pretimed"
                  stroke="#64748B"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Mix Donut (3 cols) */}
        <div className="lg:col-span-3 bg-[#111A2C] dark:bg-[#111A2C] light:bg-white rounded-lg border border-[#1F2A44] dark:border-[#1F2A44] light:border-slate-200 p-3.5 shadow-sm font-mono flex flex-col justify-between">
          <div className="mb-1">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Urban Fleet Composition
            </h3>
            <p className="text-[11px] text-slate-400">IRC:106 Mixed Traffic Share</p>
          </div>

          <div className="h-[150px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.vehicleMix || []}
                  dataKey="share"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={65}
                  paddingAngle={3}
                >
                  {(stats?.vehicleMix || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0E1726', borderColor: '#1F2A44', color: '#fff', fontSize: '10px', fontFamily: 'monospace' }}
                  formatter={(val, name) => [`${val}%`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Compact Legend Grid */}
          <div className="grid grid-cols-2 gap-1 text-[10px] pt-1 border-t border-[#1F2A44]">
            {(stats?.vehicleMix || []).map((v) => (
              <div key={v.name} className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: v.color }}></span>
                <span className="text-slate-300 truncate">{v.name}:</span>
                <span className="font-bold text-white">{v.share}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Events & Interlock Feed (3 cols) */}
        <div className="lg:col-span-3 bg-[#111A2C] dark:bg-[#111A2C] light:bg-white rounded-lg border border-[#1F2A44] dark:border-[#1F2A44] light:border-slate-200 p-3.5 shadow-sm font-mono flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Live Operations Feed
            </h3>
            <span className="text-[10px] text-cyan-400">Real-time</span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[220px] pr-1 text-xs">
            {alerts.slice(0, 4).map((alert) => (
              <div
                key={alert.id}
                onClick={() => setActiveTab('alerts')}
                className="p-2 rounded bg-[#16223B]/60 border border-[#1F2A44] hover:border-slate-500 cursor-pointer space-y-1 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                    alert.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {alert.severity}
                  </span>
                  <span className="text-[10px] text-slate-400">{alert.time}</span>
                </div>
                <div className="font-bold text-slate-200 truncate">{alert.junctionName}</div>
                <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                  {alert.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
