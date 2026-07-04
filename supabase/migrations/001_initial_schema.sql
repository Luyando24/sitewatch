-- SiteWatch 360 — Initial Schema
-- Run this in your Supabase SQL editor or via supabase db push

-- ─── Sites ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sites (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  tower_type TEXT DEFAULT 'macro',
  capacity INTEGER DEFAULT 4,
  status TEXT DEFAULT 'up' CHECK (status IN ('up','down','degraded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Readings ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS readings (
  id BIGSERIAL PRIMARY KEY,
  site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  metric TEXT NOT NULL,
  value DOUBLE PRECISION NOT NULL,
  unit TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS readings_site_id_idx ON readings(site_id);
CREATE INDEX IF NOT EXISTS readings_timestamp_idx ON readings(timestamp DESC);
CREATE INDEX IF NOT EXISTS readings_category_metric_idx ON readings(category, metric);

-- ─── Alerts ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
  id BIGSERIAL PRIMARY KEY,
  site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low','medium','high','critical')),
  message TEXT NOT NULL,
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by TEXT,
  acknowledged_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS alerts_site_id_idx ON alerts(site_id);
CREATE INDEX IF NOT EXISTS alerts_triggered_at_idx ON alerts(triggered_at DESC);

-- ─── Tenants ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tenants (
  id BIGSERIAL PRIMARY KEY,
  site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  tenant_name TEXT NOT NULL,
  equipment_type TEXT,
  onboarded_date DATE DEFAULT CURRENT_DATE,
  monthly_revenue DOUBLE PRECISION DEFAULT 0,
  active BOOLEAN DEFAULT TRUE
);
CREATE INDEX IF NOT EXISTS tenants_site_id_idx ON tenants(site_id);

-- ─── SLA Targets ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sla_targets (
  id BIGSERIAL PRIMARY KEY,
  site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE UNIQUE,
  target_uptime_pct DOUBLE PRECISION DEFAULT 99.5,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Seed Sites ──────────────────────────────────────────────────────────────
INSERT INTO sites (id, name, latitude, longitude, tower_type, capacity, status) VALUES
  ('LSK-001', 'Lusaka Central', -15.4167, 28.2833, 'macro', 6, 'up'),
  ('LSK-002', 'Kalingalinga Hub', -15.4180, 28.3200, 'micro', 4, 'degraded'),
  ('LSK-003', 'Kabulonga Heights', -15.4160, 28.3500, 'macro', 5, 'up'),
  ('LSK-004', 'Matero East Grid', -15.3800, 28.2500, 'macro', 4, 'up'),
  ('LSK-005', 'Chilungululu Relay', -15.4500, 28.3000, 'macro', 6, 'down')
ON CONFLICT (id) DO NOTHING;

-- ─── Seed SLA Targets ────────────────────────────────────────────────────────
INSERT INTO sla_targets (site_id, target_uptime_pct) VALUES
  ('LSK-001', 99.9),
  ('LSK-002', 99.5),
  ('LSK-003', 99.5),
  ('LSK-004', 99.0),
  ('LSK-005', 99.9)
ON CONFLICT (site_id) DO NOTHING;

-- ─── Seed Tenants ────────────────────────────────────────────────────────────
INSERT INTO tenants (site_id, tenant_name, equipment_type, monthly_revenue) VALUES
  ('LSK-001', 'Safaricom PLC',       'LTE 4G',   85000),
  ('LSK-001', 'Airtel Kenya',        'GSM 2G',   42000),
  ('LSK-001', 'Telkom Kenya',        'LTE 4G',   38000),
  ('LSK-001', 'Liquid Telecom',      'Microwave', 25000),
  ('LSK-002', 'Safaricom PLC',       'LTE 4G',   85000),
  ('LSK-002', 'Airtel Kenya',        'GSM 3G',   42000),
  ('LSK-003', 'Safaricom PLC',       '5G NR',   120000),
  ('LSK-003', 'Airtel Kenya',        'LTE 4G',   85000),
  ('LSK-003', 'Liquid Telecom',      'Microwave', 25000),
  ('LSK-004', 'Safaricom PLC',       'LTE 4G',   85000),
  ('LSK-004', 'Airtel Kenya',        'LTE 4G',   85000),
  ('LSK-004', 'Telkom Kenya',        'GSM 2G',   28000),
  ('LSK-005', 'Safaricom PLC',       'LTE 4G',   85000)
ON CONFLICT DO NOTHING;
