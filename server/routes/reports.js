const express = require("express");
const db = require("../db");
const router = express.Router();

// GET /api/reports/sla — SLA compliance report
router.get("/sla", async (req, res) => {
  try {
    const { from, to } = req.query;
    const since = from || new Date(Date.now() - 30 * 86400000).toISOString();
    const until = to || new Date().toISOString();

    const { data: sites } = await db.from("sites").select("id, name");
    const { data: targets } = await db.from("sla_targets").select("*");

    const targetMap = {};
    (targets || []).forEach((t) => (targetMap[t.site_id] = t.target_uptime_pct));

    const results = await Promise.all(
      (sites || []).map(async (site) => {
        const { data: readings } = await db
          .from("readings")
          .select("value")
          .eq("site_id", site.id)
          .eq("category", "power")
          .eq("metric", "power_source")
          .gte("timestamp", since)
          .lte("timestamp", until);

        const total = (readings || []).length;
        const up = (readings || []).filter((r) => r.value > 0).length;
        const uptime = total > 0 ? +((up / total) * 100).toFixed(2) : 100;
        const target = targetMap[site.id] || 99.5;
        const compliant = uptime >= target;

        return {
          site_id: site.id,
          site_name: site.name,
          uptime_pct: uptime,
          target_pct: target,
          compliant,
          gap: +(uptime - target).toFixed(2),
          total_readings: total,
        };
      })
    );

    res.json({ from: since, to: until, sites: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/sla/csv — export SLA as CSV
router.get("/sla/csv", async (req, res) => {
  try {
    const { from, to } = req.query;
    const since = from || new Date(Date.now() - 30 * 86400000).toISOString();
    const until = to || new Date().toISOString();

    const { data: sites } = await db.from("sites").select("id, name");
    const { data: targets } = await db.from("sla_targets").select("*");
    const targetMap = {};
    (targets || []).forEach((t) => (targetMap[t.site_id] = t.target_uptime_pct));

    const rows = await Promise.all(
      (sites || []).map(async (site) => {
        const { data: readings } = await db
          .from("readings")
          .select("value")
          .eq("site_id", site.id)
          .eq("category", "power")
          .eq("metric", "power_source")
          .gte("timestamp", since)
          .lte("timestamp", until);

        const total = (readings || []).length;
        const up = (readings || []).filter((r) => r.value > 0).length;
        const uptime = total > 0 ? +((up / total) * 100).toFixed(2) : 100;
        const target = targetMap[site.id] || 99.5;
        return `${site.id},${site.name},${uptime},${target},${uptime >= target ? "COMPLIANT" : "NON-COMPLIANT"},${(uptime - target).toFixed(2)}`;
      })
    );

    const csv = [
      "Site ID,Site Name,Uptime %,Target %,Status,Gap %",
      ...rows,
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=sla_report_${Date.now()}.csv`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/executive — portfolio KPIs
router.get("/executive", async (req, res) => {
  try {
    const { data: sites } = await db.from("sites").select("id, name, status");
    const { data: alerts } = await db.from("alerts").select("severity").is("resolved_at", null).eq("acknowledged", false);
    const { data: targets } = await db.from("sla_targets").select("*");
    const { data: tenants } = await db.from("tenants").select("site_id, monthly_revenue").eq("active", true);

    const targetMap = {};
    (targets || []).forEach((t) => (targetMap[t.site_id] = t.target_uptime_pct));

    const upCount = (sites || []).filter((s) => s.status === "up").length;
    const downCount = (sites || []).filter((s) => s.status === "down").length;
    const degradedCount = (sites || []).filter((s) => s.status === "degraded").length;

    const totalRevenue = (tenants || []).reduce((sum, t) => sum + (t.monthly_revenue || 0), 0);
    const criticalAlerts = (alerts || []).filter((a) => a.severity === "critical").length;

    res.json({
      total_sites: (sites || []).length,
      sites_up: upCount,
      sites_down: downCount,
      sites_degraded: degradedCount,
      overall_uptime_pct: +((upCount / Math.max((sites || []).length, 1)) * 100).toFixed(1),
      active_alerts: (alerts || []).length,
      critical_alerts: criticalAlerts,
      total_tenants: (tenants || []).length,
      monthly_revenue: totalRevenue,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/predictive — maintenance flags
router.get("/predictive", async (req, res) => {
  try {
    const { data: sites } = await db.from("sites").select("id, name");

    const flags = await Promise.all(
      (sites || []).map(async (site) => {
        const { data } = await db
          .from("readings")
          .select("value, timestamp")
          .eq("site_id", site.id)
          .eq("category", "fuel")
          .eq("metric", "generator_runtime")
          .order("timestamp", { ascending: false })
          .limit(1);

        const runtime = data?.[0]?.value || 0;
        const needsService = runtime > 200;
        const urgent = runtime > 350;

        return {
          site_id: site.id,
          site_name: site.name,
          generator_runtime_h: +runtime.toFixed(1),
          needs_service: needsService,
          urgent,
          message: urgent
            ? `⚠️ URGENT: Generator runtime ${runtime.toFixed(0)}h — overdue for service`
            : needsService
            ? `🔧 Generator runtime ${runtime.toFixed(0)}h — service recommended`
            : null,
        };
      })
    );

    res.json(flags.filter((f) => f.needs_service));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
