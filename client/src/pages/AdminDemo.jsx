import { useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const SITES = ["LSK-001", "LSK-002", "LSK-003", "LSK-004", "LSK-005"];

const SCENARIOS = [
  {
    key: "grid_outage",
    label: "Grid Outage",
    icon: (
      <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    desc: "Cuts grid power, triggers generator failover",
    color: "red",
  },
  {
    key: "grid_restore",
    label: "Grid Restored",
    icon: (
      <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    desc: "Restores grid power, deactivates generator",
    color: "green",
  },
  {
    key: "low_fuel",
    label: "Low Fuel Alert",
    icon: (
      <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2" />
      </svg>
    ),
    desc: "Sets diesel level to 8% (critical)",
    color: "orange",
  },
  {
    key: "fuel_theft",
    label: "Fuel Theft",
    icon: (
      <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    desc: "Simulates sudden diesel level drop + anomaly flag",
    color: "red",
  },
  {
    key: "high_temp",
    label: "High Temperature",
    icon: (
      <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v10.158a4 4 0 106 0V3a3 3 0 10-6 0z" />
      </svg>
    ),
    desc: "Sets temp to 52°C + smoke alert",
    color: "red",
  },
  {
    key: "intrusion",
    label: "Security Intrusion",
    icon: (
      <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    desc: "Triggers intrusion alert + door open event",
    color: "purple",
  },
  {
    key: "refuel",
    label: "Refuel",
    icon: (
      <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2" />
      </svg>
    ),
    desc: "Sets diesel to 92%",
    color: "blue",
  },
];

const METRICS = [
  { category: "power",       metric: "power_source",      label: "Power Source (1=Grid, 2=Solar, 3=Generator)" },
  { category: "power",       metric: "grid_voltage",      label: "Grid Voltage (V)" },
  { category: "fuel",        metric: "diesel_level",      label: "Diesel Level (%)" },
  { category: "fuel",        metric: "generator_runtime", label: "Generator Runtime (h)" },
  { category: "environment", metric: "temperature",       label: "Temperature (°C)" },
  { category: "environment", metric: "humidity",          label: "Humidity (%)" },
  { category: "environment", metric: "smoke",             label: "Smoke Level (ppm)" },
  { category: "environment", metric: "door_open",         label: "Door Open (0=closed, 1=open)" },
  { category: "security",    metric: "intrusion",         label: "Intrusion (0=clear, 1=detected)" },
];

export default function AdminDemo() {
  const { user } = useAuth();
  const [selectedSite, setSelectedSite] = useState("LSK-001");
  const [selectedMetric, setSelectedMetric] = useState(METRICS[0]);
  const [value, setValue] = useState("");
  const [log, setLog] = useState([]);
  const [injectLoading, setInjectLoading] = useState(false);
  const [scenarioLoading, setScenarioLoading] = useState(null);

  const addLog = (msg, type = "success") => {
    const entry = { msg, type, time: new Date().toLocaleTimeString() };
    setLog((prev) => [entry, ...prev.slice(0, 29)]);
  };

  const handleInject = async (e) => {
    e.preventDefault();
    if (!value) return;
    setInjectLoading(true);
    try {
      const metric = METRICS.find((m) => m.metric === selectedMetric.metric);
      await api.injectReading({
        site_id: selectedSite,
        category: metric.category,
        metric: metric.metric,
        value: parseFloat(value),
      });
      addLog(`Success: Injected ${metric.metric}=${value} → ${selectedSite}`);
      setValue("");
    } catch (err) {
      addLog(`Error: ${err.message}`, "error");
    } finally {
      setInjectLoading(false);
    }
  };

  const handleScenario = async (scenario) => {
    setScenarioLoading(scenario.key);
    try {
      await api.triggerScenario({ scenario: scenario.key, site_id: selectedSite });
      addLog(`Scenario: "${scenario.label}" triggered on ${selectedSite}`);
    } catch (err) {
      addLog(`Error: ${err.message}`, "error");
    } finally {
      setScenarioLoading(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Admin Demo Panel</h1>
          <p className="text-sm text-gray-500 mt-0.5">Inject sensor readings and trigger demo scenarios for live demonstration</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-gray-400">Logged in as:</span>
          <span className="badge bg-yellow-50 text-yellow-700">{user?.email}</span>
          <span className="badge badge-critical">Admin Only</span>
        </div>
      </div>

      {/* Warning */}
      <div className="card border-amber-200 bg-amber-50 p-4 flex gap-3">
        <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-xs text-amber-700">
          This panel submits readings directly to the API. All injected readings flow through the normal pipeline — they will be persisted, trigger alerts, and appear on all dashboards.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Scenarios + Inject */}
        <div className="space-y-4">
          {/* Site selector */}
          <div className="card p-4">
            <label className="text-xs font-semibold text-gray-700 block mb-2">Target Site</label>
            <div className="flex flex-wrap gap-2">
              {SITES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSite(s)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${selectedSite === s ? "bg-[#FFCC00] text-slate-950 font-bold" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Pre-built scenarios */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-sm font-semibold text-gray-900">Demo Scenarios</h3>
              <span className="text-xs text-gray-400">One-click triggers</span>
            </div>
            <div className="p-3 space-y-2">
              {SCENARIOS.map((s) => (
                <div key={s.key} className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base">{s.icon}</span>
                      <span className="text-xs font-semibold text-gray-800">{s.label}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 ml-6">{s.desc}</p>
                  </div>
                  <button
                    onClick={() => handleScenario(s)}
                    disabled={scenarioLoading === s.key}
                    className="btn-primary text-xs py-1.5 px-3 flex-shrink-0 ml-3"
                  >
                    {scenarioLoading === s.key ? "..." : "Trigger"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Manual inject */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-sm font-semibold text-gray-900">Manual Sensor Override</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleInject} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Metric</label>
                  <select
                    value={selectedMetric.metric}
                    onChange={(e) => setSelectedMetric(METRICS.find((m) => m.metric === e.target.value))}
                    className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    {METRICS.map((m) => <option key={m.metric} value={m.metric}>{m.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Value</label>
                  <input
                    type="number"
                    step="0.1"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Enter value..."
                    className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                  />
                </div>
                <button type="submit" disabled={injectLoading} className="btn-primary w-full justify-center text-xs">
                  {injectLoading ? "Injecting..." : "⬆ Inject Reading"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right: Event log */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-sm font-semibold text-gray-900">Injection Log</h3>
            <button onClick={() => setLog([])} className="text-xs text-gray-400 hover:text-gray-600">Clear</button>
          </div>
          <div className="h-[480px] overflow-y-auto p-3 space-y-1.5 font-mono">
            {log.length === 0 ? (
              <div className="text-xs text-gray-400 text-center py-8">No events yet — trigger a scenario or inject a reading</div>
            ) : (
              log.map((entry, i) => (
                <div key={i} className={`text-xs p-2 rounded ${entry.type === "error" ? "bg-red-50 text-red-700" : "bg-gray-50 text-gray-700"}`}>
                  <span className="text-gray-400 mr-2">[{entry.time}]</span>
                  {entry.msg}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
