/**
 * SiteWatch 360 — Demo Seed Script
 * Injects dramatic demo readings and alerts so the dashboard has content immediately.
 * Run: npm run seed (from /server directory)
 */
require("dotenv").config({ path: "../.env" });
const db = require("./db");

const SITES = ["LSK-001", "LSK-002", "LSK-003", "LSK-004", "LSK-005"];

function ts(minutesAgo) {
  return new Date(Date.now() - minutesAgo * 60000).toISOString();
}
function rand(min, max) {
  return +(Math.random() * (max - min) + min).toFixed(2);
}

async function seed() {
  console.log("🌱 Seeding demo data...");

  // ── Clear old readings/alerts for clean demo ─────────────────────────────
  await db.from("readings").delete().neq("id", 0);
  await db.from("alerts").delete().neq("id", 0);
  console.log("  ✅ Cleared old readings and alerts");

  const readings = [];

  // ── LSK-001: Normal operation on grid ────────────────────────────────────
  for (let i = 60; i >= 0; i--) {
    readings.push(
      { site_id: "LSK-001", category: "power", metric: "power_source", value: 1, unit: "enum", timestamp: ts(i) },
      { site_id: "LSK-001", category: "power", metric: "grid_voltage", value: rand(228, 232), unit: "V", timestamp: ts(i) },
      { site_id: "LSK-001", category: "fuel", metric: "diesel_level", value: rand(72, 78), unit: "%", timestamp: ts(i) },
      { site_id: "LSK-001", category: "environment", metric: "temperature", value: rand(24, 28), unit: "°C", timestamp: ts(i) },
      { site_id: "LSK-001", category: "environment", metric: "humidity", value: rand(50, 65), unit: "%", timestamp: ts(i) },
      { site_id: "LSK-001", category: "environment", metric: "door_open", value: 0, unit: "bool", timestamp: ts(i) },
      { site_id: "LSK-001", category: "environment", metric: "motion", value: 0, unit: "bool", timestamp: ts(i) },
      { site_id: "LSK-001", category: "fuel", metric: "generator_runtime", value: rand(45, 47), unit: "h", timestamp: ts(i) },
    );
  }

  // ── LSK-002: Mid generator failover — grid went down 40 min ago ──────────
  for (let i = 60; i > 40; i--) {
    readings.push(
      { site_id: "LSK-002", category: "power", metric: "power_source", value: 1, unit: "enum", timestamp: ts(i) },
      { site_id: "LSK-002", category: "power", metric: "grid_voltage", value: rand(228, 232), unit: "V", timestamp: ts(i) },
    );
  }
  for (let i = 40; i >= 0; i--) {
    const level = Math.max(0, 68 - (40 - i) * 0.1);
    readings.push(
      { site_id: "LSK-002", category: "power", metric: "power_source", value: 3, unit: "enum", timestamp: ts(i) },
      { site_id: "LSK-002", category: "power", metric: "grid_voltage", value: 0, unit: "V", timestamp: ts(i) },
      { site_id: "LSK-002", category: "fuel", metric: "diesel_level", value: +level.toFixed(1), unit: "%", timestamp: ts(i) },
      { site_id: "LSK-002", category: "fuel", metric: "generator_runtime", value: +((40 - i) / 60).toFixed(2), unit: "h", timestamp: ts(i) },
      { site_id: "LSK-002", category: "environment", metric: "temperature", value: rand(28, 33), unit: "°C", timestamp: ts(i) },
    );
  }

  // ── LSK-003: Fuel theft at 25 min ago ────────────────────────────────────
  for (let i = 60; i > 25; i--) {
    readings.push(
      { site_id: "LSK-003", category: "power", metric: "power_source", value: 1, unit: "enum", timestamp: ts(i) },
      { site_id: "LSK-003", category: "fuel", metric: "diesel_level", value: rand(82, 86), unit: "%", timestamp: ts(i) },
    );
  }
  // Sudden drop at 25 min
  readings.push(
    { site_id: "LSK-003", category: "fuel", metric: "diesel_level", value: 58, unit: "%", timestamp: ts(25) },
    { site_id: "LSK-003", category: "fuel", metric: "theft_anomaly", value: 1, unit: "bool", timestamp: ts(25) },
  );
  for (let i = 24; i >= 0; i--) {
    readings.push(
      { site_id: "LSK-003", category: "power", metric: "power_source", value: 1, unit: "enum", timestamp: ts(i) },
      { site_id: "LSK-003", category: "fuel", metric: "diesel_level", value: rand(56, 60), unit: "%", timestamp: ts(i) },
      { site_id: "LSK-003", category: "environment", metric: "temperature", value: rand(26, 30), unit: "°C", timestamp: ts(i) },
    );
  }

  // ── LSK-004: High temperature alert ──────────────────────────────────────
  for (let i = 60; i >= 0; i--) {
    const temp = i > 30 ? rand(28, 32) : rand(47, 52);
    readings.push(
      { site_id: "LSK-004", category: "power", metric: "power_source", value: 1, unit: "enum", timestamp: ts(i) },
      { site_id: "LSK-004", category: "environment", metric: "temperature", value: temp, unit: "°C", timestamp: ts(i) },
      { site_id: "LSK-004", category: "environment", metric: "humidity", value: rand(55, 75), unit: "%", timestamp: ts(i) },
      { site_id: "LSK-004", category: "environment", metric: "smoke", value: temp > 45 ? rand(55, 80) : rand(0, 5), unit: "ppm", timestamp: ts(i) },
      { site_id: "LSK-004", category: "fuel", metric: "diesel_level", value: rand(60, 65), unit: "%", timestamp: ts(i) },
    );
  }

  // ── LSK-005: Grid outage + critically low fuel ────────────────────────────
  for (let i = 60; i > 50; i--) {
    readings.push(
      { site_id: "LSK-005", category: "power", metric: "power_source", value: 1, unit: "enum", timestamp: ts(i) },
      { site_id: "LSK-005", category: "fuel", metric: "diesel_level", value: rand(18, 22), unit: "%", timestamp: ts(i) },
    );
  }
  for (let i = 50; i >= 0; i--) {
    const level = Math.max(0, 20 - (50 - i) * 0.35);
    readings.push(
      { site_id: "LSK-005", category: "power", metric: "power_source", value: 3, unit: "enum", timestamp: ts(i) },
      { site_id: "LSK-005", category: "power", metric: "grid_voltage", value: 0, unit: "V", timestamp: ts(i) },
      { site_id: "LSK-005", category: "fuel", metric: "diesel_level", value: +level.toFixed(1), unit: "%", timestamp: ts(i) },
      { site_id: "LSK-005", category: "fuel", metric: "generator_runtime", value: +((50 - i) / 60).toFixed(2), unit: "h", timestamp: ts(i) },
      { site_id: "LSK-005", category: "environment", metric: "temperature", value: rand(29, 35), unit: "°C", timestamp: ts(i) },
    );
  }

  // Insert all readings in batches
  const BATCH = 100;
  for (let i = 0; i < readings.length; i += BATCH) {
    const { error } = await db.from("readings").insert(readings.slice(i, i + BATCH));
    if (error) console.error(`  ❌ Batch ${i} error:`, error.message);
  }
  console.log(`  ✅ Inserted ${readings.length} readings`);

  // ── Seed alerts ─────────────────────────────────────────────────────────
  const alerts = [
    {
      site_id: "LSK-002", type: "grid_outage", severity: "high",
      message: "Grid power lost — running on generator (failover active)",
      triggered_at: ts(40),
    },
    {
      site_id: "LSK-003", type: "fuel_theft", severity: "critical",
      message: "Fuel theft anomaly detected — diesel dropped 28% faster than expected burn rate",
      triggered_at: ts(25),
    },
    {
      site_id: "LSK-004", type: "high_temperature", severity: "critical",
      message: "Critical temperature 51°C — cooling system failure suspected",
      triggered_at: ts(30),
    },
    {
      site_id: "LSK-004", type: "fire_smoke", severity: "critical",
      message: "Smoke/fire alert — smoke level 72 ppm at site",
      triggered_at: ts(29),
    },
    {
      site_id: "LSK-005", type: "low_fuel", severity: "critical",
      message: "Diesel level critically low at 6% — immediate refuel required",
      triggered_at: ts(5),
    },
    {
      site_id: "LSK-005", type: "grid_outage", severity: "high",
      message: "Grid power lost — running on generator, fuel critically low",
      triggered_at: ts(50),
    },
    {
      site_id: "LSK-001", type: "maintenance_due", severity: "medium",
      message: "Generator runtime 46h — service recommended (threshold: 200h)",
      triggered_at: ts(10), acknowledged: true, acknowledged_by: "admin",
      acknowledged_at: ts(5),
    },
  ];

  const { error: alertError } = await db.from("alerts").insert(alerts);
  if (alertError) console.error("  ❌ Alert seed error:", alertError.message);
  else console.log(`  ✅ Seeded ${alerts.length} demo alerts`);

  // ── Update site statuses ─────────────────────────────────────────────────
  await db.from("sites").update({ status: "up" }).eq("id", "LSK-001");
  await db.from("sites").update({ status: "degraded" }).eq("id", "LSK-002");
  await db.from("sites").update({ status: "up" }).eq("id", "LSK-003");
  await db.from("sites").update({ status: "degraded" }).eq("id", "LSK-004");
  await db.from("sites").update({ status: "down" }).eq("id", "LSK-005");
  console.log("  ✅ Updated site statuses");

  console.log("\n🎉 Seed complete! Start the server and open the dashboard.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
