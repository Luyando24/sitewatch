# SiteWatch 360

**Smart Tower Monitoring & Infrastructure Intelligence Platform**

Real-time visibility, alerting, and analytics across telecom tower sites — power, fuel, security, environmental sensors, and commercial intelligence in one unified dashboard.

---

## Quick Start

### Prerequisites
- Node.js 18+
- A Supabase project (free tier works)

### 1. Clone & configure

```powershell
# Copy env file and fill in your Supabase credentials
Copy-Item .env.example .env
```

Edit `.env`:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
```

### 2. Run the DB migration

Copy the contents of `supabase/migrations/001_initial_schema.sql` and run it in your Supabase SQL Editor (Dashboard → SQL Editor → New query).

### 3. Install all dependencies

```powershell
npm install              # installs root (concurrently)
npm run install:all      # installs server, simulator, and client
```

### 4. Seed demo data

```powershell
npm run seed
```

### 5. Start everything (single command)

```powershell
npm run dev
```

This starts **server + simulator + client** concurrently with color-coded output.

Open **http://localhost:5173**

> **Or start individually** (three separate PowerShell tabs):
> ```powershell
> # Tab 1
> cd server; npm run dev
>
> # Tab 2
> cd simulator; npm start
>
> # Tab 3
> cd client; npm run dev
> ```

---

## Demo Credentials

| Role     | Email                    | Password    |
|----------|--------------------------|-------------|
| Admin    | `admin@sitewatch.io`     | any password |
| Operator | `operator@sitewatch.io`  | any password |

> Admin users can access the **Admin Demo Panel** to inject sensor readings and trigger live scenarios.

---

## Demo Scenarios (seeded)

| Site     | Scenario                          |
|----------|-----------------------------------|
| LSK-001  | Normal grid operation             |
| LSK-002  | Mid generator failover (grid down 40min ago) |
| LSK-003  | Fuel theft anomaly (25min ago)    |
| LSK-004  | High temperature alert (52°C)     |
| LSK-005  | Grid outage + critically low fuel |

---

## Architecture

```
[Simulator] ── HTTP POST ──> [Backend (Express + Socket.IO)] ── WebSocket ──> [Frontend (React)]
                                        ↕
                                   [Supabase]
```

- **`/simulator`** — Sends realistic time-series readings to the backend via HTTP POST requests
- **`/server`** — Receives readings, persists to Supabase, runs alert logic, and pushes live updates to the frontend via Socket.IO
- **`/client`** — React (Vite + Tailwind) dashboard with 8 pages

---

## Feature Coverage

| # | Feature Area               | Coverage |
|---|---------------------------|----------|
| 1 | Infrastructure Monitoring  | ✅ Site list, uptime, SLA |
| 2 | Power Monitoring           | ✅ Live source, timeline, utilization |
| 3 | Fuel & Generator           | ✅ Gauges, consumption chart, theft detection |
| 4 | Security Monitoring        | ✅ CCTV tiles, intrusion log, alarm management |
| 5 | Environmental Sensors      | ✅ Temp/humidity charts, smoke, door, motion |
| 6 | Commercial Intelligence    | ✅ Tenancy ratios, revenue, expansion flags |
| 7 | Reporting & Analytics      | ✅ SLA reports, CSV export, predictive maintenance |

---

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Recharts, React Router
- **Backend:** Node.js, Express, Socket.IO
- **Database:** Supabase (PostgreSQL)
#   s i t e w a t c h  