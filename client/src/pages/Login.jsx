import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (type) => {
    setEmail(type === "admin" ? "admin@sitewatch.io" : "operator@sitewatch.io");
    setPassword("demo1234");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <img src="/photos/sitewatch360-logo-thick.svg" alt="SiteWatch 360 Logo" className="w-12 h-12" />
            <span className="text-2xl font-black text-gray-900 tracking-tight">SiteWatch <span className="text-yellow-600">360</span></span>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Sign in to your account</h1>
          <p className="text-sm text-gray-500 mt-1">Enter your credentials to access the platform</p>
        </div>

        {/* Quick fill buttons */}
        <div className="flex gap-2 mb-4">
          <button onClick={() => fillDemo("operator")} className="flex-1 text-xs py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 font-semibold transition-colors">
            Operator Demo
          </button>
          <button onClick={() => fillDemo("admin")} className="flex-1 text-xs py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 font-semibold transition-colors">
            Admin Demo
          </button>
        </div>

        {/* Form */}
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
              />
            </div>

            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-2.5 justify-center font-bold"
            >
              {loading ? "Signing in..." : "Sign in →"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          <Link to="/" className="text-yellow-600 hover:underline">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
