# SiteWatch 360 — Build Walkthrough (Docker-Free / HTTP Pivot)

## ✅ Architecture Update

We removed all Docker and MQTT dependencies. The simulator now posts sensor data directly to the backend over HTTP.

```
[Simulator] ── HTTP POST ──> [Backend (Express + Socket.IO)] ── WebSocket ──> [Frontend (React)]
                                        ↕
                                   [Supabase]
```

## ✅ Build Status

| Layer | Status |
|-------|--------|
| Server (`/server`) | ✅ 105 packages, 0 vulnerabilities (pruned `mqtt`) |
| Simulator (`/simulator`) | ✅ 2 packages, 0 vulnerabilities (pruned `mqtt`, uses native `fetch`) |
| Client (`/client`) | ✅ 655 modules, 0 errors, clean Vite build |

---

## Project Structure

```
smarttower/
├── package.json                ← Contains start script using concurrently
├── .env.example                ← Copy to .env, add Supabase credentials
├── README.md
├── supabase/migrations/
│   └── 001_initial_schema.sql  ← Run in Supabase SQL Editor
├── simulator/
│   ├── package.json
│   └── index.js                ← Publishes time-series via HTTP POST every 8s
├── server/
│   ├── index.js                ← Express + Socket.io entry
│   ├── seed.js                 ← Demo data seeder
│   ├── db.js                   ← Supabase client
│   └── routes/
│       ├── sites.js, readings.js (POST /submit), alerts.js
│       ├── tenants.js, reports.js, admin.js
└── client/
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx             ← Router with auth guards
        ├── context/AuthContext.jsx
        ├── hooks/useSocket.js  ← Socket.io live updates
        ├── lib/api.js          ← REST API client
        └── pages/
            ├── Landing.jsx     ← Marketing landing page (/)
            ├── Login.jsx       ← Auth page
            ├── Dashboard.jsx   ← Executive overview
            ├── Sites.jsx       ← Site list
            ├── SiteDetail.jsx  ← Per-site details
            ├── Power.jsx       ← Power monitoring
            ├── Fuel.jsx        ← Fuel & generator intelligence
            └── AdminDemo.jsx   ← Admin sensor override panel
```

---

## How to Run

### Prerequisites
- Node.js 18+
- A Supabase project (free tier works)

```powershell
# 1. Setup environment
Copy-Item .env.example .env
# Edit .env and paste your Supabase URL + service_role key

# 2. Run DB migration
# Open supabase/migrations/001_initial_schema.sql in Supabase SQL Editor → Run

# 3. Seed demo data
npm run seed

# 4. Start all services concurrently (one command):
npm run dev                      # starts server, simulator, and client
```

Open **http://localhost:5173**

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@sitewatch.io` | any |
| **Operator** | `operator@sitewatch.io` | any |
