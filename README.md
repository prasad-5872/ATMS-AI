# ATLAS: Adaptive Traffic Control Management System

> **SIMULATED DATA PROTOTYPE**  
> *Research prototype, not for real road use. All junctions and network topologies are fictional.*

---

## 🚦 System Overview

**ATLAS** is a production-grade, web-based city traffic control center operator interface modeled on modern Intelligent Transportation Management Systems (**ITMS**) and Adaptive Traffic Control Systems (**ATCS**), such as SCATS, SCOOT, and CoSiCoSt.

Built with **React**, **Vite**, **Tailwind CSS**, **Leaflet (OpenStreetMap)**, **Recharts**, and **Lucide Icons**, ATLAS simulates live urban traffic flow, detector loop/CCTV inputs, real-time signal timing optimization, and automated emergency vehicle preemption across a 12-node metropolitan grid.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+ recommended, verified on Node v24)
- npm or pnpm

### 1. Install Dependencies
```bash
npm install
```

### 2. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or the port displayed in your terminal) in your browser.

### 3. Production Build
```bash
npm run build
npm run preview
```

---

## 📊 How to Replace Placeholder Data with Your Own Results

All comparative benchmark data between signal control paradigms (**Fixed-Time**, **Actuated**, **Adaptive**, and **Reinforcement Learning**) is housed in:

📂 `src/data/results.json`

### To substitute your empirical test or simulation runs:
1. Open `src/data/results.json`.
2. Locate the scenario (`low`, `medium`, `peak`, `unbalanced`) and controller paradigm you wish to update:
```json
"adaptive": {
  "name": "ATLAS Dynamic Adaptive (PCU-Weighted)",
  "isPlaceholder": false,
  "waitingTime": { "mean": 21.8, "std": 2.6, "ci95": 1.6 },
  "queueLength": { "mean": 4.4, "std": 0.7, "ci95": 0.4 },
  "throughput": { "mean": 2995, "std": 62, "ci95": 38 },
  "stops": { "mean": 0.68, "std": 0.07, "ci95": 0.04 },
  "co2Emission": { "mean": 141.2, "std": 8.5, "ci95": 5.3 }
}
```
3. Set `"isPlaceholder": false` once you replace values with real results.
4. Save the file. The **Analytics & Comparison** page immediately renders your new empirical means and 95% Confidence Interval error bars!

---

## 🔌 Swapping the Simulated Engine for FastAPI / MQTT Backend

ATLAS is architected with a decoupled data layer in:

📂 `src/services/dataService.js`

To connect to a live backend (e.g. FastAPI, RabbitMQ, Eclipse Mosquitto MQTT broker):
1. Change `BACKEND_TYPE = 'REST_MQTT'` in `src/services/dataService.js`.
2. In `dataService.js`, swap the simulation internal methods with your HTTP/WebSocket/MQTT client calls:
   - `getJunctions()` &rarr; `fetch('/api/v1/junctions')`
   - `subscribeSystemUpdates(cb)` &rarr; subscribe to MQTT topic `itms/network/telemetry` or a WebSocket stream.
   - `setControllerMode(jId, mode)` &rarr; `POST /api/v1/controller/{id}/mode`
   - `forcePhase(jId, phaseId)` &rarr; `POST /api/v1/controller/{id}/phase/force`
   - `triggerEmergencyPreemption()` &rarr; `POST /api/v1/emergency/preempt`
3. All UI pages and components consume `dataService` via `TrafficContext` and will run without requiring any UI code refactoring.

---

## 📁 Project Architecture

```
ATCMS1/
├── index.html                       # HTML5 entry with Inter + JetBrains Mono fonts & Leaflet styles
├── vite.config.js                   # Vite configuration
├── tailwind.config.js               # Control-room dark palette & animations
├── package.json
├── src/
│   ├── main.jsx                     # React root mount
│   ├── App.jsx                      # App shell with Header, Sidebar, Main Area, Footer
│   ├── index.css                    # Base styling, custom scrollbars, print stylesheet
│   ├── data/
│   │   ├── results.json             # Controller benchmark experiments (editable by user)
│   │   ├── pcuConfig.json           # IRC:106 Passenger Car Unit weights & signal bounds
│   │   ├── timeOfDayPlans.json      # TOD plans (Morning peak, off-peak, evening peak, night)
│   │   └── initialJunctions.js      # 12 fictional junction nodes with coordinates & arms
│   ├── simulation/
│   │   └── engine.js                # Poisson arrivals, 4-phase state machine, adaptive green logic
│   ├── services/
│   │   └── dataService.js           # Pluggable data layer abstraction
│   ├── context/
│   │   └── TrafficContext.jsx       # Global application state, IST clock, speed & role management
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.jsx           # SIMULATED badge, IST clock, speed (1x/5x/10x), demand scenario
│   │   │   ├── Sidebar.jsx          # Dense ITMS navigation & active alert chips
│   │   │   ├── Footer.jsx           # Research prototype notice & engine telemetry
│   │   │   └── StatCard.jsx         # KPI card with monospace readout & delta
│   │   ├── junction/
│   │   │   ├── IntersectionSvg.jsx  # Hero 4-way intersection SVG with moving vehicles & signals
│   │   │   ├── ApproachCard.jsx     # Approach PCU load, queue, countdown, and next phase
│   │   │   ├── GanttTimeline.jsx    # Gantt strip for 5 previous cycles + planned next cycle
│   │   │   ├── ControllerPanel.jsx  # Controller mode selector, confirmation modal, force phase
│   │   │   ├── SafetyInterlockPanel.jsx # NEMA TS-2 min green (10s), intergreen, conflict matrix
│   │   │   └── DetectorHealthPanel.jsx # Camera/loop health & fault dropout simulator
│   │   ├── vision/
│   │   │   ├── VisionDetectorCanvas.jsx # CCTV stream with YOLOv8 bounding boxes & ROI polygons
│   │   │   └── ModelInfoCard.jsx    # YOLOv8n + ByteTrack TensorRT edge inference specs
│   │   └── emergency/
│   │       └── EmergencyCorridorView.jsx # Ambulance green-wave progression & saved delay audit
│   └── pages/
│       ├── OverviewDashboard.jsx    # 12-node Leaflet map, 60m delay trend line, top 5 delays, fleet donut
│       ├── JunctionLiveView.jsx     # Hero view combining SVG intersection, Gantt & safety interlock
│       ├── VisionDetection.jsx      # Multi-camera edge video analytics & detection stream
│       ├── AnalyticsComparison.jsx  # Benchmarks from results.json with error bars & 24x7 heatmap
│       ├── AlertsIncidents.jsx      # Searchable, filterable incidents with Ack / Resolve actions
│       ├── EmergencyPriority.jsx    # Live ambulance corridor dispatch & route polyline
│       ├── SignalPlansSettings.jsx  # Time-of-day plan editor, phase sliders, role permissions & audit
│       └── Reports.jsx              # Certified performance audit report, CSV export & PDF print
```

---

## 🧠 Simulation Engine Mechanics

1. **Stochastic Vehicle Arrivals**:
   - Sampled from a Poisson distribution: $P(k \text{ arrivals}) = \frac{\lambda^k e^{-\lambda}}{k!}$.
   - Arrival intensity $\lambda$ dynamically scales with the selected scenario:
     - **Low**: $\lambda = 0.12$ veh/s
     - **Medium**: $\lambda = 0.28$ veh/s
     - **Peak**: $\lambda = 0.55$ veh/s
     - **Unbalanced**: Tidal flow ($\lambda_{\text{North-South}} \times 1.8$, $\lambda_{\text{East-West}} \times 0.4$)
2. **Vehicle Mix & PCU Conversion** (IRC:106 Standards):
   - Two-Wheeler / Scooter: 50% share (0.5 PCU)
   - Passenger Car: 25% share (1.0 PCU)
   - Auto-Rickshaw (3W): 10% share (0.8 PCU)
   - Transit Bus: 5% share (2.2 PCU)
   - Heavy Truck / LCV: 5% share (2.5 PCU)
   - Others: 5% share (0.8 PCU)
3. **Signal State Machine**:
   - 4-Phase rotation:
     - Phase 1: North-South Through & Left
     - Phase 2: North-South Protected Right Turn
     - Phase 3: East-West Through & Left
     - Phase 4: East-West Protected Right Turn
   - Transition Intervals: 3s Yellow + 2s All-Red clearance.
   - Bounded Dynamic Green: Minimum 10s, Maximum 60s with starvation prevention.
4. **Safety Interlock**:
   - Hardware minimum green enforcement (rejects manual premature truncations $<10$s).
   - Enforced intergreen clearance intervals (yellow + all-red) before any phase change.
   - Dual-ring conflict matrix isolation (prevents opposing green movements).

---

## 🛡️ Honesty & Compliance

- **Permanent Badge**: `SIMULATED DATA` badge in the control room top bar.
- **Permanent Footer**: `"Research prototype, not for real road use."`
- **Fictional Junctions**: Nodes are clearly fictional designations (`J-01 Central Square`, `J-02 Tech Corridor East`, `J-03 Metro Interchange`, etc.).
- **Experiment Results**: Placeholder numbers are tagged with `placeholder` in `results.json` until replaced with real physical or simulation trials.
