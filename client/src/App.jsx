import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Sites from "./pages/Sites";
import SiteDetail from "./pages/SiteDetail";
import Power from "./pages/Power";
import Fuel from "./pages/Fuel";
import Security from "./pages/Security";
import Environment from "./pages/Environment";
import Commercial from "./pages/Commercial";
import Reports from "./pages/Reports";
import AdminDemo from "./pages/AdminDemo";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center"><span className="text-gray-400 text-sm">Loading...</span></div>;
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* Protected app */}
          <Route path="/dashboard" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="sites" element={<Sites />} />
            <Route path="sites/:id" element={<SiteDetail />} />
            <Route path="power" element={<Power />} />
            <Route path="fuel" element={<Fuel />} />
            <Route path="security" element={<Security />} />
            <Route path="environment" element={<Environment />} />
            <Route path="commercial" element={<Commercial />} />
            <Route path="reports" element={<Reports />} />
            <Route path="admin" element={<AdminRoute><AdminDemo /></AdminRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
