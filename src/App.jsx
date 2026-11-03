import React from 'react';
import { TrafficProvider, useTraffic } from './context/TrafficContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { Footer } from './components/common/Footer';

// Pages
import { OverviewDashboard } from './pages/OverviewDashboard';
import { JunctionLiveView } from './pages/JunctionLiveView';
import { VisionDetection } from './pages/VisionDetection';
import { AnalyticsComparison } from './pages/AnalyticsComparison';
import { AlertsIncidents } from './pages/AlertsIncidents';
import { EmergencyPriority } from './pages/EmergencyPriority';
import { SignalPlansSettings } from './pages/SignalPlansSettings';
import { Reports } from './pages/Reports';

const MainContent = () => {
  const { activeTab } = useTraffic();

  return (
    <main className="flex-1 overflow-y-auto p-4 bg-[#0B1220] dark:bg-[#0B1220] light:bg-[#F1F5F9] text-slate-100">
      {activeTab === 'overview' && <OverviewDashboard />}
      {activeTab === 'junction' && <JunctionLiveView />}
      {activeTab === 'vision' && <VisionDetection />}
      {activeTab === 'analytics' && <AnalyticsComparison />}
      {activeTab === 'alerts' && <AlertsIncidents />}
      {activeTab === 'emergency' && <EmergencyPriority />}
      {activeTab === 'plans' && <SignalPlansSettings />}
      {activeTab === 'reports' && <Reports />}
    </main>
  );
};

export function App() {
  return (
    <TrafficProvider>
      <div className="flex flex-col h-screen w-screen overflow-hidden select-none">
        {/* Control Room Header */}
        <Header />

        {/* Center: Sidebar + Main Content */}
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <MainContent />
        </div>

        {/* Permanent Honesty & Telemetry Footer */}
        <Footer />
      </div>
    </TrafficProvider>
  );
}

export default App;
