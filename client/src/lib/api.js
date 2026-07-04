const API = import.meta.env.VITE_API_URL || "";

async function request(path, options = {}) {
  const token = localStorage.getItem("sw360_token");
  const res = await fetch(`${API}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

export const api = {
  // Sites
  getSites: ()              => request("/api/sites"),
  getSite: (id)             => request(`/api/sites/${id}`),
  getSiteUptime: (id, days) => request(`/api/sites/${id}/uptime?days=${days}`),

  // Readings
  getReadings: (params)     => request(`/api/readings?${new URLSearchParams(params)}`),
  getLatest: (siteId)       => request(`/api/readings/latest?site_id=${siteId}`),
  getPowerTimeline: (siteId)=> request(`/api/readings/power-source-timeline?site_id=${siteId}`),
  getPowerUtilization: (siteId, period) =>
    request(`/api/readings/power-utilization?site_id=${siteId}&period=${period}`),

  // Alerts
  getAlerts: (params = {})  => request(`/api/alerts?${new URLSearchParams(params)}`),
  getAlertSummary: ()       => request("/api/alerts/summary"),
  acknowledgeAlert: (id)    => request(`/api/alerts/${id}/acknowledge`, { method: "PATCH", body: JSON.stringify({}) }),
  resolveAlert: (id)        => request(`/api/alerts/${id}/resolve`, { method: "PATCH", body: JSON.stringify({}) }),

  // Tenants
  getTenants: (siteId)      => request(`/api/tenants${siteId ? `?site_id=${siteId}` : ""}`),
  getTenantUtilization: ()  => request("/api/tenants/utilization"),
  getTenantRevenue: ()      => request("/api/tenants/revenue"),

  // Reports
  getExecutive: ()          => request("/api/reports/executive"),
  getSLAReport: (params)    => request(`/api/reports/sla?${new URLSearchParams(params || {})}`),
  getSLACSV: ()             => `${API}/api/reports/sla/csv`,
  getPredictive: ()         => request("/api/reports/predictive"),

  // Admin
  injectReading: (body)     => request("/api/admin/inject", { method: "POST", body: JSON.stringify(body) }),
  triggerScenario: (body)   => request("/api/admin/scenario", { method: "POST", body: JSON.stringify(body) }),
};
