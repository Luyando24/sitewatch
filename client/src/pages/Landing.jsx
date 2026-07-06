import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

// Real local photos
const HERO_BG = "/photos/sunset_tower_hd.png";           // sunset silhouette tower
const TOWER_CLOSE = "/photos/5G-Tower-Stock-Image.jpg"; // 5G tower close-up
const SITE_SOLAR = "/photos/6Obm8C2.jpeg";       // Zambia site with solar panel
const TECH_CLIMB = "/photos/Unmatched-Internet-Connectivity-Quality-768x512.webp"; // engineer on tower

const STATS = [
  {
    value: "99.98%",
    label: "Portfolio Uptime SLA",
    icon: (
      <svg className="w-5 h-5 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    )
  },
  {
    value: "35%",
    label: "Less Generator Runtime",
    icon: (
      <svg className="w-5 h-5 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
      </svg>
    )
  },
  {
    value: "< 1s",
    label: "Alert Broadcast Latency",
    icon: (
      <svg className="w-5 h-5 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  {
    value: "100%",
    label: "Fuel Theft Detection",
    icon: (
      <svg className="w-5 h-5 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  },
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
            <a href="#solutions" className="hover:text-slate-600 transition-colors">Solutions</a>
            <a href="#integrations" className="hover:text-slate-600 transition-colors">Integrations</a>
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

      {/* ── HERO — full-bleed section with 2-column layout (Extended to top of viewport) ── */}
      <section className="relative overflow-hidden w-full mb-10 text-white bg-[#030712] border-b border-slate-900" style={{ minHeight: "580px" }}>
        {/* Glow effects */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-slate-900/40 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto w-full px-6 sm:px-12 pt-32 pb-16 sm:pt-40 sm:pb-24 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center min-h-[580px]">
          {/* Left Column: Text Content */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.08] tracking-tight mb-6">
              Every Tower.<br/>
              Every Metric.<br/>
              <span className="text-[#FFCC00]">One Console.</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8 max-w-lg font-medium">
              SiteWatch 360 unifies real-time power, fuel, security, and environmental telemetry into a single zero-polling workspace built for telecom operators. Secure unmanned tower sites, prevent generator fuel theft in real-time, and guarantee a 99.98% co-location uptime SLA.
            </p>
            <div className="flex flex-row items-center gap-2 sm:gap-3">
              <Link to="/login" className="px-4 py-2.5 sm:px-7 sm:py-3 bg-[#FFCC00] hover:bg-[#FFD200] text-slate-950 rounded-full font-black text-[10px] sm:text-xs transition-all shadow-md shadow-yellow-500/20 hover:scale-[1.02] whitespace-nowrap">
                EXPLORE CONSOLE
              </Link>
              <a href="#integrations" className="px-4 py-2.5 sm:px-7 sm:py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white rounded-full font-bold text-[10px] sm:text-xs transition-all whitespace-nowrap">
                VIEW INTEGRATIONS
              </a>
            </div>
          </div>

          {/* Right Column: High Resolution uncropped Image */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-full max-w-[420px] aspect-square rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 group">
              <img
                src={HERO_BG}
                alt="Telecom tower at sunset"
                className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-700"
              />
              {/* Subtle overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
            </div>
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
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Core Features</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 mt-2">Operational Intelligence, Site by Site</h2>
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



      {/* ── SOLUTIONS FULL-BLEED CARD ────────────────────────────────────────── */}
      <section id="solutions" className="mx-4 sm:mx-6 mb-16 rounded-3xl overflow-hidden relative" style={{ minHeight: "380px" }}>
        <img src={TECH_CLIMB} alt="Engineer on tower" className="absolute inset-0 w-full h-full object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/70 to-slate-950/90" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-12 py-16 text-center">
          <span className="text-[10px] font-black text-[#FFCC00] uppercase tracking-[0.2em] mb-3 block">Platform Modules</span>
          <h2 className="text-3xl font-black text-white mb-10">Everything You Need. Nothing You Don't.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                title: "NOC Console",
                icon: (
                  <svg className="w-6 h-6 text-white mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                ),
                desc: "Live site telemetry, alarm queues, and SLA dashboards for operators."
              },
              {
                title: "Fuel & Power Analytics",
                icon: (
                  <svg className="w-6 h-6 text-white mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                desc: "Generator runtimes, solar harvesting metrics, and anomaly detection reports."
              },
              {
                title: "Commercial Tenancy",
                icon: (
                  <svg className="w-6 h-6 text-white mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                ),
                desc: "Site capacity ratios, client equipment loads, and revenue optimization flags."
              },
            ].map((card) => (
              <div key={card.title} className="bg-slate-950/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-left hover:border-[#FFCC00]/40 transition-all hover:-translate-y-1 duration-200">
                {card.icon}
                <h3 className="text-sm font-black text-[#FFCC00] mb-2">{card.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTEGRATIONS SECTION ────────────────────────────────────────────── */}
      <section id="integrations" className="bg-white border-y border-slate-200 py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Compatibility</span>
            <h2 className="text-3xl font-black text-slate-950 mt-2">Enterprise IoT Integrations</h2>
            <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto">
              SiteWatch 360 connects natively with standard telecom hardware, solar controllers, and power meters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Modbus TCP/RTU",
                desc: "Native support for power meters, solar charge controllers, and smart generator panels.",
                icon: (
                  <svg className="w-6 h-6 text-slate-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )
              },
              {
                title: "MQTT Protocol",
                desc: "Lightweight pub-sub telemetry transport designed for remote, low-bandwidth IoT gateways.",
                icon: (
                  <svg className="w-6 h-6 text-slate-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                )
              },
              {
                title: "SNMP v2c/v3",
                desc: "Full compatibility for active network gear, environmental sensors, and IP cameras.",
                icon: (
                  <svg className="w-6 h-6 text-slate-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )
              },
              {
                title: "OPC UA Standards",
                desc: "Secure data exchange for heavy industrial automation and multi-vendor sites.",
                icon: (
                  <svg className="w-6 h-6 text-slate-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )
              },
              {
                title: "Huawei IoT Hardware",
                desc: "Out-of-the-box support for Huawei power switchboards and cellular modules.",
                icon: (
                  <svg className="w-6 h-6 text-slate-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2" />
                  </svg>
                )
              },
              {
                title: "REST API & Webhooks",
                desc: "Developer-friendly endpoints to push custom telemetry from any software system.",
                icon: (
                  <svg className="w-6 h-6 text-slate-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  </svg>
                )
              },
            ].map((p, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200/80 p-6 rounded-2xl flex flex-col justify-between hover:border-yellow-500 transition-all hover:scale-[1.01]">
                <div>
                  {p.icon}
                  <h3 className="text-base font-black text-slate-900 mb-2">{p.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">FAQ</span>
          <h2 className="text-3xl font-black text-slate-950 mt-2">Common Questions</h2>
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
