import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useSocket } from "../hooks/useSocket";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

const SITES = ["LSK-001", "LSK-002", "LSK-003", "LSK-004", "LSK-005"];

function SensorStatus({ label, value, active, icon }) {
  return (
    <div className={`card p-4 flex items-center gap-3 ${active ? "border-amber-200 bg-amber-50" : ""}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${active ? "bg-amber-100" : "bg-gray-100"}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className={`text-sm font-bold ${active ? "text-amber-700" : "text-gray-400"}`}>{value}</p>
      </div>
    </div>
  );
}

export default function Environment() {
  const [selectedSite, setSelectedSite] = useState("LSK-001");
  const [tempData, setTempData] = useState([]);
  const [humData, setHumData] = useState([]);
  const [liveMetrics, setLiveMetrics] = useState({});
  const [envAlerts, setEnvAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { on } = useSocket();

  const load = async () => {
    setLoading(true);
    try {
      const [tempR, humR, latest, alerts] = await Promise.all([
        api.getReadings({ site_id: selectedSite, category: "environment", metric: "temperature", limit: 50 }),
        api.getReadings({ site_id: selectedSite, category: "environment", metric: "humidity", limit: 50 }),
        api.getLatest(selectedSite),
        api.getAlerts({ type: "high_temperature", limit: 10 }),
      ]);

      setTempData([...tempR].reverse().map((r) => ({
        time: new Date(r.timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        temp: +r.value.toFixed(1),
      })));
      setHumData([...humR].reverse().map((r) => ({
        time: new Date(r.timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        hum: +r.value.toFixed(0),
      })));

      const lm = {};
      latest.forEach((r) => { lm[`${r.category}:${r.metric}`] = r.value; });
      setLiveMetrics(lm);
      setEnvAlerts(alerts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    on("reading", ({ siteId, category, metric, value }) => {
      if (siteId !== selectedSite) return;
      setLiveMetrics((prev) => ({ ...prev, [`${category}:${metric}`]: value }));
      if (category === "environment" && metric === "temperature") {
        const time = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
        setTempData((prev) => [...prev.slice(-49), { time, temp: +value.toFixed(1) }]);
      }
      if (category === "environment" && metric === "humidity") {
        const time = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
        setHumData((prev) => [...prev.slice(-49), { time, hum: +value.toFixed(0) }]);
      }
    });
  }, [selectedSite]);

  const temp = liveMetrics["environment:temperature"] || 0;
  const hum = liveMetrics["environment:humidity"] || 0;
  const smoke = liveMetrics["environment:smoke"] || 0;
  const doorOpen = !!liveMetrics["environment:door_open"];
  const motion = !!liveMetrics["environment:motion"];
  const fault = !!liveMetrics["environment:equipment_fault"];

  return (
    <div className="p-4 sm:p-6 space-y-5 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Environmental & Sensor Monitoring</h1>
          <p className="text-sm text-gray-500 mt-0.5">Temperature, humidity, smoke, door, and motion sensors</p>
        </div>
        <select
          value={selectedSite}
          onChange={(e) => setSelectedSite(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 self-start sm:self-auto"
        >
          {SITES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Live sensor tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <div className={`card p-4 ${temp > 45 ? "border-red-200 bg-red-50" : ""}`}>
          <p className="text-xs text-gray-500 font-medium">Temperature</p>
          <p className={`text-2xl font-bold mt-1 ${temp > 45 ? "text-red-600" : temp > 38 ? "text-amber-600" : "text-gray-900"}`}>
            {temp.toFixed(1)}<span className="text-sm font-normal text-gray-400">°C</span>
          </p>
          {temp > 45 && <span className="badge badge-critical mt-1.5">Critical</span>}
          {temp > 38 && temp <= 45 && <span className="badge badge-high mt-1.5">High</span>}
        </div>

        <div className="card p-4">
          <p className="text-xs text-gray-500 font-medium">Humidity</p>
          <p className="text-2xl font-bold mt-1 text-gray-900">
            {hum.toFixed(0)}<span className="text-sm font-normal text-gray-400">%</span>
          </p>
        </div>

        <div className={`card p-4 ${smoke > 40 ? "border-red-200 bg-red-50" : ""}`}>
          <p className="text-xs text-gray-500 font-medium">Smoke</p>
          <p className={`text-2xl font-bold mt-1 ${smoke > 40 ? "text-red-600" : "text-gray-900"}`}>
            {smoke.toFixed(0)}<span className="text-sm font-normal text-gray-400"> ppm</span>
          </p>
          {smoke > 40 && <span className="badge badge-critical mt-1.5">Fire Alert</span>}
        </div>

        <SensorStatus 
          label="Door Sensor" 
          value={doorOpen ? "OPEN" : "Closed"} 
          active={doorOpen} 
          icon={
            <svg className="w-5 h-5 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
            </svg>
          } 
        />
        <SensorStatus 
          label="Motion Sensor" 
          value={motion ? "DETECTED" : "Clear"} 
          active={motion} 
          icon={
            <svg className="w-5 h-5 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          } 
        />
      </div>

      {/* Equipment fault banner */}
      {fault && (
        <div className="card border-amber-300 bg-amber-50 p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-amber-800">Equipment Fault Reported</p>
            <p className="text-xs text-amber-600 mt-0.5">Site {selectedSite} — equipment reporting fault condition. Inspection recommended.</p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <div className="card-header">
            <h3 className="text-sm font-semibold text-gray-900">Temperature</h3>
            <span className="text-xs text-gray-400 flex items-center gap-1"><span className="live-dot" /> Live</span>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={tempData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 9, fill: "#9ca3af" }} />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 9, fill: "#9ca3af" }} unit="°" />
                <Tooltip formatter={(v) => [`${v}°C`, "Temp"]} />
                <ReferenceLine y={45} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "Critical 45°C", fill: "#ef4444", fontSize: 9 }} />
                <Area type="monotone" dataKey="temp" stroke="#2563eb" fill="#dbeafe" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-sm font-semibold text-gray-900">Humidity</h3>
            <span className="text-xs text-gray-400 flex items-center gap-1"><span className="live-dot" /> Live</span>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={humData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 9, fill: "#9ca3af" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "#9ca3af" }} unit="%" />
                <Tooltip formatter={(v) => [`${v}%`, "Humidity"]} />
                <Area type="monotone" dataKey="hum" stroke="#8b5cf6" fill="#ede9fe" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Environmental alert feed */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-sm font-semibold text-gray-900">Environmental Alert Feed</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {envAlerts.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-400">No environmental alerts</div>
          ) : (
            envAlerts.map((a) => (
              <div key={a.id} className="px-4 py-3 flex items-start gap-3">
                <span className={`badge badge-${a.severity} flex-shrink-0`}>{a.severity}</span>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-800">{a.site_id}</p>
                  <p className="text-xs text-gray-500">{a.message}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{new Date(a.triggered_at).toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
