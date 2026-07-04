const express = require("express");
const db = require("../db");
const router = express.Router();

// GET /api/tenants — all tenants with optional site filter
router.get("/", async (req, res) => {
  try {
    const { site_id } = req.query;

    let query = db.from("tenants").select("*, sites(name, capacity)").eq("active", true);
    if (site_id) query = query.eq("site_id", site_id);

    const { data, error } = await query.order("site_id");
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tenants/utilization — tenancy ratio per site
router.get("/utilization", async (req, res) => {
  try {
    const { data: sites } = await db.from("sites").select("id, name, capacity");
    const { data: tenants } = await db.from("tenants").select("site_id").eq("active", true);

    const countBySite = {};
    (tenants || []).forEach((t) => {
      countBySite[t.site_id] = (countBySite[t.site_id] || 0) + 1;
    });

    const EXPANSION_THRESHOLD = 0.5; // below 50% = expansion opportunity

    const result = (sites || []).map((s) => {
      const count = countBySite[s.id] || 0;
      const ratio = s.capacity > 0 ? +(count / s.capacity).toFixed(2) : 0;
      return {
        site_id: s.id,
        site_name: s.name,
        capacity: s.capacity,
        tenant_count: count,
        utilization_pct: +(ratio * 100).toFixed(1),
        expansion_opportunity: ratio < EXPANSION_THRESHOLD,
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tenants/revenue — revenue per site
router.get("/revenue", async (req, res) => {
  try {
    const { data, error } = await db
      .from("tenants")
      .select("site_id, monthly_revenue, sites(name)")
      .eq("active", true);

    if (error) return res.status(500).json({ error: error.message });

    const bySite = {};
    (data || []).forEach((t) => {
      if (!bySite[t.site_id]) {
        bySite[t.site_id] = { site_id: t.site_id, site_name: t.sites?.name, monthly_revenue: 0 };
      }
      bySite[t.site_id].monthly_revenue += t.monthly_revenue;
    });

    res.json(Object.values(bySite));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
