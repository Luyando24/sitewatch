const express = require("express");
const db = require("../db");
const router = express.Router();

// GET /api/sites — list all sites with latest readings
router.get("/", async (req, res) => {
  try {
    const { data: sites, error } = await db.from("sites").select("*").order("id");
    if (error) return res.status(500).json({ error: error.message });

    // Get active alert counts per site
    const { data: alertCounts } = await db
      .from("alerts")
      .select("site_id")
      .is("resolved_at", null)
      .eq("acknowledged", false);

    const counts = {};
    (alertCounts || []).forEach((a) => {
      counts[a.site_id] = (counts[a.site_id] || 0) + 1;
    });

    const result = sites.map((s) => ({
      ...s,
      active_alerts: counts[s.id] || 0,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/sites/:id — single site with latest readings snapshot
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data: site, error } = await db.from("sites").select("*").eq("id", id).single();
    if (error || !site) return res.status(404).json({ error: "Site not found" });

    // Latest reading per metric
    const { data: readings } = await db
      .from("readings")
      .select("category, metric, value, unit, timestamp")
      .eq("site_id", id)
      .order("timestamp", { ascending: false })
      .limit(200);

    // Build snapshot object: latest value per category/metric
    const snapshot = {};
    (readings || []).forEach((r) => {
      const catKey = r.category;
      if (!snapshot[catKey]) snapshot[catKey] = {};
      if (!snapshot[catKey][r.metric]) {
        snapshot[catKey][r.metric] = { value: r.value, unit: r.unit, timestamp: r.timestamp };
      }
    });

    const { data: slaTarget } = await db
      .from("sla_targets")
      .select("target_uptime_pct")
      .eq("site_id", id)
      .single();

    res.json({ ...site, snapshot, sla_target: slaTarget?.target_uptime_pct || 99.5 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/sites/:id/uptime — uptime history
router.get("/:id/uptime", async (req, res) => {
  try {
    const { id } = req.params;
    const { days = 7 } = req.query;
    const since = new Date(Date.now() - days * 86400000).toISOString();

    const { data } = await db
      .from("readings")
      .select("value, timestamp")
      .eq("site_id", id)
      .eq("category", "power")
      .eq("metric", "power_source")
      .gte("timestamp", since)
      .order("timestamp", { ascending: true });

    // Calculate uptime % per day
    const byDay = {};
    (data || []).forEach((r) => {
      const day = r.timestamp.slice(0, 10);
      if (!byDay[day]) byDay[day] = { up: 0, total: 0 };
      byDay[day].total++;
      if (r.value > 0) byDay[day].up++;
    });

    const history = Object.entries(byDay).map(([date, d]) => ({
      date,
      uptime: d.total > 0 ? +((d.up / d.total) * 100).toFixed(2) : 100,
    }));

    // Overall uptime
    const total = (data || []).length;
    const up = (data || []).filter((r) => r.value > 0).length;
    const overall = total > 0 ? +((up / total) * 100).toFixed(2) : 100;

    const { data: sla } = await db
      .from("sla_targets")
      .select("target_uptime_pct")
      .eq("site_id", id)
      .single();

    res.json({ history, overall, sla_target: sla?.target_uptime_pct || 99.5, compliant: overall >= (sla?.target_uptime_pct || 99.5) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
