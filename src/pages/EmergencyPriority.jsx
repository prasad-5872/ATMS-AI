import React from 'react';
import { useTraffic } from '../context/TrafficContext';
import { EmergencyCorridorView } from '../components/emergency/EmergencyCorridorView';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Siren, Navigation } from 'lucide-react';

export const EmergencyPriority = () => {
  const { systemState, setSelectedJunctionId, setActiveTab } = useTraffic();
  const emergency = systemState?.emergencyCorridor;
  const isEmergency = emergency?.active;
  const junctions = systemState?.junctions || [];

  // Corridor route coordinates: J-06, J-01, J-09, J-02
  const routeJunctions = (emergency?.route || ["J-06", "J-01", "J-09", "J-02"])
    .map(id => junctions.find(j => j.id === id))
    .filter(Boolean);

  const routePositions = routeJunctions.map(j => [j.lat, j.lng]);

  const createEmergencyMarker = () => {
    return L.divIcon({
      className: 'emergency-marker',
      html: `
        <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: #EF4444; opacity: 0.5;" class="animate-ping"></div>
          <div style="width: 18px; height: 18px; border-radius: 50%; background-color: #EF4444; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px #EF4444;">
            <span style="color: white; font-size: 10px; font-weight: bold;">+</span>
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Interactive Emergency Corridor View & Preemption controls */}
      <EmergencyCorridorView />

      {/* Corridor Spatial Map Overview */}
      <div className="bg-[#111A2C] dark:bg-[#111A2C] light:bg-white rounded-lg border border-[#1F2A44] dark:border-[#1F2A44] light:border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-[#1F2A44] pb-2 text-xs">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white uppercase tracking-wider">
              Emergency Green Wave Corridor Geospatial Map
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold">
            Corridor Coordinates Locked
          </span>
        </div>

        <div className="h-[320px] w-full rounded border border-[#1F2A44] overflow-hidden dark-tiles">
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

            {/* Polyline connecting route */}
            {routePositions.length > 1 && (
              <Polyline
                positions={routePositions}
                color={isEmergency ? "#22C55E" : "#38BDF8"}
                weight={5}
                opacity={0.8}
                dashArray={isEmergency ? undefined : "6, 8"}
              />
            )}

            {/* Markers for corridor nodes */}
            {routeJunctions.map((j, idx) => {
              const isCurrent = isEmergency && idx === emergency.currentJunctionIndex;
              return (
                <Marker
                  key={j.id}
                  position={[j.lat, j.lng]}
                  icon={isCurrent ? createEmergencyMarker() : L.divIcon({
                    html: `<div style="width: 14px; height: 14px; border-radius: 50%; background-color: #22C55E; border: 2px solid #0E1726; box-shadow: 0 0 8px #22C55E;"></div>`,
                    iconSize: [14, 14],
                    iconAnchor: [7, 7]
                  })}
                >
                  <Popup>
                    <div className="font-mono text-xs">
                      <strong>{j.code}</strong>: {j.name}
                      <div>Priority Status: Preempted Green</div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};
