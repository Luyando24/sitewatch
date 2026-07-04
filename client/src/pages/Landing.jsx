import { Link } from "react-router-dom";

const FEATURES = [
  {
    icon: "🗼",
    title: "Infrastructure Monitoring",
    desc: "Real-time uptime tracking and SLA compliance dashboards across your entire tower portfolio.",
  },
  {
    icon: "⚡",
    title: "Power Intelligence",
    desc: "Automatic grid/solar/generator failover detection with visual switching timelines.",
  },
  {
    icon: "🛢",
    title: "Fuel & Generator",
    desc: "Diesel level gauges, consumption analytics, runtime tracking, and theft anomaly detection.",
  },
  {
    icon: "🔒",
    title: "Security Monitoring",
    desc: "Intrusion detection, alarm management, unauthorized access alerts, and CCTV integration.",
  },
  {
    icon: "🌡",
    title: "Environmental Sensors",
    desc: "Temperature, humidity, smoke/fire alerts, door sensors, and equipment health feeds.",
  },
  {
    icon: "📊",
    title: "Commercial Intelligence",
    desc: "Tenancy ratios, revenue analytics, and expansion opportunity flagging per site.",
  },
];

const STATS = [
  { value: "99.9%", label: "Avg Uptime" },
  { value: "< 30s", label: "Alert Response" },
  { value: "5+", label: "Sensor Categories" },
  { value: "360°", label: "Site Visibility" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            S
          </div>
          <span className="text-base font-bold text-gray-900">SiteWatch <span className="text-blue-600">360</span></span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#features" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">How it works</a>
          <Link to="/login" className="btn-primary text-sm px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium">
            Sign in
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          Live Infrastructure Intelligence
        </div>

        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight max-w-3xl mx-auto">
          Full visibility across every <span className="text-blue-600">tower site</span>, in one place.
        </h1>

        <p className="mt-5 text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
          SiteWatch 360 unifies power, fuel, security, environmental, and commercial intelligence
          across your entire telecom infrastructure — in real time.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            to="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
          >
            Get started →
          </Link>
          <a
            href="#features"
            className="px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            See features
          </a>
        </div>

        {/* Stats row */}
        <div className="mt-16 grid grid-cols-4 gap-6 max-w-2xl mx-auto">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-extrabold text-blue-600">{s.value}</div>
              <div className="text-xs text-gray-400 mt-1 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Dashboard preview ─────────────────────────────────────────── */}
      <section className="bg-gray-50 border-y border-gray-100 py-12">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Mock dashboard header */}
            <div className="bg-white border-b border-gray-100 px-5 py-3 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-gray-100 rounded text-xs text-gray-400 px-3 py-1">sitewatch360.io/dashboard</div>
            </div>

            {/* Mock dashboard content */}
            <div className="p-6 bg-gray-50">
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Total Sites", value: "5", color: "blue" },
                  { label: "Overall Uptime", value: "98.2%", color: "emerald" },
                  { label: "Active Alerts", value: "6", color: "red" },
                  { label: "Monthly Revenue", value: "KES 1.1M", color: "blue" },
                ].map((kpi) => (
                  <div key={kpi.label} className="bg-white rounded-xl border border-gray-100 p-4">
                    <div className="text-xs text-gray-500 font-medium">{kpi.label}</div>
                    <div className={`text-xl font-bold mt-1 text-${kpi.color}-600`}>{kpi.value}</div>
                  </div>
                ))}
              </div>

              {/* Mock site list */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Site Status
                </div>
                {[
                  { id: "LSK-001", name: "Nairobi Central", status: "up", power: "Grid", fuel: "76%" },
                  { id: "LSK-002", name: "Westlands Hub", status: "degraded", power: "Generator", fuel: "64%" },
                  { id: "LSK-003", name: "Karen Heights", status: "up", power: "Grid", fuel: "58%" },
                  { id: "LSK-005", name: "Thika Road Relay", status: "down", power: "Generator", fuel: "6%" },
                ].map((site) => (
                  <div key={site.id} className="px-4 py-3 flex items-center gap-4 border-b border-gray-50 last:border-b-0">
                    <div className={`w-2 h-2 rounded-full ${site.status === "up" ? "bg-emerald-500" : site.status === "down" ? "bg-red-500" : "bg-amber-500"}`} />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">{site.name}</span>
                      <span className="text-xs text-gray-400 ml-2">{site.id}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${site.status === "up" ? "bg-emerald-50 text-emerald-700" : site.status === "down" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                      {site.status.charAt(0).toUpperCase() + site.status.slice(1)}
                    </span>
                    <span className="text-xs text-gray-500">⚡ {site.power}</span>
                    <span className="text-xs text-gray-500">🛢 {site.fuel}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Everything you need to run your sites</h2>
          <p className="text-gray-500 mt-3 text-base max-w-xl mx-auto">
            Seven monitoring domains unified in a single, clean interface.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="p-6 rounded-2xl border border-gray-100 bg-white hover:border-blue-200 hover:shadow-sm transition-all">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="text-base font-semibold text-gray-900 mb-1.5">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section id="how-it-works" className="bg-blue-600 text-white py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">How SiteWatch 360 works</h2>
            <p className="text-blue-200 mt-3 text-base">A fully decoupled, IoT-ready architecture</p>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {[
              { step: "01", title: "Sensors publish data", desc: "Field sensors publish to MQTT topics. Real hardware or simulator — the backend doesn't care." },
              { step: "02", title: "Backend processes & alerts", desc: "Express server subscribes to MQTT, persists readings to Supabase, and runs threshold-based alert logic." },
              { step: "03", title: "Dashboard shows everything", desc: "React frontend streams live data via WebSocket and queries history via REST API." },
            ].map((step) => (
              <div key={step.step} className="text-center">
                <div className="text-5xl font-black text-blue-400 mb-4">{step.step}</div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-blue-200 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to take control of your infrastructure?</h2>
        <p className="text-gray-500 mb-8 text-base">Sign in to the demo and explore live data from 5 simulated tower sites.</p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-base hover:bg-blue-700 transition-colors shadow-sm"
        >
          Launch the platform →
        </Link>
        <p className="text-xs text-gray-400 mt-4">Demo credentials: operator@sitewatch.io / any password</p>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">S</div>
            <span className="text-sm font-semibold text-gray-700">SiteWatch 360</span>
          </div>
          <p className="text-xs text-gray-400">© 2025 SiteWatch 360. Smart Tower Monitoring Platform.</p>
        </div>
      </footer>
    </div>
  );
}
