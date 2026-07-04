## Project Brief

Build a working prototype of a **Smart Tower Monitoring & Infrastructure Intelligence Platform** for telecom tower/infrastructure sites. This is a hackathon prototype, so prioritize a working end-to-end demo over production hardening — but architect it so real hardware can be plugged in later with minimal rework.

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, Recharts for charts  
- **Backend:** Node.js \+ Express, with a WebSocket server (Socket.IO) for live updates  
- **Data layer:** Postgres with Supabase  
- **Sensor data:** an MQTT broker (Mosquitto, run locally or via Docker) sits between "sensors" and the backend — see Architecture below. This is the key design decision that makes it easy to swap in real hardware later.

## Architecture (important — read carefully)

Design this in three decoupled layers so simulated data can be replaced by real IoT devices without touching backend or frontend code:

1. **Simulator service** (`/simulator`) — a standalone Node.js script that acts as a stand-in for real hardware. It generates realistic time-series readings for every sensor type (see Data Model below) and **publishes them to MQTT topics** on a regular interval (e.g. every 5-30s, configurable), exactly as real sensors/gateways would.  
     
   - Topic naming convention: `sites/{siteId}/{category}/{metric}` e.g. `sites/LSK-001/power/grid_voltage`, `sites/LSK-001/fuel/diesel_level`, `sites/LSK-001/security/motion`  
   - Include realistic behavior: gradual diesel depletion with periodic refuels, occasional grid power outages that trigger generator failover, randomized but plausible temperature/humidity drift, occasional simulated anomalies (fuel theft dip, door sensor trigger, high temperature alert) so the alerting logic has something to catch.  
   - Simulate 4-6 sites so multi-site dashboards and comparisons are meaningful.

   

2. **Backend** (`/server`) — subscribes to all MQTT topics, persists readings to the database, runs alert/threshold logic, and exposes:  
     
   - REST API for historical data, site list, reports  
   - WebSocket channel that pushes live readings \+ alerts to the frontend  
   - The backend should know nothing about whether data came from the simulator or real hardware — it only speaks MQTT. This is what makes the later hardware swap just "point the backend's MQTT subscription at the real broker."

   

3. **Frontend** (`/client`) — React dashboard consuming the REST \+ WebSocket APIs.

## Data Model

Design tables/entities for:

- `sites` (id, name, location/coords, tenant list, tower type)  
- `readings` (site\_id, category, metric, value, unit, timestamp) — generic time-series table covering all sensor types below  
- `alerts` (site\_id, type, severity, message, triggered\_at, resolved\_at)  
- `tenants` (site\_id, tenant\_name, equipment\_type, onboarded\_date) — for tenancy ratio tracking  
- `sla_targets` (site\_id, target\_uptime\_pct)

## Feature Scope — cover all 7 areas at basic depth

### 1\. Infrastructure Monitoring

- Site list view with live status (up/down/degraded) per site  
- Real-time uptime indicator per site  
- Historical uptime chart (daily/weekly)  
- Simple SLA compliance dashboard (actual uptime vs target %)

### 2\. Power Monitoring

- Live power source indicator per site: Grid / Solar / Generator  
- Visual "power source switching" timeline (when did it fail over and why)  
- Simple utilization report: % time on each power source (daily/weekly/monthly view — quarterly/yearly can just aggregate the same query)

### 3\. Fuel & Generator Intelligence

- Live diesel level gauge per site  
- Fuel consumption chart over time  
- Generator runtime tracker (hours run, cumulative)  
- Low-fuel alert (threshold-based, e.g. \<20%)  
- Basic fuel theft anomaly detection: flag a reading if diesel level drops faster than the generator's expected burn rate over a short window

### 4\. Security Monitoring

- Mock CCTV integration: just show placeholder camera feed tiles per site (static image or "LIVE" badge is fine — don't build real video streaming)  
- Intrusion/motion event log with timestamps  
- Alarm management: list of active/acknowledged alarms, ability to acknowledge from the UI  
- Unauthorized access alert feed

### 5\. Environmental & Sensor Monitoring

- Temperature/humidity live charts per site  
- Smoke/fire alert (threshold-triggered)  
- Door sensor status (open/closed) with event history  
- Motion sensor status  
- Equipment health alert feed (generic "equipment reporting fault" simulated event)

### 6\. Commercial Intelligence

- Tenancy ratio per site (tenants vs capacity)  
- Number of clients per tower/site, sortable table  
- Site utilization analytics (which sites are under/over capacity)  
- Simple "revenue opportunity" flag: sites below a configurable tenancy threshold get flagged as expansion opportunities

### 7\. Reporting & Analytics

- Executive summary dashboard: portfolio-wide KPIs (overall uptime %, total sites, active alerts, average tenancy ratio)  
- Exportable/printable SLA report (even a simple "generate PDF/CSV" button is fine)  
- Historical analytics view with date range filters  
- Basic predictive maintenance indicator: flag equipment/generators approaching runtime thresholds that typically require servicing (simple rule-based, not ML, for the prototype)

## Build Order (suggested)

1. Scaffold repo structure (`/simulator`, `/server`, `/client`), set up MQTT broker (Docker Compose with Mosquitto is fastest) or seed data in supabase  
2. Build simulator publishing realistic data for all metric types across multiple sites  
3. Build backend: MQTT subscriber → DB writer, then REST endpoints, then WebSocket push  
4. Build frontend shell: site list/nav, then build each of the 7 feature dashboards one at a time  
5. Wire up alert logic (thresholds) and the alert feed/notification UI  
6. Polish: executive dashboard as the "home" landing page since it best demonstrates the "unified intelligence" pitch

## Deliverable Notes for the Demo

- Seed at least 4 sites with a different incidents (e.g. mid-generator-failover, fuel dropping etc) when the app starts, so the demo has something dramatic to show immediately without waiting for random events.  
- A page where a logged in admin can login to visually modify sensor readings for demo purposes  
- Keep README instructions to a true "npm install && docker compose up" level of simplicity given hackathon judging time constraints.  
- Authentication/multi-tenant user management

## Explicitly Out of Scope (for this prototype)

- Real video streaming for CCTV  
- Real ML models for predictive maintenance (rule-based thresholds only)  
- Production-grade security hardening on the MQTT broker

