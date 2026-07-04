/**
 * Alert threshold logic — runs every time a reading is persisted.
 * Emits alerts via the io socket for immediate frontend notification.
 */
const db = require("./db");

// Track recently fired alerts to avoid flooding
const recentAlerts = new Map(); // key: `${siteId}:${type}` → last timestamp

async function checkThresholds(io, siteId, category, metric, value) {
  const key = `${siteId}:${category}:${metric}`;
  const now = Date.now();
  const cooldown = 5 * 60 * 1000; // 5-minute cooldown per alert type

  if (recentAlerts.has(key) && now - recentAlerts.get(key) < cooldown) return;

  let alert = null;

  // ── Power ──────────────────────────────────────────────────────────────────
  if (category === "power" && metric === "grid_voltage" && value === 0) {
    // Grid voltage is 0 → outage handled by power_source, skip
  }

  // ── Fuel ───────────────────────────────────────────────────────────────────
  if (category === "fuel" && metric === "diesel_level") {
    if (value < 10) {
      alert = {
        site_id: siteId, type: "low_fuel", severity: "critical",
        message: `Diesel level critically low at ${value}% — immediate refuel required`,
      };
    } else if (value < 20) {
      alert = {
        site_id: siteId, type: "low_fuel", severity: "high",
        message: `Diesel level low at ${value}% — schedule refuel`,
      };
    }
  }

  // Fuel theft detection: rapid drop flag (set from mqtt.js)
  if (category === "fuel" && metric === "theft_anomaly" && value === 1) {
    alert = {
      site_id: siteId, type: "fuel_theft", severity: "critical",
      message: `Fuel theft anomaly detected — diesel dropped faster than expected burn rate`,
    };
  }

  // ── Environment ────────────────────────────────────────────────────────────
  if (category === "environment" && metric === "temperature") {
    if (value > 50) {
      alert = {
        site_id: siteId, type: "high_temperature", severity: "critical",
        message: `Critical temperature ${value}°C — equipment at risk`,
      };
    } else if (value > 45) {
      alert = {
        site_id: siteId, type: "high_temperature", severity: "high",
        message: `High temperature ${value}°C at site`,
      };
    }
  }

  if (category === "environment" && metric === "smoke" && value > 40) {
    alert = {
      site_id: siteId, type: "fire_smoke", severity: "critical",
      message: `Smoke/fire alert — smoke level ${value} ppm`,
    };
  }

  if (category === "environment" && metric === "equipment_fault" && value === 1) {
    alert = {
      site_id: siteId, type: "equipment_fault", severity: "medium",
      message: `Equipment fault reported at site`,
    };
  }

  // ── Security ───────────────────────────────────────────────────────────────
  if (category === "security" && metric === "intrusion" && value === 1) {
    alert = {
      site_id: siteId, type: "intrusion", severity: "high",
      message: `Intrusion/unauthorized access detected`,
    };
  }

  // ── Generator runtime (predictive maintenance) ─────────────────────────────
  if (category === "fuel" && metric === "generator_runtime" && value > 200) {
    alert = {
      site_id: siteId, type: "maintenance_due", severity: "medium",
      message: `Generator runtime ${value.toFixed(0)}h — service recommended (threshold: 200h)`,
    };
  }

  if (!alert) return;

  recentAlerts.set(key, now);

  try {
    const { data, error } = await db
      .from("alerts")
      .insert([alert])
      .select()
      .single();

    if (error) {
      console.error("Alert insert error:", error.message);
      return;
    }

    console.log(`🚨 [${siteId}] ${alert.severity.toUpperCase()} alert: ${alert.message}`);
    if (io) {
      io.emit("alert", data);
    }
  } catch (err) {
    console.error("Alert error:", err.message);
  }
}

module.exports = { checkThresholds };
