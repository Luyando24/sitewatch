/**
 * Admin Demo Panel API (Direct DB / Socket Version)
 * Allows admin users to manually inject sensor readings for demo purposes.
 */
const express = require("express");
const db = require("../db");
const { checkThresholds } = require("../alerts");
const router = express.Router();

async function handleSingleInjection(io, siteId, category, metric, value) {
  const timestamp = new Date().toISOString();
  
  // Persist reading
  await db.from("readings").insert([{
    site_id: siteId,
    category,
    metric,
    value: parseFloat(value),
    unit: "manual",
    timestamp,
  }]);

  // Run threshold checks
  await checkThresholds(io, siteId, category, metric, parseFloat(value));

  // Push live reading to WebSocket clients
  if (io) {
    io.emit("reading", { siteId, category, metric, value: parseFloat(value), unit: "manual", timestamp });
  }

  // Update site status
  if (category === "power" && metric === "power_source") {
    const status = value === 1 ? "up" : value === 2 ? "up" : "degraded";
    await db.from("sites").update({ status }).eq("id", siteId);
    if (io) io.emit("site_status", { siteId, status });
  }
}

// POST /api/admin/inject — inject a custom sensor reading
router.post("/inject", async (req, res) => {
  try {
    const { site_id, category, metric, value } = req.body;

    if (!site_id || !category || !metric || value === undefined) {
      return res.status(400).json({ error: "site_id, category, metric, and value are required" });
    }

    const io = req.app.get("io");
    await handleSingleInjection(io, site_id, category, metric, value);

    res.json({ success: true, site_id, category, metric, value });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/scenario — trigger a pre-built demo scenario
router.post("/scenario", async (req, res) => {
  try {
    const { scenario, site_id } = req.body;
    const io = req.app.get("io");

    const scenarios = {
      grid_outage: [
        { category: "power", metric: "power_source", value: 3 },
        { category: "power", metric: "grid_voltage", value: 0 },
      ],
      grid_restore: [
        { category: "power", metric: "power_source", value: 1 },
        { category: "power", metric: "grid_voltage", value: 230 },
      ],
      low_fuel: [
        { category: "fuel", metric: "diesel_level", value: 8 },
      ],
      fuel_theft: [
        { category: "fuel", metric: "diesel_level", value: 15 },
        { category: "fuel", metric: "theft_anomaly", value: 1 },
      ],
      high_temp: [
        { category: "environment", metric: "temperature", value: 52 },
        { category: "environment", metric: "smoke", value: 65 },
      ],
      intrusion: [
        { category: "security", metric: "intrusion", value: 1 },
        { category: "security", metric: "motion", value: 1 },
        { category: "environment", metric: "door_open", value: 1 },
      ],
      refuel: [
        { category: "fuel", metric: "diesel_level", value: 92 },
      ],
    };

    const steps = scenarios[scenario];
    if (!steps) return res.status(400).json({ error: `Unknown scenario: ${scenario}` });

    const siteId = site_id || "LSK-001";

    for (const step of steps) {
      await handleSingleInjection(io, siteId, step.category, step.metric, step.value);
    }

    res.json({ success: true, scenario, site_id: siteId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
