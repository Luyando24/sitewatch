import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

// Simple JWT-based auth using localStorage
// For production: swap with Supabase Auth
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const stored = localStorage.getItem("sw360_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("sw360_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Demo auth — accept any credentials, role depends on email
    // In production, call your Supabase auth endpoint
    if (!email || !password) throw new Error("Email and password required");

    const isAdmin = email.includes("admin") || email === "admin@sitewatch.io";
    const user = {
      id: `user_${Date.now()}`,
      email,
      name: email.split("@")[0].replace(/[._]/g, " "),
      role: isAdmin ? "admin" : "operator",
      token: `demo_token_${Date.now()}`,
    };

    localStorage.setItem("sw360_user", JSON.stringify(user));
    localStorage.setItem("sw360_token", user.token);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem("sw360_user");
    localStorage.removeItem("sw360_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin: user?.role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
