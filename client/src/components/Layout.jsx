import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";
import { useState, useEffect } from "react";

const NAV = [
  { to: "/dashboard",              label: "Overview",       icon: "⊞" },
  { to: "/dashboard/sites",        label: "Sites",          icon: "🗼" },
  { to: "/dashboard/power",        label: "Power",          icon: "⚡" },
  { to: "/dashboard/fuel",         label: "Fuel & Gen",     icon: "🛢" },
  { to: "/dashboard/security",     label: "Security",       icon: "🔒" },
  { to: "/dashboard/environment",  label: "Environment",    icon: "🌡" },
  { to: "/dashboard/commercial",   label: "Commercial",     icon: "📊" },
  { to: "/dashboard/reports",      label: "Reports",        icon: "📋" },
];

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { connected, on } = useSocket();
  const [alertCount, setAlertCount] = useState(0);
  const [toasts, setToasts] = useState([]);

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

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
              S
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900 leading-tight">SiteWatch</div>
              <div className="text-xs text-blue-600 font-medium">360</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dashboard"}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}

          {isAdmin && (
            <NavLink
              to="/dashboard/admin"
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""} mt-2 border-t border-gray-100 pt-2`}
            >
              <span className="text-base leading-none">⚙️</span>
              <span>Admin Panel</span>
            </NavLink>
          )}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-gray-100">
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold uppercase">
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
      </aside>

      {/* ── Main ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Infrastructure Intelligence Platform</span>
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
              className="relative text-gray-500 hover:text-blue-600 transition-colors"
            >
              🔔
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-bold">
                  {alertCount > 9 ? "9+" : alertCount}
                </span>
              )}
            </button>

            <div className="text-xs text-gray-400">{new Date().toLocaleDateString("en-GB", { dateStyle: "medium" })}</div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* ── Toast notifications ───────────────────────────────────────────── */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50 w-80">
        {toasts.map((toast) => (
          <div key={toast.id} className="card p-3 border-l-4 border-red-500 animate-fade-in-up shadow-lg">
            <div className="flex items-start gap-2">
              <span className="text-sm">🚨</span>
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
