import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function Commercial() {
  const [utilization, setUtilization] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const EXPANSION_THRESHOLD = 50;

  const load = async () => {
    try {
      const [u, t, r] = await Promise.all([
        api.getTenantUtilization(),
        api.getTenants(),
        api.getTenantRevenue(),
      ]);
      setUtilization(u);
      setTenants(t);
      setRevenue(r);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const totalRevenue = revenue.reduce((sum, r) => sum + (r.monthly_revenue || 0), 0);
  const totalTenants = tenants.length;
  const expansionOpps = utilization.filter((u) => u.expansion_opportunity).length;

  if (loading) return <div className="p-8 text-sm text-gray-400">Loading commercial data...</div>;

  return (
    <div className="p-6 space-y-5 animate-fade-in-up">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Commercial Intelligence</h1>
        <p className="text-sm text-gray-500 mt-0.5">Tenancy ratios, revenue, and expansion opportunities</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="kpi-label">Total Tenants</p>
          <p className="kpi-value text-blue-600">{totalTenants}</p>
          <p className="text-xs text-gray-400 mt-1">Across all sites</p>
        </div>
        <div className="card p-5">
          <p className="kpi-label">Monthly Revenue</p>
          <p className="kpi-value text-emerald-600">ZMW {(totalRevenue / 1000).toFixed(0)}K</p>
          <p className="text-xs text-gray-400 mt-1">Contracted</p>
        </div>
        <div className="card p-5">
          <p className="kpi-label">Expansion Opportunities</p>
          <p className={`kpi-value ${expansionOpps > 0 ? "text-amber-600" : "text-gray-400"}`}>{expansionOpps}</p>
          <p className="text-xs text-gray-400 mt-1">Sites below {EXPANSION_THRESHOLD}% capacity</p>
        </div>
      </div>

      {/* Utilization chart */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-sm font-semibold text-gray-900">Tenancy Utilization per Site</h3>
          <span className="text-xs text-gray-400">% of capacity used</span>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={utilization}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="site_id" tick={{ fontSize: 11, fill: "#6b7280" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#9ca3af" }} unit="%" />
              <Tooltip formatter={(v, n, p) => [`${v}% (${p.payload.tenant_count}/${p.payload.capacity})`, "Utilization"]} />
              <Bar dataKey="utilization_pct" radius={[4, 4, 0, 0]}>
                {utilization.map((u, i) => (
                  <Cell key={i} fill={u.expansion_opportunity ? "#f59e0b" : "#2563eb"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 justify-center">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className="w-3 h-3 rounded bg-blue-500" /> At/above threshold
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className="w-3 h-3 rounded bg-amber-400" /> Expansion opportunity
            </div>
          </div>
        </div>
      </div>

      {/* Site utilization table */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <div className="card-header">
            <h3 className="text-sm font-semibold text-gray-900">Site Utilization</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Site</th>
                  <th>Tenants</th>
                  <th>Capacity</th>
                  <th>Utilization</th>
                  <th>Flag</th>
                </tr>
              </thead>
              <tbody>
                {utilization.map((u) => (
                  <tr key={u.site_id}>
                    <td className="font-medium text-gray-800">{u.site_name}</td>
                    <td>{u.tenant_count}</td>
                    <td>{u.capacity}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${u.expansion_opportunity ? "bg-amber-400" : "bg-blue-500"}`}
                            style={{ width: `${u.utilization_pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono">{u.utilization_pct}%</span>
                      </div>
                    </td>
                    <td>
                      {u.expansion_opportunity && (
                        <span className="badge bg-amber-50 text-amber-700 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          Opportunity
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tenant list */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-sm font-semibold text-gray-900">Tenant Directory</h3>
          </div>
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Site</th>
                  <th>Equipment</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((t) => (
                  <tr key={t.id}>
                    <td className="font-medium text-gray-800">{t.tenant_name}</td>
                    <td className="text-gray-500">{t.site_id}</td>
                    <td className="text-xs text-gray-500">{t.equipment_type}</td>
                    <td className="text-xs font-mono text-gray-700">ZMW {(t.monthly_revenue / 1000).toFixed(0)}K</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-sm font-semibold text-gray-900">Monthly Revenue by Site</h3>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="site_id" tick={{ fontSize: 11, fill: "#6b7280" }} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v) => [`ZMW ${(v / 1000).toFixed(1)}K`, "Revenue"]} />
              <Bar dataKey="monthly_revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
