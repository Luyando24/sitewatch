import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useSocket } from "../hooks/useSocket";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";

const SITES = ["LSK-001", "LSK-002", "LSK-003", "LSK-004", "LSK-005"];

function FuelGaugeCircle({ level, siteId }) {
  const pct = Math.min(100, Math.max(0, level || 0));
  const color = pct < 10 ? "#ef4444" : pct < 20 ? "#f97316" : pct < 40 ? "#eab308" : "#2563eb";
  const circumference = 2 * Math.PI * 36;
  const strokeDash = (pct / 100) * circumference;

  return (
    <div className="card p-4 text-center">
      <p className="text-xs font-semibold text-gray-500 mb-3">{siteId}</p>
      <div className="relative w-20 h-20 mx-auto">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="36" fill="none" stroke="#f1f5f9" strokeWidth="12" />
          <circle
            cx="50" cy="50" r="36" fill="none"
            stroke={color} strokeWidth="12"
            strokeDasharray={`${strokeDash} ${circumference}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.5s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-gray-900">{pct.toFixed(0)}%</span>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-2">Diesel</p>
      {pct < 20 && (
        <span className={`badge mt-2 ${pct < 10 ? "badge-critical" : "badge-high"}`}>
          {pct < 10 ? "Critical" : "Low"}
        </span>
      )}
    </div>
  );
}

export default function Fuel() {
  const [selectedSite, setSelectedSite] = useState("LSK-001");
  const [readings, setReadings] = useState([]);
  const [fuelLevels, setFuelLevels] = useState({});
  const [genRuntime, setGenRuntime] = useState({});
  const [theftAlerts, setTheftAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { on } = useSocket();

  const load = async () => {
    setLoading(true);
    try {
      // Load fuel readings for chart
      const r = await api.getReadings({ site_id: selectedSite, category: "fuel", metric: "diesel_level", limit: 60 });
      setReadings([...r].reverse().map((d) => ({
        time: new Date(d.timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        level: +d.value.toFixed(1),
      })));

      // Load fuel theft alerts
      const ta = await api.getAlerts({ type: "fuel_theft", limit: 10 });
      setTheftAlerts(ta);

      // Latest fuel data per site
      const levels = {};
      const runtimes = {};
      await Promise.all(
        SITES.map(async (sid) => {
          try {
            const latest = await api.getLatest(sid);
            const lvl = latest.find((r) => r.metric === "diesel_level");
            const rt = latest.find((r) => r.metric === "generator_runtime");
            if (lvl) levels[sid] = lvl.value;
            if (rt) runtimes[sid] = rt.value;
          } catch {}
        })
      );
      setFuelLevels(levels);
      setGenRuntime(runtimes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    on("reading", ({ siteId, category, metric, value }) => {
      if (category === "fuel" && metric === "diesel_level") {
        setFuelLevels((prev) => ({ ...prev, [siteId]: value }));
        if (siteId === selectedSite) {
          setReadings((prev) => {
            const time = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
            return [...prev.slice(-59), { time, level: value }];
          });
        }
      }
      if (category === "fuel" && metric === "generator_runtime") {
        setGenRuntime((prev) => ({ ...prev, [siteId]: value }));
      }
    });
  }, [selectedSite]);

  return (
    <div className="p-6 space-y-5 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Fuel & Generator Intelligence</h1>
          <p className="text-sm text-gray-500 mt-0.5">Diesel levels, consumption, runtime, and anomaly detection</p>
        </div>
      </div>

      {/* Fuel gauges grid */}
      <div className="grid grid-cols-5 gap-3">
        {SITES.map((sid) => (
          <FuelGaugeCircle key={sid} siteId={sid} level={fuelLevels[sid]} />
        ))}
      </div>

      {/* Generator runtime table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-sm font-semibold text-gray-900">Generator Runtime</h3>
          <span className="text-xs text-gray-400">Hours since last service</span>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Site</th>
                <th>Runtime (h)</th>
                <th>Status</th>
                <th>Diesel Level</th>
              </tr>
            </thead>
            <tbody>
              {SITES.map((sid) => {
                const rt = genRuntime[sid] || 0;
                const fuel = fuelLevels[sid] || 0;
                const urgent = rt > 350;
                const warn = rt > 200;
                return (
                  <tr key={sid}>
                    <td className="font-medium text-gray-800">{sid}</td>
                    <td className={`font-mono font-semibold ${urgent ? "text-red-600" : warn ? "text-amber-600" : "text-gray-700"}`}>
                      {rt.toFixed(1)}h
                    </td>
                    <td>
                      {urgent ? (
                        <span className="badge badge-critical flex items-center">
                          <svg className="w-3 h-3 text-red-700 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Overdue
                        </span>
                      ) : warn ? (
                        <span className="badge badge-high">Service Soon</span>
                      ) : (
                        <span className="badge badge-up">Normal</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5 w-20">
                          <div
                            className={`h-1.5 rounded-full transition-all ${fuel < 10 ? "bg-red-500" : fuel < 20 ? "bg-orange-400" : "bg-blue-500"}`}
                            style={{ width: `${Math.min(100, fuel)}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-gray-600">{fuel.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fuel consumption chart */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Fuel Level Over Time</h3>
          </div>
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SITES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-sm text-gray-400 py-10 text-center">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={readings}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#9ca3af" }} unit="%" />
                <Tooltip formatter={(v) => [`${v}%`, "Diesel Level"]} />
                <ReferenceLine y={20} stroke="#f97316" strokeDasharray="4 4" label={{ value: "Low threshold", fill: "#f97316", fontSize: 10 }} />
                <ReferenceLine y={10} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "Critical", fill: "#ef4444", fontSize: 10 }} />
                <Area type="monotone" dataKey="level" stroke="#2563eb" fill="#dbeafe" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Theft anomaly log */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-sm font-semibold text-gray-900">Fuel Theft Anomaly Log</h3>
          <span className="text-xs text-gray-400">Rapid drop detection</span>
        </div>
        <div className="divide-y divide-gray-50">
          {theftAlerts.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-400">No theft anomalies detected</div>
          ) : (
            theftAlerts.map((a) => (
              <div key={a.id} className="px-4 py-3 flex items-start gap-3">
                <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-800">{a.site_id}</p>
                  <p className="text-xs text-gray-500">{a.message}</p>
                </div>
                <span className="text-xs text-gray-400">{new Date(a.triggered_at).toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
