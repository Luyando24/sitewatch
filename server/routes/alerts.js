const express = require("express");
const db = require("../db");
const router = express.Router();

// GET /api/alerts — list alerts with filters
router.get("/", async (req, res) => {
  try {
    const { site_id, severity, type, active, limit = 100 } = req.query;

    let query = db
      .from("alerts")
      .select("*")
      .order("triggered_at", { ascending: false })
      .limit(parseInt(limit));

    if (site_id) query = query.eq("site_id", site_id);
    if (severity) query = query.eq("severity", severity);
    if (type) query = query.eq("type", type);
    if (active === "true") query = query.is("resolved_at", null);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/alerts/:id/acknowledge — acknowledge an alert
router.patch("/:id/acknowledge", async (req, res) => {
  try {
    const { id } = req.params;
    const { acknowledged_by = "operator" } = req.body;

    const { data, error } = await db
      .from("alerts")
      .update({ acknowledged: true, acknowledged_by, acknowledged_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/alerts/:id/resolve — resolve an alert
router.patch("/:id/resolve", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await db
      .from("alerts")
      .update({ resolved_at: new Date().toISOString(), acknowledged: true })
      .eq("id", id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/alerts/summary — portfolio-wide alert summary
router.get("/summary", async (req, res) => {
  try {
    const { data, error } = await db
      .from("alerts")
      .select("site_id, severity, acknowledged, resolved_at")
      .is("resolved_at", null);

    if (error) return res.status(500).json({ error: error.message });

    const active = (data || []).filter((a) => !a.acknowledged).length;
    const critical = (data || []).filter((a) => a.severity === "critical").length;
    const high = (data || []).filter((a) => a.severity === "high").length;

    res.json({ total_active: active, critical, high, medium: (data || []).length - critical - high });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
