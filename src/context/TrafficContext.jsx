import React, { createContext, useContext, useState, useEffect } from 'react';
import { dataService } from '../services/dataService';

const TrafficContext = createContext(null);

export const TrafficProvider = ({ children }) => {
  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (['overview', 'junction', 'vision', 'analytics', 'alerts', 'emergency', 'plans', 'reports'].includes(hash)) {
        return hash;
      }
    }
    return "overview";
  };

  const [systemState, setSystemState] = useState(null);
  const [selectedJunctionId, setSelectedJunctionId] = useState("J-01");
  const [activeTab, setActiveTabState] = useState(getInitialTab);
  const [theme, setTheme] = useState("dark"); // dark, light
  const [operatorRole, setOperatorRole] = useState("Operator"); // Operator, Engineer, Admin
  const [currentTime, setCurrentTime] = useState("");

  const setActiveTab = (tab) => {
    if (typeof window !== 'undefined') {
      window.location.hash = tab;
    }
    setActiveTabState(tab);
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['overview', 'junction', 'vision', 'analytics', 'alerts', 'emergency', 'plans', 'reports'].includes(hash)) {
        setActiveTabState(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Connect to dataService subscription
  useEffect(() => {
    const unsubscribe = dataService.subscribeSystemUpdates((state) => {
      setSystemState(state);
    });
    return () => unsubscribe();
  }, []);

  // Update live clock every second in IST (UTC+5:30)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setCurrentTime(timeStr);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Apply dark/light theme class to document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const selectedJunction = systemState?.junctions?.find(j => j.id === selectedJunctionId) || systemState?.junctions?.[0] || null;

  const value = {
    systemState,
    selectedJunctionId,
    setSelectedJunctionId,
    selectedJunction,
    activeTab,
    setActiveTab,
    theme,
    toggleTheme,
    operatorRole,
    setOperatorRole,
    currentTime,
    dataService,
    // Actions shortcuts
    setSpeed: (speed) => dataService.setSpeed(speed),
    setScenario: (scen) => dataService.setScenario(scen),
    triggerEmergency: () => dataService.triggerEmergencyPreemption(),
    setControllerMode: (jId, mode) => dataService.setControllerMode(jId, mode),
    forcePhase: (jId, pId) => dataService.forcePhase(jId, pId),
    acknowledgeAlert: (id) => dataService.acknowledgeAlert(id),
    resolveAlert: (id) => dataService.resolveAlert(id),
    toggleDetectorStatus: (jId, detId) => dataService.toggleDetectorStatus(jId, detId),
  };

  return (
    <TrafficContext.Provider value={value}>
      {children}
    </TrafficContext.Provider>
  );
};

export const useTraffic = () => {
  const context = useContext(TrafficContext);
  if (!context) {
    throw new Error("useTraffic must be used within a TrafficProvider");
  }
  return context;
};
