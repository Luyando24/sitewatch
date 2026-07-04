const express = require("express");
const db = require("../db");
const { checkThresholds } = require("../alerts");
const router = express.Router();

// Memory store for previous diesel levels to detect theft anomalies
const prevDiesel = {};
const THEFT_DROP_THRESHOLD = 25;

// GET /api/readings — historical readings with filters
router.get("/", async (req, res) => {
  try {
    const { site_id, category, metric, from, to, limit = 500 } = req.query;

    let query = db.from("readings").select("*").order("timestamp", { ascending: false }).limit(parseInt(limit));

    if (site_id) query = query.eq("site_id", site_id);
    if (category) query = query.eq("category", category);
    if (metric) query = query.eq("metric", metric);
    if (from) query = query.gte("timestamp", from);
    if (to) query = query.lte("timestamp", to);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/readings/latest — latest reading per metric for a site
router.get("/latest", async (req, res) => {
  try {
    const { site_id } = req.query;
    if (!site_id) return res.status(400).json({ error: "site_id required" });

    const { data, error } = await db
      .from("readings")
      .select("category, metric, value, unit, timestamp")
      .eq("site_id", site_id)
      .order("timestamp", { ascending: false })
      .limit(300);

    if (error) return res.status(500).json({ error: error.message });

    const latest = {};
    (data || []).forEach((r) => {
      const k = `${r.category}:${r.metric}`;
      if (!latest[k]) latest[k] = r;
    });

    res.json(Object.values(latest));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/readings/power-source-timeline — power switching history
router.get("/power-source-timeline", async (req, res) => {
  try {
    const { site_id, from, to } = req.query;
    if (!site_id) return res.status(400).json({ error: "site_id required" });

    let query = db
      .from("readings")
      .select("value, unit, timestamp")
      .eq("site_id", site_id)
      .eq("category", "power")
      .eq("metric", "power_source")
      .order("timestamp", { ascending: true });

    if (from) query = query.gte("timestamp", from);
    if (to) query = query.lte("timestamp", to);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    const sourceMap = { 1: "Grid", 2: "Solar", 3: "Generator" };
    const timeline = [];
    let prev = null;
    (data || []).forEach((r) => {
      const label = sourceMap[r.value] || "Unknown";
      if (label !== prev) {
        timeline.push({ source: label, timestamp: r.timestamp, value: r.value });
        prev = label;
      }
    });

    res.json(timeline);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/readings/power-utilization — % time on each source
router.get("/power-utilization", async (req, res) => {
  try {
    const { site_id, period = "weekly" } = req.query;
    if (!site_id) return res.status(400).json({ error: "site_id required" });

    const daysMap = { daily: 1, weekly: 7, monthly: 30, quarterly: 90, yearly: 365 };
    const days = daysMap[period] || 7;
    const since = new Date(Date.now() - days * 86400000).toISOString();

    const { data, error } = await db
      .from("readings")
      .select("value")
      .eq("site_id", site_id)
      .eq("category", "power")
      .eq("metric", "power_source")
      .gte("timestamp", since);

    if (error) return res.status(500).json({ error: error.message });

    const counts = { Grid: 0, Solar: 0, Generator: 0 };
    const sourceMap = { 1: "Grid", 2: "Solar", 3: "Generator" };
    (data || []).forEach((r) => {
      const s = sourceMap[r.value];
      if (s) counts[s]++;
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    const result = Object.entries(counts).map(([source, count]) => ({
      source, count, pct: +((count / total) * 100).toFixed(1),
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/readings/submit — Submit simulated sensor readings
router.post("/submit", async (req, res) => {
  try {
    const { siteId, category, metric, value, unit, timestamp } = req.body;
    if (!siteId || !category || !metric || value === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const io = req.app.get("io");

    // ── Fuel theft detection ──────────────────────────────────────────────────
    if (category === "fuel" && metric === "diesel_level") {
      const prev = prevDiesel[siteId];
      if (prev !== undefined) {
        const drop = prev - value;
        if (drop > THEFT_DROP_THRESHOLD) {
          // Persist a theft anomaly flag reading
          await db.from("readings").insert([{
            site_id: siteId,
            category: "fuel",
            metric: "theft_anomaly",
            value: 1,
            unit: "bool",
            timestamp: timestamp || new Date().toISOString(),
          }]);
          await checkThresholds(io, siteId, "fuel", "theft_anomaly", 1);
        }
      }
      prevDiesel[siteId] = value;
    }

    // ── Persist reading ───────────────────────────────────────────────────────
    const { error } = await db.from("readings").insert([{
      site_id: siteId,
      category,
      metric,
      value: typeof value === "number" ? value : 0,
      unit: unit || null,
      timestamp: timestamp || new Date().toISOString(),
    }]);

    if (error) {
      // Return 200/ignore if site references don't exist yet (prevents simulator crash during seed delay)
      return res.status(200).json({ success: false, info: "DB insert skipped", message: error.message });
    }

    // ── Run alert logic ───────────────────────────────────────────────────────
    await checkThresholds(io, siteId, category, metric, value);

    // ── Push live reading to WebSocket clients ────────────────────────────────
    if (io) {
      io.emit("reading", { siteId, category, metric, value, unit, timestamp });
    }

    // ── Update site status ────────────────────────────────────────────────────
    if (category === "power" && metric === "power_source") {
      const status = value === 1 ? "up" : value === 2 ? "up" : "degraded";
      await db.from("sites").update({ status }).eq("id", siteId);
      if (io) {
        io.emit("site_status", { siteId, status });
      }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
