/**
 * SiteWatch 360 — Sensor Data Simulator (HTTP Version)
 * Sends realistic IoT readings to the backend via HTTP POST.
 */
require("dotenv").config({ path: "../.env" });

const PORT = process.env.PORT || 3001;
const API_URL = `http://localhost:${PORT}/api/readings/submit`;
const INTERVAL_MS = parseInt(process.env.PUBLISH_INTERVAL_MS || "8000");

const SITES = ["LSK-001", "LSK-002", "LSK-003", "LSK-004", "LSK-005"];

// ─── Per-site state ───────────────────────────────────────────────────────────
const state = {};

function initState(siteId) {
  const i = SITES.indexOf(siteId);
  return {
    // Power
    gridVoltage: 230 + rand(-5, 5),
    powerSource: "grid", // grid | solar | generator
    solarOutput: rand(1.5, 3.5),
    generatorRuntime: 0,
    // Fuel
    dieselLevel: i === 4 ? 12 : rand(55, 95),     // LSK-005 starts very low
    dieselCapacity: 1000,
    burnRate: 8.5, // litres/hour when generator running
    lastRefuel: Date.now(),
    // Environment
    temperature: rand(22, 30),
    humidity: rand(40, 70),
    smoke: 0,
    doorOpen: false,
    motionDetected: false,
    // Incident scenarios (seeded)
    gridOutage: i === 1 || i === 4, // LSK-002 & LSK-005: generator failover
    theftAnomaly: false,
    theftNextAt: i === 2 ? Date.now() + 20000 : Infinity, // LSK-003: theft at 20s
    highTempAnomaly: i === 3, // LSK-004: starts with high temp
  };
}

SITES.forEach((id) => {
  state[id] = initState(id);
  if (state[id].gridOutage) {
    state[id].powerSource = "generator";
  }
  if (state[id].highTempAnomaly) {
    state[id].temperature = rand(48, 52);
  }
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
function rand(min, max) {
  return +(Math.random() * (max - min) + min).toFixed(2);
}
function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}
function drift(val, amount, min, max) {
  return clamp(val + rand(-amount, amount), min, max);
}

// ─── Post helper ──────────────────────────────────────────────────────────────
async function sendReading(siteId, category, metric, value, unit) {
  const payload = {
    siteId,
    category,
    metric,
    value,
    unit,
    timestamp: new Date().toISOString()
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      console.error(`[${siteId}] Failed to send ${metric}:`, res.statusText);
    }
  } catch (err) {
    console.error(`[${siteId}] Connection error sending ${metric}:`, err.message);
  }
}

// ─── Simulate one tick ────────────────────────────────────────────────────────
async function tick(siteId) {
  const s = state[siteId];
  const now = Date.now();
  const dt = INTERVAL_MS / 3600000; // hours per tick

  // — Power source logic —
  if (!s.gridOutage) {
    if (Math.random() < 0.01) {
      s.gridOutage = true;
      s.powerSource = "generator";
      console.log(`[${siteId}] Grid outage — switching to generator`);
    } else {
      const usesSolar = Math.random() < 0.25;
      s.powerSource = usesSolar ? "solar" : "grid";
    }
  } else {
    if (Math.random() < 0.005) {
      s.gridOutage = false;
      s.powerSource = "grid";
      console.log(`[${siteId}] Grid restored`);
    }
  }

  // — Grid voltage —
  s.gridVoltage = s.powerSource === "grid" ? drift(s.gridVoltage, 2, 210, 250) : 0;

  // — Solar output —
  s.solarOutput = s.powerSource === "solar" ? drift(s.solarOutput, 0.3, 0.5, 5.0) : rand(0, 0.3);

  // — Fuel & generator —
  if (s.powerSource === "generator") {
    s.dieselLevel = Math.max(0, s.dieselLevel - s.burnRate * dt);
    s.generatorRuntime += dt;
  }

  // Periodic refuel
  if (s.dieselLevel < 15 && now - s.lastRefuel > 120000) {
    s.dieselLevel = rand(80, 100);
    s.lastRefuel = now;
    console.log(`[${siteId}] Refuelled — level now ${s.dieselLevel}%`);
  }

  // — Fuel theft anomaly on LSK-003 —
  if (now >= s.theftNextAt && s.theftNextAt !== Infinity) {
    s.dieselLevel = Math.max(0, s.dieselLevel - rand(18, 28)); // sudden drop
    s.theftNextAt = Infinity; // one-time
    console.log(`[${siteId}] FUEL THEFT ANOMALY simulated`);
  }

  // — Environment —
  s.temperature = drift(s.temperature, 0.5, 18, 55);
  s.humidity = drift(s.humidity, 1, 20, 95);
  s.smoke = s.temperature > 48 ? rand(50, 90) : rand(0, 5);
  if (Math.random() < 0.03) s.doorOpen = !s.doorOpen;
  s.motionDetected = Math.random() < 0.04;

  // — Send all metrics sequentially or concurrently —
  const promises = [
    sendReading(siteId, "power", "grid_voltage", s.gridVoltage, "V"),
    sendReading(siteId, "power", "power_source", s.powerSource === "grid" ? 1 : s.powerSource === "solar" ? 2 : 3, "enum"),
    sendReading(siteId, "power", "power_source_label", 0, s.powerSource),
    sendReading(siteId, "power", "solar_output", s.solarOutput, "kW"),
    sendReading(siteId, "fuel", "diesel_level", +s.dieselLevel.toFixed(1), "%"),
    sendReading(siteId, "fuel", "diesel_litres", +(s.dieselLevel * s.dieselCapacity / 100).toFixed(1), "L"),
    sendReading(siteId, "fuel", "generator_runtime", +s.generatorRuntime.toFixed(2), "h"),
    sendReading(siteId, "fuel", "burn_rate", s.burnRate, "L/h"),
    sendReading(siteId, "environment", "temperature", s.temperature, "°C"),
    sendReading(siteId, "environment", "humidity", s.humidity, "%"),
    sendReading(siteId, "environment", "smoke", s.smoke, "ppm"),
    sendReading(siteId, "environment", "door_open", s.doorOpen ? 1 : 0, "bool"),
    sendReading(siteId, "environment", "motion", s.motionDetected ? 1 : 0, "bool"),
    sendReading(siteId, "environment", "equipment_fault", Math.random() < 0.005 ? 1 : 0, "bool"),
    sendReading(siteId, "security", "motion", s.motionDetected ? 1 : 0, "bool"),
    sendReading(siteId, "security", "intrusion", Math.random() < 0.01 ? 1 : 0, "bool"),
    sendReading(siteId, "security", "door_open", s.doorOpen ? 1 : 0, "bool")
  ];

  await Promise.all(promises);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
console.log(`✅ Simulator running. Sending HTTP POSTs to ${API_URL}`);
console.log(`📡 Sending every ${INTERVAL_MS}ms for sites: ${SITES.join(", ")}`);

// Initial tick
SITES.forEach((id) => tick(id));

setInterval(() => {
  SITES.forEach((id) => tick(id));
}, INTERVAL_MS);
