import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const FEATURES = [
  {
    icon: "📡",
    title: "Infrastructure Intelligence",
    desc: "Centralized site-by-site status monitoring. Track real-time uptime indicators and generate exportable SLA compliance reports.",
  },
  {
    icon: "⚡",
    title: "Smart Power Switchboard",
    desc: "Visual switching timelines and source breakdown charts tracking Grid, Solar, and Generator runtimes automatically.",
  },
  {
    icon: "🛢️",
    title: "Fuel & Gen Assurance",
    desc: "Threshold-triggered low fuel warnings combined with rate-of-consumption anomaly detection to catch fuel theft instantly.",
  },
  {
    icon: "🔒",
    title: "Active Security Log",
    desc: "Intrusion and motion event logs with timestamps, CCTV camera tile previews, and real-time operator alarm acknowledgment.",
  },
  {
    icon: "🌡️",
    title: "Telemetry & Environment",
    desc: "Live charts for temperature and humidity, door contact state logs, smoke/fire indicators, and equipment health alerts.",
  },
  {
    icon: "📈",
    title: "Commercial Tenancy",
    desc: "Track client equipment load per site, calculate capacity-to-tenancy ratios, and automatically flag revenue opportunities.",
  },
];

export default function Landing() {
  const [activeSite, setActiveSite] = useState("LSK-001");
  const [powerSource, setPowerSource] = useState("Grid");
  const [fuelPct, setFuelPct] = useState(78);
  const [temp, setTemp] = useState(24.5);
  const [activeFaq, setActiveFaq] = useState(null);

  // Mock live simulation on the landing page
  useEffect(() => {
    const timer = setInterval(() => {
      // Gentle drift for simulation variables
      setTemp((prev) => +(prev + (Math.random() - 0.5) * 0.4).toFixed(1));
      if (powerSource === "Generator") {
        setFuelPct((prev) => Math.max(5, +(prev - 0.1).toFixed(2)));
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [powerSource]);

  const selectSitePreset = (siteId) => {
    setActiveSite(siteId);
    if (siteId === "LSK-001") {
      setPowerSource("Grid");
      setFuelPct(78);
      setTemp(24.5);
    } else if (siteId === "LSK-002") {
      setPowerSource("Generator");
      setFuelPct(64.2);
      setTemp(32.1);
    } else if (siteId === "LSK-003") {
      setPowerSource("Solar");
      setFuelPct(92.0);
      setTemp(21.8);
    } else if (siteId === "LSK-005") {
      setPowerSource("Generator");
      setFuelPct(6.8);
      setTemp(34.5);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-500 selection:text-white">
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-blue-500/20">
              S
            </div>
            <span className="text-base font-bold tracking-tight text-slate-950">
              SiteWatch <span className="text-blue-600">360</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#preview" className="hover:text-blue-600 transition-colors">Live Preview</a>
            <a href="#architecture" className="hover:text-blue-600 transition-colors">Architecture</a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-950 transition-colors px-3 py-2">
              Sign In
            </Link>
            <Link 
              to="/login" 
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4.5 py-2 rounded-xl transition-all shadow-sm shadow-blue-500/10 hover:shadow-blue-500/20 hover:scale-[1.02]"
            >
              Launch Console
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-20 pb-28 px-6">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8 animate-fade-in-up">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Infrastructure Intelligence Platform v3.0
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Decoupled. Intelligent. <br className="hidden md:block"/>
            Centralized <span className="text-blue-600">Tower Monitoring</span>.
          </h1>

          <p className="mt-6 text-base md:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            SiteWatch 360 unifies power sources, fuel levels, security alerts, environmental sensors, 
            and client tenancy ratios into a single premium interface. Designed for seamless IoT integration.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to="/login"
              className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-blue-500/15 hover:shadow-blue-500/25 hover:scale-[1.02] text-center"
            >
              Explore Demo Workspace
            </Link>
            <a
              href="#preview"
              className="w-full sm:w-auto px-7 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-all text-center"
            >
              Try Interactive Preview
            </a>
          </div>
        </div>

        {/* Subtle Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      </section>

      {/* ── Interactive Live Preview Section ───────────────────────────────── */}
      <section id="preview" className="bg-slate-100 border-y border-slate-200/60 py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950">Interactive Simulation Hub</h2>
            <p className="text-slate-500 mt-2 text-sm max-w-lg mx-auto">
              Simulate sensor overrides right here. Choose a site preset below to see how our layout displays dynamic status conditions.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Preset Selector & Controls */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Select Site Preset</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "LSK-001", label: "Nairobi Central", status: "Online" },
                    { id: "LSK-002", label: "Westlands Hub", status: "Degraded" },
                    { id: "LSK-003", label: "Karen Heights", status: "Online" },
                    { id: "LSK-005", label: "Thika Road Relay", status: "Critical" },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => selectSitePreset(preset.id)}
                      className={`text-left p-3.5 rounded-xl border transition-all ${
                        activeSite === preset.id
                          ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600"
                          : "border-slate-200/70 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <p className="text-xs font-bold text-slate-900">{preset.id}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{preset.label}</p>
                      <span className={`inline-block w-1.5 h-1.5 rounded-full mt-2 ${
                        preset.status === "Online" ? "bg-emerald-500" : preset.status === "Critical" ? "bg-red-500" : "bg-amber-500"
                      }`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dynamic Controller</h3>
                
                {/* Power Switch */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600 block">Switch Power Source</label>
                  <div className="flex gap-2">
                    {["Grid", "Solar", "Generator"].map((src) => (
                      <button
                        key={src}
                        onClick={() => setPowerSource(src)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          powerSource === src
                            ? "bg-slate-900 border-slate-900 text-white"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {src}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fuel Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Simulated Fuel level</span>
                    <span className="font-mono text-slate-900">{fuelPct.toFixed(0)}%</span>
                  </div>
                  <input
                    type="range" min="0" max="100"
                    value={fuelPct} onChange={(e) => setFuelPct(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Right: Live Interactive Card Preview */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm relative overflow-hidden">
              {/* Card top details */}
              <div className="flex items-start justify-between pb-5 border-b border-slate-100 mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                    {activeSite === "LSK-001" ? "Nairobi Central" : activeSite === "LSK-002" ? "Westlands Hub" : activeSite === "LSK-003" ? "Karen Heights" : "Thika Road Relay"}
                    <span className="text-xs font-semibold font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {activeSite}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Live Telemetry Snapshot</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                  fuelPct < 15 ? "bg-red-50 text-red-700" : powerSource === "Generator" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    fuelPct < 15 ? "bg-red-500 animate-pulse" : powerSource === "Generator" ? "bg-amber-500" : "bg-emerald-500 animate-pulse"
                  }`} />
                  {fuelPct < 15 ? "Critical Fuel" : powerSource === "Generator" ? "Generator Running" : "Nominal"}
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Power Source</span>
                  <p className="text-sm font-bold text-slate-800 mt-1">
                    {powerSource === "Grid" ? "🔌 Grid Power" : powerSource === "Solar" ? "☀️ Solar array" : "⚙️ Generator"}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Diesel Level</span>
                  <p className={`text-sm font-bold mt-1 ${fuelPct < 20 ? "text-red-600 animate-pulse" : "text-slate-800"}`}>
                    {fuelPct.toFixed(0)}%
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Temperature</span>
                  <p className={`text-sm font-bold mt-1 ${temp > 40 ? "text-red-600" : "text-slate-800"}`}>
                    {temp}°C
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Door Status</span>
                  <p className="text-sm font-bold text-slate-800 mt-1">🔒 Closed</p>
                </div>
              </div>

              {/* Real-time power switching timeline preview */}
              <div className="mt-6 border-t border-slate-100 pt-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Switchboard Timeline Event</h4>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">⚡</span>
                    <span className="text-xs font-semibold text-slate-700">Power switched to {powerSource}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Just Now</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ───────────────────────────────────────────────── */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950">Unified Infrastructure Control</h2>
          <p className="text-slate-500 mt-3 text-sm max-w-xl mx-auto">
            Engineered to fulfill all operational oversight domains. Get full coverage across telemetry, commercial health, and alerts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <div 
              key={feature.title} 
              className="bg-white rounded-2xl border border-slate-200/70 p-6 transition-all hover:border-blue-500/30 hover:shadow-md hover:-translate-y-1 duration-200 group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xl border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-4 mb-2">{feature.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Architecture Section ────────────────────────────────────────────── */}
      <section id="architecture" className="bg-slate-900 text-slate-100 py-24 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white">Designed for Production IoT</h2>
            <p className="text-slate-400 mt-3 text-sm max-w-lg mx-auto">
              Built on a decoupled model. The simulator feeds time-series telemetry to the controller without visual blocking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative">
            {[
              {
                step: "01",
                title: "Sensors Submit Payload",
                desc: "Simulated time-series readings or physical gateway devices POST data via clean JSON payloads.",
              },
              {
                step: "02",
                title: "Backend Evaluates Rules",
                desc: "Node server ingests readings, updates PostgreSQL tables, evaluates safety thresholds, and triggers notifications.",
              },
              {
                step: "03",
                title: "Real-time Live Pushes",
                desc: "React dashboard displays live Recharts logs immediately upon receiving Socket.io broadcasts.",
              },
            ].map((step) => (
              <div key={step.step} className="bg-slate-800/40 backdrop-blur border border-slate-800 rounded-2xl p-6.5 relative">
                <span className="text-4xl font-extrabold text-blue-500/20 absolute -top-5 left-1/2 -translate-x-1/2 bg-slate-900 px-4">
                  {step.step}
                </span>
                <h3 className="text-base font-bold text-white mt-4 mb-2">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Simple Code block to showcase api request */}
          <div className="mt-16 bg-slate-950 rounded-2xl border border-slate-800/80 p-5 font-mono text-[11px] text-slate-300 max-w-2xl mx-auto shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-slate-500">
              <span>Telemetry Submission Payload (JSON)</span>
              <span>POST /api/readings/submit</span>
            </div>
            <pre className="overflow-x-auto text-left">
{`{
  "siteId": "LSK-001",
  "category": "power",
  "metric": "power_source",
  "value": 1,
  "unit": "enum",
  "timestamp": "${new Date().toISOString()}"
}`}
            </pre>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "Can I connect real physical IoT hardware to SiteWatch 360?",
              a: "Yes. The backend exposes a simple HTTP POST endpoint (`/api/readings/submit`). To deploy physical IoT gateways, simply configure them to POST standard JSON telemetry to the API. No backend or frontend code changes required.",
            },
            {
              q: "How does the fuel theft anomaly logic function?",
              a: "It tracks rate-of-change. If the diesel level falls faster than the expected burn rate of the generator over a short window (natural depletion), it flags a `theft_anomaly` event, triggering high-severity operator alarms.",
            },
            {
              q: "Is multi-role support available in the dashboard?",
              a: "Yes. Role-based layout permissions distinguish between Administrators (who can trigger scenarios and inject overrides) and Operators (who manage alarms and view SLA analytics).",
            },
          ].map((faq, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-sm">
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full px-5 py-4 text-left font-bold text-xs md:text-sm text-slate-900 flex justify-between items-center"
              >
                <span>{faq.q}</span>
                <span className="text-slate-400">{activeFaq === idx ? "−" : "+"}</span>
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-4 text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────────────────── */}
      <section className="bg-blue-600 text-white py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight">Ready to explore SiteWatch 360?</h2>
          <p className="text-blue-100 mt-3 text-sm max-w-lg mx-auto">
            Log in to access the control panel, manage alarms, view SLA targets, and inspect telemetry values.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/login"
              className="w-full sm:w-auto px-7 py-3.5 bg-white text-blue-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all text-center shadow-sm"
            >
              Sign In to Demo Workspace
            </Link>
          </div>
          <p className="text-[10px] text-blue-200/80 mt-4">
            Quick-fill credentials for Administrator & Operator roles are available on the sign-in screen.
          </p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200/60 bg-white py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-blue-500/20">
              S
            </div>
            <span className="text-sm font-bold text-slate-900">SiteWatch 360</span>
          </div>
          <p className="text-xs text-slate-400">
            © 2026 SiteWatch 360. All rights reserved. Built using React, Node.js, and Supabase.
          </p>
        </div>
      </footer>
    </div>
  );
}
