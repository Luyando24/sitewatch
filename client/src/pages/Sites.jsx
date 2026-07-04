import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useSocket } from "../hooks/useSocket";

const STATUS_CONFIG = {
  up:       { dot: "bg-emerald-500", badge: "badge-up",       label: "Online"   },
  down:     { dot: "bg-red-500",     badge: "badge-down",     label: "Offline"  },
  degraded: { dot: "bg-amber-500",   badge: "badge-degraded", label: "Degraded" },
};

export default function Sites() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { on } = useSocket();

  const load = async () => {
    try {
      const data = await api.getSites();
      setSites(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    on("site_status", ({ siteId, status }) => {
      setSites((prev) => prev.map((s) => s.id === siteId ? { ...s, status } : s));
    });
  }, []);

  const filtered = filter === "all" ? sites : sites.filter((s) => s.status === filter);

  if (loading) return <div className="p-8 text-sm text-gray-400">Loading sites...</div>;

  return (
    <div className="p-6 space-y-5 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Sites</h1>
          <p className="text-sm text-gray-500 mt-0.5">{sites.length} infrastructure sites</p>
        </div>
        <div className="flex gap-2">
          {["all", "up", "degraded", "down"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filter === f ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Online", count: sites.filter((s) => s.status === "up").length, color: "emerald" },
          { label: "Degraded", count: sites.filter((s) => s.status === "degraded").length, color: "amber" },
          { label: "Offline", count: sites.filter((s) => s.status === "down").length, color: "red" },
        ].map((stat) => (
          <div key={stat.label} className="card p-4 flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full bg-${stat.color}-500`} />
            <div>
              <p className="text-xl font-bold text-gray-900">{stat.count}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Site grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((site) => {
          const cfg = STATUS_CONFIG[site.status] || STATUS_CONFIG.up;
          return (
            <Link
              key={site.id}
              to={`/dashboard/sites/${site.id}`}
              className="card p-5 hover:border-blue-200 hover:shadow-md transition-all group"
            >
              {/* Site header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {site.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">{site.id} · {site.tower_type} tower</p>
                </div>
                <span className={`badge ${cfg.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{site.latitude?.toFixed(4)}, {site.longitude?.toFixed(4)}</span>
              </div>

              {/* Stats row */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <div className="text-center">
                  <p className="text-xs text-gray-400">Capacity</p>
                  <p className="text-sm font-semibold text-gray-700">{site.capacity}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">Alerts</p>
                  <p className={`text-sm font-semibold ${site.active_alerts > 0 ? "text-red-600" : "text-gray-400"}`}>
                    {site.active_alerts || 0}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">Type</p>
                  <p className="text-sm font-semibold text-gray-700 capitalize">{site.tower_type}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
