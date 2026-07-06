import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";
import { useState, useEffect } from "react";

const NAV = [
  { to: "/dashboard",              label: "Overview" },
  { to: "/dashboard/sites",        label: "Sites" },
  { to: "/dashboard/power",        label: "Power" },
  { to: "/dashboard/fuel",         label: "Fuel & Gen" },
  { to: "/dashboard/security",     label: "Security" },
  { to: "/dashboard/environment",  label: "Environment" },
  { to: "/dashboard/commercial",   label: "Commercial" },
  { to: "/dashboard/reports",      label: "Reports" },
];

const getIcon = (label) => {
  const css = "w-4 h-4";
  switch(label) {
    case "Overview":
      return (
        <svg className={css} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      );
    case "Sites":
      return (
        <svg className={css} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
    case "Power":
      return (
        <svg className={css} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case "Fuel & Gen":
      return (
        <svg className={css} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      );
    case "Security":
      return (
        <svg className={css} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      );
    case "Environment":
      return (
        <svg className={css} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v10.158a4 4 0 106 0V3a3 3 0 10-6 0z" />
        </svg>
      );
    case "Commercial":
      return (
        <svg className={css} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "Reports":
      return (
        <svg className={css} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      );
    case "Admin":
      return (
        <svg className={css} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    default:
      return null;
  }
};

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { connected, on } = useSocket();
  const [alertCount, setAlertCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Show toast on new critical alerts
    on("alert", (alert) => {
      if (alert.severity === "critical" || alert.severity === "high") {
        setToasts((prev) => [...prev.slice(-3), { ...alert, id: Date.now() }]);
        setAlertCount((c) => c + 1);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== alert.id)), 6000);
      }
    });
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const closeSidebar = () => setSidebarOpen(false);

  const renderSidebarContent = (isMobile = false) => (
    <>
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src="/photos/sitewatch360-logo.svg" alt="SiteWatch 360 Logo" className="w-7 h-7" />
          <div>
            <div className="text-sm font-bold text-gray-900 leading-tight">SiteWatch</div>
            <div className="text-xs text-yellow-600 font-bold">360</div>
          </div>
        </div>
        {isMobile && (
          <button onClick={closeSidebar} className="text-gray-400 hover:text-gray-700 p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/dashboard"}
            onClick={closeSidebar}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <span className="flex-shrink-0 leading-none">{getIcon(item.label)}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        {isAdmin && (
          <NavLink
            to="/dashboard/admin"
            onClick={closeSidebar}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""} mt-2 border-t border-gray-100 pt-2`}
          >
            <span className="flex-shrink-0 leading-none">{getIcon("Admin")}</span>
            <span>Admin Panel</span>
          </NavLink>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-gray-100">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="w-7 h-7 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-800 text-xs font-bold uppercase">
            {user?.name?.[0] || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-800 truncate">{user?.name || "Operator"}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-gray-700 text-xs" title="Logout">
            ⎋
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      {/* ── Desktop Sidebar ────────────────────────────────────────────────── */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col flex-shrink-0 hidden md:flex">
        {renderSidebarContent(false)}
      </aside>

      {/* ── Mobile Sidebar Drawer ─────────────────────────────────────────── */}
      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}
      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white z-50 flex flex-col transition-transform duration-300 ease-in-out md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } shadow-xl`}
      >
        {renderSidebarContent(true)}
      </aside>

      {/* ── Main ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Hamburger Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 -ml-1 text-gray-500 hover:text-yellow-600 md:hidden focus:outline-none"
              title="Open menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="text-xs text-gray-400 hidden sm:block">Infrastructure Intelligence Platform</span>
            {/* Mobile Logo */}
            <div className="flex items-center gap-1.5 sm:hidden">
              <img src="/photos/sitewatch360-logo.svg" alt="SiteWatch 360 Logo" className="w-5 h-5" />
              <span className="text-xs font-bold text-gray-900 leading-tight">SiteWatch 360</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Live indicator */}
            <div className="flex items-center gap-1.5 text-xs">
              <div className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-gray-300"}`} />
              <span className={connected ? "text-emerald-600 font-medium" : "text-gray-400"}>
                {connected ? "Live" : "Offline"}
              </span>
            </div>

            {/* Alert bell */}
            <button
              onClick={() => navigate("/dashboard/reports")}
              className="relative p-1 text-gray-500 hover:text-yellow-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                  {alertCount > 9 ? "9+" : alertCount}
                </span>
              )}
            </button>

            <div className="text-xs text-gray-400 hidden sm:block">{new Date().toLocaleDateString("en-GB", { dateStyle: "medium" })}</div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* ── Toast notifications ───────────────────────────────────────────── */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50 w-80 max-w-[calc(100vw-2rem)]">
        {toasts.map((toast) => (
          <div key={toast.id} className="card p-3 border-l-4 border-red-500 animate-fade-in-up shadow-lg bg-white">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-xs font-semibold text-gray-900">{toast.site_id} — {toast.type.replace(/_/g, " ").toUpperCase()}</p>
                <p className="text-xs text-gray-600 mt-0.5">{toast.message}</p>
              </div>
              <button onClick={() => setToasts((p) => p.filter((t) => t.id !== toast.id))} className="text-gray-300 hover:text-gray-500 ml-auto">×</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
