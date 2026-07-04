import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useSocket } from "../hooks/useSocket";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

const SITES = ["LSK-001", "LSK-002", "LSK-003", "LSK-004", "LSK-005"];
const SOURCE_COLORS = { Grid: "#2563eb", Solar: "#f59e0b", Generator: "#8b5cf6" };
const PERIODS = ["daily", "weekly", "monthly", "quarterly", "yearly"];

function PowerSourceBadge({ source }) {
  const icons = { Grid: "⚡", Solar: "☀️", Generator: "🔧" };
  const colors = { Grid: "bg-blue-50 text-blue-700", Solar: "bg-yellow-50 text-yellow-700", Generator: "bg-purple-50 text-purple-700" };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${colors[source] || "bg-gray-50 text-gray-600"}`}>
      {icons[source] || "??"} {source}
    </span>
  );
}

export default function Power() {
  const [period, setPeriod] = useState("weekly");
  const [selectedSite, setSelectedSite] = useState("LSK-001");
  const [utilization, setUtilization] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [liveSources, setLiveSources] = useState({});
  const [loading, setLoading] = useState(true);
  const { on } = useSocket();

  const load = async () => {
    try {
      const [util, tl] = await Promise.all([
        api.getPowerUtilization(selectedSite, period),
        api.getPowerTimeline(selectedSite),
      ]);
      setUtilization(util);
      setTimeline(tl.slice(-20));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load live power sources for all sites
  const loadLive = async () => {
    const sources = {};
    await Promise.all(
      SITES.map(async (sid) => {
        try {
          const latest = await api.getLatest(sid);
          const src = latest.find((r) => r.metric === "power_source");
          sources[sid] = src ? ({ 1: "Grid", 2: "Solar", 3: "Generator" }[src.value] || "Unknown") : "Unknown";
        } catch { sources[sid] = "Unknown"; }
      })
    );
    setLiveSources(sources);
  };

  useEffect(() => {
    load();
    loadLive();
    on("reading", ({ siteId, metric, value }) => {
      if (metric === "power_source") {
        setLiveSources((prev) => ({
          ...prev,
          [siteId]: { 1: "Grid", 2: "Solar", 3: "Generator" }[value] || "Unknown",
        }));
      }
    });
  }, [selectedSite, period]);

  return (
    <div className="p-6 space-y-5 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Power Monitoring</h1>
          <p className="text-sm text-gray-500 mt-0.5">Grid, solar, and generator intelligence</p>
        </div>
      </div>

      {/* Live sources grid */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-sm font-semibold text-gray-900">Live Power Sources</h3>
          <span className="text-xs text-gray-400 flex items-center gap-1"><span className="live-dot" /> Live</span>
        </div>
        <div className="p-4 grid grid-cols-5 gap-3">
          {SITES.map((sid) => (
            <div key={sid} className="text-center p-3 rounded-xl bg-gray-50">
              <p className="text-xs font-semibold text-gray-600 mb-2">{sid}</p>
              <PowerSourceBadge source={liveSources[sid] || "—"} />
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-600">Site:</label>
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SITES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex gap-1.5">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`text-xs px-2.5 py-1 rounded-md font-medium capitalize transition-colors ${period === p ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Utilization pie */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-sm font-semibold text-gray-900">Power Utilization — {selectedSite}</h3>
            <span className="text-xs text-gray-400 capitalize">{period}</span>
          </div>
          <div className="card-body flex flex-col items-center">
            {loading ? (
              <div className="text-sm text-gray-400 py-10">Loading...</div>
            ) : (
              <>
                <PieChart width={200} height={200}>
                  <Pie data={utilization} cx={95} cy={95} outerRadius={80} dataKey="count" nameKey="source" label={({ source, pct }) => `${source} ${pct}%`} labelLine={false}>
                    {utilization.map((u, i) => (
                      <Cell key={i} fill={SOURCE_COLORS[u.source] || "#94a3b8"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n, p) => [`${p.payload.pct}%`, p.payload.source]} />
                </PieChart>
                <div className="flex gap-4 mt-2">
                  {utilization.map((u) => (
                    <div key={u.source} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SOURCE_COLORS[u.source] }} />
                      {u.source}: {u.pct}%
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Power switching timeline */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-sm font-semibold text-gray-900">Switching Timeline — {selectedSite}</h3>
          </div>
          <div className="card-body">
            {timeline.length === 0 ? (
              <div className="text-sm text-gray-400 text-center py-8">No switching events found</div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {timeline.map((event, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0 mt-1" />
                    <div>
                      <div className="flex items-center gap-2">
                        <PowerSourceBadge source={event.source} />
                        <span className="text-xs text-gray-400">
                          {new Date(event.timestamp).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Utilization bar chart across sites */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-sm font-semibold text-gray-900">Power Source Mix — {selectedSite} ({period})</h3>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={utilization} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" unit="%" tick={{ fontSize: 10, fill: "#9ca3af" }} />
              <YAxis dataKey="source" type="category" tick={{ fontSize: 11, fill: "#6b7280" }} width={70} />
              <Tooltip formatter={(v, n, p) => [`${p.payload.pct}%`, "Utilization"]} />
              <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
                {utilization.map((u, i) => (
                  <Cell key={i} fill={SOURCE_COLORS[u.source] || "#94a3b8"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
