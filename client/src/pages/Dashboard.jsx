import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useSocket } from "../hooks/useSocket";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const SEVERITY_COLOR = { critical: "#ef4444", high: "#f97316", medium: "#eab308", low: "#3b82f6" };

function KPICard({ label, value, sub, color = "blue", icon }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="kpi-label">{label}</p>
          <p className={`kpi-value text-${color}-600`}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <span className="text-2xl opacity-70">{icon}</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [exec, setExec] = useState(null);
  const [sites, setSites] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [predictive, setPredictive] = useState([]);
  const [loading, setLoading] = useState(true);
  const { on } = useSocket();

  const load = async () => {
    try {
      const [e, s, a, p] = await Promise.all([
        api.getExecutive(),
        api.getSites(),
        api.getAlerts({ active: true, limit: 8 }),
        api.getPredictive(),
      ]);
      setExec(e);
      setSites(s);
      setAlerts(a);
      setPredictive(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    on("alert", () => load());
    on("site_status", () => load());
  }, []);

  const acknowledgeAlert = async (id) => {
    await api.acknowledgeAlert(id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  if (loading) return <div className="p-8 text-sm text-gray-400">Loading dashboard...</div>;

  const statusData = [
    { name: "Up", value: exec?.sites_up || 0 },
    { name: "Degraded", value: exec?.sites_degraded || 0 },
    { name: "Down", value: exec?.sites_down || 0 },
  ];
  const STATUS_COLORS = ["#10b981", "#f59e0b", "#ef4444"];

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Executive Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">Portfolio-wide infrastructure intelligence</p>
        </div>
        <Link to="/dashboard/reports" className="btn-secondary text-xs flex items-center">
          <svg className="w-4 h-4 mr-1 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Full Report
        </Link>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          label="Total Sites" 
          value={exec?.total_sites || 0} 
          icon={
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          } 
          sub={`${exec?.sites_up} online`} 
        />
        <KPICard 
          label="Overall Uptime" 
          value={`${exec?.overall_uptime_pct || 0}%`} 
          color="emerald" 
          icon={
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          } 
          sub={`${exec?.sites_down} down`} 
        />
        <KPICard 
          label="Active Alerts" 
          value={exec?.active_alerts || 0} 
          color={exec?.critical_alerts > 0 ? "red" : "blue"} 
          icon={
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          } 
          sub={`${exec?.critical_alerts} critical`} 
        />
        <KPICard 
          label="Monthly Revenue" 
          value={`ZMW ${((exec?.monthly_revenue || 0) / 1000).toFixed(0)}K`} 
          icon={
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          } 
          sub={`${exec?.total_tenants} tenants`} 
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Site status donut */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-sm font-semibold text-gray-900">Site Status</h3>
          </div>
          <div className="card-body flex flex-col items-center">
            <PieChart width={160} height={160}>
              <Pie data={statusData} cx={75} cy={75} innerRadius={50} outerRadius={70} dataKey="value" paddingAngle={2}>
                {statusData.map((_, i) => (
                  <Cell key={i} fill={STATUS_COLORS[i]} />
                ))}
              </Pie>
            </PieChart>
            <div className="flex gap-4 mt-2">
              {statusData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[i] }} />
                  {d.name} ({d.value})
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sites table */}
        <div className="card col-span-2">
          <div className="card-header">
            <h3 className="text-sm font-semibold text-gray-900">Site Status</h3>
            <Link to="/dashboard/sites" className="text-xs text-blue-600 hover:underline">View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Site</th>
                  <th>Status</th>
                  <th>Alerts</th>
                </tr>
              </thead>
              <tbody>
                {sites.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <Link to={`/dashboard/sites/${s.id}`} className="text-blue-600 hover:underline font-medium">
                        {s.name}
                      </Link>
                      <span className="text-xs text-gray-400 ml-1.5">{s.id}</span>
                    </td>
                    <td>
                      <span className={`badge badge-${s.status}`}>
                        <span className={`status-dot-${s.status}`} />
                        {s.status}
                      </span>
                    </td>
                    <td>
                      {s.active_alerts > 0 ? (
                        <span className="badge badge-high">{s.active_alerts} active</span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Alerts + Predictive row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Active alerts */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-sm font-semibold text-gray-900">Active Alerts</h3>
            <Link to="/dashboard/reports" className="text-xs text-blue-600 hover:underline">All alerts →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {alerts.length === 0 && (
              <div className="px-5 py-6 text-center text-sm text-gray-400">No active alerts</div>
            )}
            {alerts.map((a) => (
              <div key={a.id} className="px-4 py-3 flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: SEVERITY_COLOR[a.severity] }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800">{a.site_id} — {a.type.replace(/_/g, " ")}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{a.message}</p>
                </div>
                <button onClick={() => acknowledgeAlert(a.id)} className="text-xs text-blue-600 hover:text-blue-800 flex-shrink-0">
                  Ack
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Predictive maintenance */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-sm font-semibold text-gray-900">Predictive Maintenance</h3>
            <span className="text-xs text-gray-400">Rule-based flags</span>
          </div>
          <div className="divide-y divide-gray-50">
            {predictive.length === 0 ? (
              <div className="px-5 py-6 text-center text-sm text-gray-400">All systems nominal</div>
            ) : (
              predictive.map((p) => (
                <div key={p.site_id} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-semibold text-gray-800">{p.site_name}</span>
                    <span className={`badge ${p.urgent ? "badge-critical" : "badge-medium"}`}>
                      {p.urgent ? "Urgent" : "Schedule"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{p.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
