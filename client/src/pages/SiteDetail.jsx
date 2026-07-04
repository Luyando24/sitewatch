import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import { useSocket } from "../hooks/useSocket";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";

const SOURCE_LABEL = { 1: "Grid", 2: "Solar", 3: "Generator" };
const SOURCE_COLOR = { Grid: "#3b82f6", Solar: "#f59e0b", Generator: "#8b5cf6" };

function MetricTile({ label, value, unit, status }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className={`text-xl font-bold mt-1 ${status === "warn" ? "text-amber-600" : status === "danger" ? "text-red-600" : "text-gray-900"}`}>
        {value !== undefined && value !== null ? `${value}` : "—"}<span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>
      </p>
    </div>
  );
}

function FuelGauge({ level }) {
  const pct = Math.min(100, Math.max(0, level || 0));
  const color = pct < 10 ? "#ef4444" : pct < 20 ? "#f97316" : "#3b82f6";
  return (
    <div className="card p-4">
      <p className="text-xs text-gray-500 font-medium mb-3">Diesel Level</p>
      <div className="relative w-24 h-24 mx-auto">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="10" />
          <circle
            cx="50" cy="50" r="40" fill="none"
            stroke={color} strokeWidth="10"
            strokeDasharray={`${2 * Math.PI * 40 * pct / 100} ${2 * Math.PI * 40}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-gray-900">{pct.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}

export default function SiteDetail() {
  const { id } = useParams();
  const [site, setSite] = useState(null);
  const [readings, setReadings] = useState([]);
  const [uptime, setUptime] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [live, setLive] = useState({});
  const [loading, setLoading] = useState(true);
  const { on } = useSocket();

  const loadSite = async () => {
    try {
      const [s, r, u, a] = await Promise.all([
        api.getSite(id),
        api.getReadings({ site_id: id, limit: 200 }),
        api.getSiteUptime(id, 7),
        api.getAlerts({ site_id: id, active: true }),
      ]);
      setSite(s);
      setReadings(r);
      setUptime(u);
      setAlerts(a);

      // Build live snapshot from latest readings
      const snapshot = {};
      r.forEach((r) => {
        const k = `${r.category}:${r.metric}`;
        if (!snapshot[k]) snapshot[k] = r.value;
      });
      setLive(snapshot);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSite();
    on("reading", ({ siteId, category, metric, value }) => {
      if (siteId !== id) return;
      setLive((prev) => ({ ...prev, [`${category}:${metric}`]: value }));
    });
  }, [id]);

  if (loading) return <div className="p-8 text-sm text-gray-400">Loading site...</div>;
  if (!site) return <div className="p-8 text-sm text-red-400">Site not found</div>;

  // Build chart data for temperature over time
  const tempReadings = readings.filter((r) => r.category === "environment" && r.metric === "temperature")
    .slice(0, 30).reverse().map((r) => ({
      time: new Date(r.timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      temp: r.value,
    }));

  const powerSource = live["power:power_source"];
  const powerLabel = SOURCE_LABEL[powerSource] || "Unknown";

  return (
    <div className="p-6 space-y-5 animate-fade-in-up">
      {/* Breadcrumb + header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
          <Link to="/dashboard/sites" className="hover:text-blue-600">Sites</Link>
          <span>/</span>
          <span className="text-gray-700">{site.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{site.name}</h1>
            <p className="text-sm text-gray-500">{site.id} · {site.tower_type} tower · {site.latitude?.toFixed(4)}, {site.longitude?.toFixed(4)}</p>
          </div>
          <div className="flex items-center gap-3">
            {alerts.length > 0 && (
              <span className="badge badge-critical">{alerts.length} active alerts</span>
            )}
            <span className={`badge badge-${site.status}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${site.status === "up" ? "bg-emerald-500" : site.status === "down" ? "bg-red-500" : "bg-amber-500"}`} />
              {site.status}
            </span>
          </div>
        </div>
      </div>

      {/* Uptime banner */}
      {uptime && (
        <div className={`card p-4 flex items-center justify-between ${uptime.compliant ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
          <div>
            <p className="text-xs font-semibold text-gray-600">7-Day Uptime</p>
            <p className={`text-2xl font-bold ${uptime.compliant ? "text-emerald-700" : "text-red-700"}`}>{uptime.overall}%</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">SLA Target: <strong>{uptime.sla_target}%</strong></p>
            <span className={`badge mt-1 ${uptime.compliant ? "badge-up" : "badge-critical"}`}>
              {uptime.compliant ? "✓ Compliant" : "✗ Non-Compliant"}
            </span>
          </div>
        </div>
      )}

      {/* Metric tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricTile label="Power Source" value={powerLabel} unit="" />
        <MetricTile label="Grid Voltage" value={(live["power:grid_voltage"] || 0).toFixed(0)} unit="V" status={live["power:grid_voltage"] < 210 ? "warn" : ""} />
        <MetricTile label="Temperature" value={(live["environment:temperature"] || 0).toFixed(1)} unit="°C" status={(live["environment:temperature"] || 0) > 45 ? "danger" : (live["environment:temperature"] || 0) > 40 ? "warn" : ""} />
        <MetricTile label="Humidity" value={(live["environment:humidity"] || 0).toFixed(0)} unit="%" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <FuelGauge level={live["fuel:diesel_level"]} />
        <MetricTile label="Generator Runtime" value={(live["fuel:generator_runtime"] || 0).toFixed(1)} unit="h" status={(live["fuel:generator_runtime"] || 0) > 200 ? "warn" : ""} />
        <MetricTile label="Door" value={live["environment:door_open"] ? "Open" : "Closed"} unit="" status={live["environment:door_open"] ? "warn" : ""} />
        <MetricTile label="Motion" value={live["environment:motion"] ? "Detected" : "Clear"} unit="" status={live["environment:motion"] ? "warn" : ""} />
      </div>

      {/* Temperature chart */}
      {tempReadings.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-sm font-semibold text-gray-900">Temperature (last 30 readings)</h3>
            <span className="text-xs text-gray-400 flex items-center gap-1"><span className="live-dot" /> Live</span>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={tempReadings}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "#9ca3af" }} unit="°C" />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="temp" stroke="#2563eb" fill="#dbeafe" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Active alerts */}
      {alerts.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-sm font-semibold text-gray-900">Active Alerts</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {alerts.map((a) => (
              <div key={a.id} className="px-4 py-3 flex items-center gap-3">
                <span className={`badge badge-${a.severity}`}>{a.severity}</span>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-800">{a.type.replace(/_/g, " ")}</p>
                  <p className="text-xs text-gray-500">{a.message}</p>
                </div>
                <span className="text-xs text-gray-400">{new Date(a.triggered_at).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
