import { useEffect, useState } from "react";
import { api } from "../lib/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

export default function Reports() {
  const [sla, setSla] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [predictive, setPredictive] = useState([]);
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("sla");

  const load = async () => {
    setLoading(true);
    try {
      const [s, a, p] = await Promise.all([
        api.getSLAReport({ from, to }),
        api.getAlerts({ limit: 50 }),
        api.getPredictive(),
      ]);
      setSla(s);
      setAlerts(a);
      setPredictive(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [from, to]);

  const handleExportCSV = () => {
    window.open(api.getSLACSV(), "_blank");
  };

  const acknowledgeAlert = async (id) => {
    await api.acknowledgeAlert(id);
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, acknowledged: true } : a));
  };

  const SEVERITY_COLORS = { critical: "#ef4444", high: "#f97316", medium: "#eab308", low: "#3b82f6" };

  return (
    <div className="p-4 sm:p-6 space-y-5 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">SLA compliance, alerts history, and predictive maintenance</p>
        </div>
        <button onClick={handleExportCSV} className="btn-secondary text-xs self-start sm:self-auto">
          📥 Export SLA CSV
        </button>
      </div>

      {/* Date range */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 card p-3">
        <span className="text-xs font-medium text-gray-500">Date range:</span>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="date" value={from} onChange={(e) => setFrom(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          />
          <span className="text-xs text-gray-400">to</span>
          <input
            type="date" value={to} onChange={(e) => setTo(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          />
        </div>
        <button onClick={load} className="btn-primary text-xs py-1.5 self-start sm:self-auto">Apply</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-100 overflow-x-auto whitespace-nowrap scrollbar-none">
        {["sla", "alerts", "predictive"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-medium capitalize transition-colors border-b-2 -mb-px flex-shrink-0 ${
              activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "sla" ? "SLA Compliance" : tab === "alerts" ? "Alerts History" : "Predictive Maintenance"}
          </button>
        ))}
      </div>

      {/* SLA Tab */}
      {activeTab === "sla" && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-sm text-gray-400 py-8 text-center">Loading SLA data...</div>
          ) : (
            <>
              {/* Chart */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-sm font-semibold text-gray-900">Uptime vs SLA Target</h3>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={sla?.sites || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="site_id" tick={{ fontSize: 11, fill: "#6b7280" }} />
                      <YAxis domain={[90, 100]} tick={{ fontSize: 10, fill: "#9ca3af" }} unit="%" />
                      <Tooltip formatter={(v, n) => [`${v}%`, n === "uptime_pct" ? "Actual" : "Target"]} />
                      <Bar dataKey="uptime_pct" name="Actual Uptime" radius={[4, 4, 0, 0]}>
                        {(sla?.sites || []).map((s, i) => (
                          <Cell key={i} fill={s.compliant ? "#2563eb" : "#ef4444"} />
                        ))}
                      </Bar>
                      <Bar dataKey="target_pct" name="SLA Target" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* SLA table */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-sm font-semibold text-gray-900">SLA Report — {from} to {to}</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="table-base">
                    <thead>
                      <tr>
                        <th>Site</th>
                        <th>Actual Uptime</th>
                        <th>SLA Target</th>
                        <th>Gap</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(sla?.sites || []).map((s) => (
                        <tr key={s.site_id}>
                          <td>
                            <div>
                              <p className="font-medium text-gray-800">{s.site_name}</p>
                              <p className="text-xs text-gray-400">{s.site_id}</p>
                            </div>
                          </td>
                          <td className={`font-mono font-semibold ${s.compliant ? "text-blue-600" : "text-red-600"}`}>
                            {s.uptime_pct}%
                          </td>
                          <td className="text-gray-500 font-mono">{s.target_pct}%</td>
                          <td className={`font-mono text-xs ${s.gap >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                            {s.gap >= 0 ? "+" : ""}{s.gap}%
                          </td>
                          <td>
                            <span className={`badge ${s.compliant ? "badge-up" : "badge-critical"}`}>
                              {s.compliant ? "✓ Compliant" : "✗ Non-Compliant"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === "alerts" && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-sm font-semibold text-gray-900">Alert History</h3>
            <span className="text-xs text-gray-400">{alerts.length} records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Site</th>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((a) => (
                  <tr key={a.id}>
                    <td className="text-xs text-gray-500 whitespace-nowrap">
                      {new Date(a.triggered_at).toLocaleString()}
                    </td>
                    <td className="font-medium text-gray-800">{a.site_id}</td>
                    <td className="text-xs capitalize">{a.type.replace(/_/g, " ")}</td>
                    <td>
                      <span className={`badge badge-${a.severity}`}>{a.severity}</span>
                    </td>
                    <td className="text-xs text-gray-500 max-w-xs truncate">{a.message}</td>
                    <td>
                      {a.resolved_at ? (
                        <span className="badge badge-up">Resolved</span>
                      ) : a.acknowledged ? (
                        <span className="badge badge-low">Acked</span>
                      ) : (
                        <span className="badge badge-critical">Active</span>
                      )}
                    </td>
                    <td>
                      {!a.acknowledged && !a.resolved_at && (
                        <button onClick={() => acknowledgeAlert(a.id)} className="text-xs text-blue-600 hover:underline">
                          Ack
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Predictive Tab */}
      {activeTab === "predictive" && (
        <div className="space-y-3">
          {predictive.length === 0 ? (
            <div className="card p-12 text-center text-sm text-gray-400 flex flex-col items-center justify-center">
              <svg className="w-10 h-10 text-emerald-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              All generators within safe service thresholds
            </div>
          ) : (
            predictive.map((p) => (
              <div key={p.site_id} className={`card p-4 flex items-start gap-4 ${p.urgent ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}`}>
                <div className={`p-2 rounded-xl flex-shrink-0 ${p.urgent ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-gray-900">{p.site_name} — {p.site_id}</h3>
                    <span className={`badge ${p.urgent ? "badge-critical" : "badge-high"}`}>
                      {p.urgent ? "Urgent" : "Service Due"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{p.message}</p>
                  <div className="mt-2 flex items-center gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Generator Runtime</p>
                      <p className="text-sm font-bold text-gray-800">{p.generator_runtime_h}h</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Recommended Action</p>
                      <p className="text-xs font-medium text-gray-700">Schedule generator servicing</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
