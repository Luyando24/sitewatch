import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useSocket } from "../hooks/useSocket";

const SITES = ["LSK-001", "LSK-002", "LSK-003", "LSK-004", "LSK-005"];

// Placeholder CCTV feed tiles
function CCTVTile({ siteId, channel }) {
  const colors = ["#1e3a5f", "#1a3a2a", "#3a1a1a", "#2a1a3a"];
  const bg = colors[channel % colors.length];
  return (
    <div className="rounded-xl overflow-hidden border border-gray-100 aspect-video relative" style={{ backgroundColor: bg }}>
      <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/50 rounded px-2 py-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        <span className="text-white text-xs font-medium">LIVE</span>
      </div>
      <div className="absolute bottom-2 left-2 text-white/60 text-xs font-mono">
        CAM {channel + 1} · {siteId}
      </div>
      {/* Simulated scan lines */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, white 2px, white 4px)",
      }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-white/20 text-4xl">📷</div>
      </div>
    </div>
  );
}

export default function Security() {
  const [selectedSite, setSelectedSite] = useState("LSK-001");
  const [alerts, setAlerts] = useState([]);
  const [intrusionEvents, setIntrusionEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { on } = useSocket();

  const load = async () => {
    setLoading(true);
    try {
      const [a, i] = await Promise.all([
        api.getAlerts({ type: "intrusion", limit: 20 }),
        api.getReadings({ site_id: selectedSite, category: "security", metric: "intrusion", limit: 30 }),
      ]);
      setAlerts(a);
      setIntrusionEvents(i.filter((r) => r.value === 1));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    on("alert", (alert) => {
      if (alert.type === "intrusion") {
        setAlerts((prev) => [alert, ...prev.slice(0, 19)]);
      }
    });
  }, [selectedSite]);

  const acknowledgeAlert = async (id) => {
    await api.acknowledgeAlert(id);
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, acknowledged: true } : a));
  };

  const resolveAlert = async (id) => {
    await api.resolveAlert(id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const activeAlerts = alerts.filter((a) => !a.acknowledged && !a.resolved_at);
  const acknowledgedAlerts = alerts.filter((a) => a.acknowledged && !a.resolved_at);

  return (
    <div className="p-6 space-y-5 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Security Monitoring</h1>
          <p className="text-sm text-gray-500 mt-0.5">CCTV, intrusion detection, and alarm management</p>
        </div>
        <select
          value={selectedSite}
          onChange={(e) => setSelectedSite(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {SITES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* CCTV tiles */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-sm font-semibold text-gray-900">CCTV Feeds — {selectedSite}</h3>
          <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded font-medium">4 cameras</span>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <CCTVTile key={i} siteId={selectedSite} channel={i} />
          ))}
        </div>
      </div>

      {/* Alert management */}
      <div className="grid grid-cols-2 gap-4">
        {/* Active alarms */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-sm font-semibold text-gray-900">Active Alarms</h3>
            {activeAlerts.length > 0 && (
              <span className="badge badge-critical">{activeAlerts.length}</span>
            )}
          </div>
          <div className="divide-y divide-gray-50">
            {activeAlerts.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-gray-400">No active alarms</div>
            ) : (
              activeAlerts.map((a) => (
                <div key={a.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`badge badge-${a.severity}`}>{a.severity}</span>
                        <span className="text-xs font-semibold text-gray-800">{a.site_id}</span>
                      </div>
                      <p className="text-xs text-gray-600">{a.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(a.triggered_at).toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <button onClick={() => acknowledgeAlert(a.id)} className="btn-secondary text-xs py-1 px-2">Ack</button>
                      <button onClick={() => resolveAlert(a.id)} className="btn text-xs py-1 px-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100">Resolve</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Acknowledged alarms */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-sm font-semibold text-gray-900">Acknowledged</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {acknowledgedAlerts.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-gray-400">None</div>
            ) : (
              acknowledgedAlerts.map((a) => (
                <div key={a.id} className="px-4 py-3 flex items-start gap-3 opacity-70">
                  <span className="text-base">✓</span>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-700">{a.site_id} — {a.type.replace(/_/g, " ")}</p>
                    <p className="text-xs text-gray-400">Acked by {a.acknowledged_by}</p>
                  </div>
                  <button onClick={() => resolveAlert(a.id)} className="text-xs text-emerald-600 hover:text-emerald-800">Resolve</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Intrusion event log */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-sm font-semibold text-gray-900">Intrusion / Motion Event Log — {selectedSite}</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {loading ? (
            <div className="px-5 py-6 text-sm text-gray-400">Loading...</div>
          ) : intrusionEvents.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-400">No intrusion events recorded</div>
          ) : (
            intrusionEvents.map((e, i) => (
              <div key={i} className="px-4 py-2.5 flex items-center gap-3">
                <span className="text-sm">🔔</span>
                <div>
                  <p className="text-xs font-medium text-gray-800">Intrusion detected</p>
                  <p className="text-xs text-gray-400">{new Date(e.timestamp).toLocaleString()}</p>
                </div>
                <span className="badge badge-high ml-auto">Motion</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
