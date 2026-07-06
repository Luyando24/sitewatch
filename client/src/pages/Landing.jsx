import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

// Real local photos
const HERO_BG = "/photos/unnamed.jpg";           // sunset silhouette tower
const TOWER_CLOSE = "/photos/5G-Tower-Stock-Image.jpg"; // 5G tower close-up
const SITE_SOLAR = "/photos/6Obm8C2.jpeg";       // Zambia site with solar panel
const TECH_CLIMB = "/photos/Unmatched-Internet-Connectivity-Quality-768x512.webp"; // engineer on tower

const STATS = [
  { value: "99.98%", label: "Portfolio Uptime SLA", icon: "↑" },
  { value: "35%",    label: "Less Generator Runtime", icon: "↓" },
  { value: "< 1s",   label: "Alert Broadcast Latency", icon: "⚡" },
  { value: "100%",   label: "Fuel Theft Detection", icon: "🛡" },
];

const FEATURES = [
  {
    tag: "POWER MANAGEMENT",
    title: "Smart Power Switchboard",
    desc: "Automated Grid → Solar → Generator failover tracking with live switching timelines, load-break visualizations, and historical runtime charts.",
    img: SITE_SOLAR,
    accent: "bg-[#3C2060]",
    textAccent: "text-purple-300",
  },
  {
    tag: "SECURITY & SURVEILLANCE",
    title: "Active Perimeter Defense",
    desc: "Intrusion motion logs, CCTV feed tile previews, door contact states, and instant operator alarm acknowledgment — all in one pane.",
    img: TECH_CLIMB,
    accent: "bg-[#0B2040]",
    textAccent: "text-blue-300",
  },
  {
    tag: "FUEL & GEN ASSURANCE",
    title: "Diesel Anomaly Detection",
    desc: "Real-time rate-of-consumption analysis detects fuel theft in minutes. Threshold alerts fire before tanks hit critical reserve levels.",
    img: TOWER_CLOSE,
    accent: "bg-[#1C2C1C]",
    textAccent: "text-emerald-300",
  },
];

export default function Landing() {
  const [activeSite, setActiveSite] = useState("LSK-001");
  const [powerSource, setPowerSource] = useState("Grid");
  const [fuelPct, setFuelPct] = useState(78);
  const [temp, setTemp] = useState(24.5);
  const [activeFaq, setActiveFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const tickerRef = useRef(null);

  // Live telemetry simulation drift
  useEffect(() => {
    const timer = setInterval(() => {
      setTemp((prev) => +(prev + (Math.random() - 0.5) * 0.4).toFixed(1));
      if (powerSource === "Generator") {
        setFuelPct((prev) => Math.max(5, +(prev - 0.12).toFixed(2)));
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [powerSource]);

  // Navbar scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const selectSitePreset = (siteId) => {
    setActiveSite(siteId);
    const presets = {
      "LSK-001": { powerSource: "Grid",      fuelPct: 78,   temp: 24.5 },
      "LSK-002": { powerSource: "Generator", fuelPct: 64.2, temp: 32.1 },
      "LSK-003": { powerSource: "Solar",     fuelPct: 92.0, temp: 21.8 },
      "LSK-005": { powerSource: "Generator", fuelPct: 6.8,  temp: 34.5 },
    };
    const p = presets[siteId];
    setPowerSource(p.powerSource);
    setFuelPct(p.fuelPct);
    setTemp(p.temp);
  };

  const siteNames = {
    "LSK-001": "Lusaka Central",
    "LSK-002": "Kalingalinga Hub",
    "LSK-003": "Kabulonga Heights",
    "LSK-005": "Chilungululu Relay",
  };

  return (
    <div className="min-h-screen bg-[#F4F5F9] text-slate-800 font-sans selection:bg-[#FFCC00] selection:text-slate-950">



      {/* ── FLOATING YELLOW NAVBAR (Overlays Hero y=0) ───────────────────────── */}
      <header className={`left-0 right-0 z-50 transition-all duration-350 ${scrolled ? "fixed top-0 bg-[#FFCC00] py-3.5 shadow-lg border-b border-yellow-500/20 px-4 sm:px-6" : "absolute top-0 py-5 px-4 sm:px-6"}`}>
        <nav className={`max-w-6xl mx-auto flex items-center justify-between transition-all duration-300 ${scrolled ? "py-0.5" : "bg-[#FFCC00] rounded-2xl sm:rounded-full px-6 sm:px-8 py-4 border border-yellow-500/40 shadow-md shadow-yellow-500/10"}`}>
          {/* Brand */}
          <div className="flex items-center gap-4">
            <div className="bg-slate-950 text-[#FFCC00] rounded-xl px-3 py-2 font-extrabold text-sm tracking-tight shadow-sm select-none leading-none">
              SW360
            </div>
          </div>

          {/* Nav links */}
          <div className="hidden lg:flex items-center gap-8 text-sm font-bold text-slate-900">
            <a href="#features" className="hover:text-slate-600 transition-colors">Features</a>
            <a href="#preview" className="hover:text-slate-600 transition-colors">NOC Console</a>
            <a href="#solutions" className="hover:text-slate-600 transition-colors">Solutions</a>
            <a href="#architecture" className="hover:text-slate-600 transition-colors">Architecture</a>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:block text-sm font-bold text-slate-800 hover:text-slate-950 px-3 py-2">
              Sign In
            </Link>
            <Link to="/login" className="bg-slate-950 hover:bg-slate-900 text-white text-sm font-bold px-6 py-2.5 rounded-full transition-all shadow-md hover:scale-[1.02] flex items-center gap-2">
              Launch Console
              <svg className="w-3.5 h-3.5 text-[#FFCC00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </nav>
      </header>

      {/* ── HERO — full-bleed sunset tower image (Extended to top of viewport) ── */}
      <section className="relative overflow-hidden w-full mb-10 text-white" style={{ minHeight: "580px" }}>
        <img
          src={HERO_BG}
          alt="Telecom tower at sunset"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* rich gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-950/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

        {/* Ambient glow */}
        <div className="absolute bottom-0 left-0 w-[500px] h-[300px] bg-yellow-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto w-full px-6 sm:px-12 pt-32 pb-16 sm:pt-40 sm:pb-24 relative z-10 flex flex-col justify-center min-h-[580px]">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.08] tracking-tight mb-6">
            Every Tower.<br/>
            Every Metric.<br/>
            <span className="text-[#FFCC00]">One Console.</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8 max-w-lg">
            SiteWatch 360 gives you live telemetry across your entire co-location tower portfolio — power source switching, fuel levels, security perimeters, and environmental sensors — unified in one operator workspace.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/login" className="px-7 py-3 bg-[#FFCC00] hover:bg-[#FFD200] text-slate-950 rounded-full font-black text-xs transition-all shadow-md shadow-yellow-500/20 hover:scale-[1.02]">
              EXPLORE CONSOLE
            </Link>
            <a href="#preview" className="px-7 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white rounded-full font-bold text-xs transition-all">
              TRY LIVE DEMO
            </a>
          </div>
        </div>


      </section>

      {/* ── STATS BAR ───────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <div key={i} className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-sm flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FFCC00]/15 flex items-center justify-center text-base flex-shrink-0">
                {s.icon}
              </div>
              <div>
                <p className="text-2xl font-black text-slate-950 leading-tight">{s.value}</p>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5 leading-tight">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURE CARDS — uses the actual photos ──────────────────────────── */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-[10px] font-black text-yellow-800 bg-yellow-500/15 px-3 py-1 rounded-full uppercase tracking-wider">Core Features</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 mt-3">Operational Intelligence, Site by Site</h2>
          </div>
          <Link to="/login" className="hidden sm:flex text-xs font-bold text-slate-700 border border-slate-300 hover:bg-slate-50 px-4 py-2 rounded-full transition-colors items-center gap-1">
            VIEW ALL →
          </Link>
        </div>

        <div className="space-y-6">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className={`${f.accent} rounded-3xl overflow-hidden flex flex-col lg:flex-row ${i % 2 === 1 ? "lg:flex-row-reverse" : ""} min-h-[280px] shadow-md`}
            >
              {/* Text Side */}
              <div className="flex-1 p-8 sm:p-10 flex flex-col justify-between">
                <div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${f.textAccent}`}>{f.tag}</span>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-3 mb-3">{f.title}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed max-w-sm">{f.desc}</p>
                </div>
                <Link to="/login" className="mt-6 self-start px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full text-xs font-bold transition-all hover:scale-[1.02]">
                  See in Console →
                </Link>
              </div>

              {/* Photo Side */}
              <div className="lg:w-[45%] relative overflow-hidden" style={{ minHeight: "220px" }}>
                <img
                  src={f.img}
                  alt={f.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-current/60 to-transparent" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── NOC SWITCHBOARD INTERACTIVE CONSOLE ─────────────────────────────── */}
      <section id="preview" className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-8">
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="text-[10px] font-black text-yellow-800 bg-yellow-500/10 px-3 py-1 rounded-full uppercase tracking-wider">Interactive Simulation</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 mt-3">Live Telemetry Switchboard</h2>
              <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto">
                Select a Zambian tower site or manually override sensor readings to see how SiteWatch 360 reacts to real operational scenarios.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT: Controls */}
              <div className="lg:col-span-5 space-y-4">
                {/* Site selector */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                  <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">Select Tower Site</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "LSK-001", label: "Lusaka Central",     status: "Online" },
                      { id: "LSK-002", label: "Kalingalinga Hub",   status: "Degraded" },
                      { id: "LSK-003", label: "Kabulonga Heights",  status: "Online" },
                      { id: "LSK-005", label: "Chilungululu Relay", status: "Critical" },
                    ].map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => selectSitePreset(preset.id)}
                        className={`text-left p-3.5 rounded-xl border transition-all ${
                          activeSite === preset.id
                            ? "border-[#eab308] bg-yellow-50 ring-1 ring-[#eab308] shadow-sm"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <p className="text-xs font-black text-slate-800">{preset.id}</p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{preset.label}</p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            preset.status === "Online" ? "bg-emerald-500 animate-pulse" : preset.status === "Critical" ? "bg-red-500 animate-pulse" : "bg-amber-400"
                          }`} />
                          <span className={`text-[9px] font-bold ${
                            preset.status === "Online" ? "text-emerald-600" : preset.status === "Critical" ? "text-red-600" : "text-amber-600"
                          }`}>{preset.status}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Override controls */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-5">
                  <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Operator Overrides</h3>
                  
                  {/* Power source */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-2">Power Source</label>
                    <div className="flex gap-2">
                      {[
                        { label: "Grid", icon: "⚡" },
                        { label: "Solar", icon: "☀️" },
                        { label: "Generator", icon: "⚙️" },
                      ].map(({ label, icon }) => (
                        <button
                          key={label}
                          onClick={() => setPowerSource(label)}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                            powerSource === label
                              ? "bg-slate-950 border-slate-950 text-white shadow-md"
                              : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                          }`}
                        >
                          <span className="block text-sm">{icon}</span>
                          <span className="text-[9px]">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fuel slider */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-xs font-bold text-slate-700">Fuel Level</label>
                      <span className={`text-xs font-black ${fuelPct < 20 ? "text-red-600" : "text-[#eab308]"}`}>
                        {fuelPct.toFixed(0)}%
                      </span>
                    </div>
                    <div className="relative">
                      <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${fuelPct < 20 ? "bg-red-500" : fuelPct < 50 ? "bg-amber-400" : "bg-emerald-500"}`}
                          style={{ width: `${fuelPct}%` }}
                        />
                      </div>
                      <input
                        type="range" min="0" max="100"
                        value={fuelPct} onChange={(e) => setFuelPct(parseFloat(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                    {fuelPct < 20 && (
                      <p className="text-[10px] text-red-600 font-bold mt-1.5 flex items-center gap-1">
                        ⚠ Critical fuel — generator failover risk
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT: Live Data Panel */}
              <div className="lg:col-span-7">
                {/* Site image header */}
                <div className="relative rounded-2xl overflow-hidden h-[160px] mb-4">
                  <img
                    src={activeSite === "LSK-003" ? SITE_SOLAR : TOWER_CLOSE}
                    alt="Site"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 to-transparent flex items-center px-5">
                    <div>
                      <h3 className="text-white font-black text-lg leading-tight">{siteNames[activeSite]}</h3>
                      <span className="font-mono text-[10px] text-[#FFCC00] font-bold">{activeSite}</span>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      fuelPct < 15 ? "bg-red-950/90 text-red-300 border border-red-900" : powerSource === "Generator" ? "bg-amber-950/90 text-amber-300 border border-amber-900" : "bg-emerald-950/90 text-emerald-300 border border-emerald-900"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${fuelPct < 15 ? "bg-red-400" : powerSource === "Generator" ? "bg-amber-400" : "bg-emerald-400"}`} />
                      {fuelPct < 15 ? "CRITICAL FUEL" : powerSource === "Generator" ? "GENERATOR ACTIVE" : "GRID NOMINAL"}
                    </span>
                  </div>
                </div>

                {/* Telemetry grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    {
                      label: "Power Source",
                      value: powerSource,
                      icon: powerSource === "Grid" ? "⚡" : powerSource === "Solar" ? "☀️" : "⚙️",
                      color: "text-slate-800"
                    },
                    {
                      label: "Diesel Reserve",
                      value: `${fuelPct.toFixed(0)}%`,
                      icon: "🛢",
                      color: fuelPct < 20 ? "text-red-600" : "text-slate-800"
                    },
                    {
                      label: "Temp Reading",
                      value: `${temp}°C`,
                      icon: "🌡",
                      color: temp > 40 ? "text-red-600" : "text-slate-800"
                    },
                    {
                      label: "Security Door",
                      value: "Locked",
                      icon: "🔒",
                      color: "text-emerald-700"
                    },
                  ].map((cell, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                      <p className="text-lg mb-1">{cell.icon}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{cell.label}</p>
                      <p className={`text-sm font-black mt-1 ${cell.color}`}>{cell.value}</p>
                    </div>
                  ))}
                </div>

                {/* Event feed */}
                <div className="mt-4 bg-slate-950 rounded-xl p-4 font-mono text-[10px]">
                  <p className="text-slate-500 mb-2 font-bold">— LIVE EVENT STREAM —</p>
                  <div className="space-y-1">
                    <p className="text-emerald-400">▶  [{new Date().toLocaleTimeString()}] power_source → <span className="text-[#FFCC00]">{powerSource}</span></p>
                    <p className="text-slate-400">▶  [{new Date().toLocaleTimeString()}] fuel_level → <span className={fuelPct < 20 ? "text-red-400" : "text-slate-200"}>{fuelPct.toFixed(1)}%</span></p>
                    <p className="text-slate-400">▶  [{new Date().toLocaleTimeString()}] temp_sensor → <span className="text-slate-200">{temp}°C</span></p>
                    <p className="text-blue-400 animate-pulse">▶  socket.io event broadcasted → all connected clients</p>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </section>

      {/* ── SOLUTIONS FULL-BLEED CARD ────────────────────────────────────────── */}
      <section id="solutions" className="mx-4 sm:mx-6 mb-16 rounded-3xl overflow-hidden relative" style={{ minHeight: "380px" }}>
        <img src={TECH_CLIMB} alt="Engineer on tower" className="absolute inset-0 w-full h-full object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/70 to-slate-950/90" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-12 py-16 text-center">
          <span className="text-[10px] font-black text-[#FFCC00] uppercase tracking-[0.2em] mb-3 block">Platform Modules</span>
          <h2 className="text-3xl font-black text-white mb-10">Everything You Need. Nothing You Don't.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { title: "NOC Console", icon: "📡", desc: "Live site telemetry, alarm queues, and SLA dashboards for operators." },
              { title: "Fuel & Power Analytics", icon: "🔋", desc: "Generator runtimes, solar harvesting metrics, and anomaly detection reports." },
              { title: "Commercial Tenancy", icon: "🏢", desc: "Site capacity ratios, client equipment loads, and revenue optimization flags." },
            ].map((card) => (
              <div key={card.title} className="bg-slate-950/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-left hover:border-[#FFCC00]/40 transition-all hover:-translate-y-1 duration-200">
                <p className="text-2xl mb-3">{card.icon}</p>
                <h3 className="text-sm font-black text-[#FFCC00] mb-2">{card.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ARCHITECTURE SECTION ────────────────────────────────────────────── */}
      <section id="architecture" className="bg-white border-y border-slate-200 py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[10px] font-black text-yellow-800 bg-yellow-500/10 px-3 py-1 rounded-full uppercase tracking-wider">Decoupled Architecture</span>
            <h2 className="text-3xl font-black text-slate-950 mt-3">Built for Production IoT</h2>
            <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto">
              The simulator pushes time-series telemetry over HTTP. The backend evaluates rules, stores history, and broadcasts over WebSocket — no polling, no delay.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
            {[
              { step: "01", title: "Sensors POST Readings", desc: "Physical IoT gateways or simulated scripts submit JSON telemetry to `/api/readings/submit`." },
              { step: "02", title: "Backend Evaluates Rules", desc: "Node server updates Supabase tables, checks thresholds, and generates typed alert records." },
              { step: "03", title: "Dashboard Reacts Live", desc: "Socket.io pushes events to all connected React clients with zero-polling real-time updates." },
            ].map((s) => (
              <div key={s.step} className="relative bg-slate-50 rounded-2xl border border-slate-200 p-6 shadow-sm">
                <span className="text-6xl font-black text-slate-100 absolute -top-4 right-4 select-none">{s.step}</span>
                <h3 className="text-base font-black text-slate-950 mb-2 relative z-10">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed relative z-10">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Code snippet */}
          <div className="bg-slate-900 rounded-2xl p-5 font-mono text-[11px] text-slate-200 max-w-2xl mx-auto border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <span className="text-slate-500">POST /api/readings/submit</span>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500/60" />
                <div className="w-2 h-2 rounded-full bg-amber-400/60" />
                <div className="w-2 h-2 rounded-full bg-emerald-500/60" />
              </div>
            </div>
            <pre className="overflow-x-auto">
{`{
  "siteId":   "LSK-001",
  "category": "power",
  "metric":   "power_source",
  "value":    1,
  "unit":     "enum",
  "ts":       "${new Date().toISOString()}"
}`}
            </pre>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-12">
          <span className="text-[10px] font-black text-yellow-800 bg-yellow-500/10 px-3 py-1 rounded-full uppercase tracking-wider">FAQ</span>
          <h2 className="text-3xl font-black text-slate-950 mt-3">Common Questions</h2>
        </div>
        <div className="space-y-3">
          {[
            { q: "Can real physical IoT hardware connect to SiteWatch 360?", a: "Yes. Any MQTT-capable or HTTP gateway device can POST telemetry to `/api/readings/submit`. No code changes needed — just configure the endpoint and authentication token." },
            { q: "How does the fuel theft detection work?", a: "It tracks the rate-of-change of diesel levels. If the level drops faster than the generator's rated burn rate, a `fuel_theft_anomaly` alert fires with severity CRITICAL." },
            { q: "Is there multi-role support in the dashboard?", a: "Yes. Administrators have full override access and scenario injection. Operators can manage alarms and view all analytics, but cannot inject readings." },
            { q: "Is the platform deployable in low-bandwidth environments?", a: "The WebSocket events are ultra-lightweight JSON payloads under 512 bytes each. The React frontend is Vite-bundled with minimal dependencies, suitable for field laptop access on 3G." },
          ].map((faq, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full px-5 py-4 text-left font-bold text-sm text-slate-900 flex justify-between items-center hover:bg-slate-50 transition-colors gap-4"
              >
                <span>{faq.q}</span>
                <span className={`text-[#eab308] text-lg font-black transition-transform duration-200 flex-shrink-0 ${activeFaq === idx ? "rotate-45" : ""}`}>+</span>
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-5 pt-1 text-sm text-slate-500 leading-relaxed border-t border-slate-100 bg-slate-50/60">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────────────────────── */}
      <section className="mx-4 sm:mx-6 mb-10 rounded-3xl overflow-hidden relative">
        <img src={SITE_SOLAR} alt="Tower site" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#FFCC00]/90" />
        <div className="relative z-10 text-center py-16 px-6">
          <h2 className="text-3xl font-black text-slate-950 tracking-tight">Ready to take control of your tower estate?</h2>
          <p className="text-slate-800 mt-3 text-sm max-w-md mx-auto font-medium">
            Log in to explore every SiteWatch 360 module. Quick-fill credentials for Admin and Operator roles are on the sign-in screen.
          </p>
          <Link to="/login" className="mt-8 inline-block px-10 py-4 bg-slate-950 text-white hover:bg-slate-900 rounded-full font-black text-sm transition-all shadow-xl hover:scale-[1.02]">
            Sign In to Demo Workspace →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="bg-[#1C1C1C] py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start justify-between gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-slate-800 text-[#FFCC00] rounded-lg px-2.5 py-1 font-extrabold text-[11px] leading-none select-none">
                SW360
              </div>
              <span className="text-white font-black text-sm">SiteWatch 360</span>
            </div>
            <p className="text-slate-400 text-xs max-w-[200px] leading-relaxed">
              Unified tower intelligence for telecom co-location operators across Zambia.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8 text-xs text-slate-400 font-bold">
            <div className="space-y-2">
              <p className="text-[#FFCC00] uppercase tracking-widest text-[10px] mb-3">Platform</p>
              <p className="hover:text-white transition-colors cursor-pointer">NOC Console</p>
              <p className="hover:text-white transition-colors cursor-pointer">Power Monitoring</p>
              <p className="hover:text-white transition-colors cursor-pointer">Security & Alarms</p>
              <p className="hover:text-white transition-colors cursor-pointer">Fuel Assurance</p>
            </div>
            <div className="space-y-2">
              <p className="text-[#FFCC00] uppercase tracking-widest text-[10px] mb-3">Connect</p>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="block hover:text-white transition-colors">FACEBOOK</a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="block hover:text-white transition-colors">LINKEDIN</a>
              <p className="hover:text-white transition-colors cursor-pointer">CONTACT US</p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Legal</p>
          <p className="text-[10px] text-slate-500">© 2026 SITEWATCH 360. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>

      {/* Ticker animation */}
      <style>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.33%); }
        }
      `}</style>
    </div>
  );
}
