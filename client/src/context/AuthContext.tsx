import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

type User = {
  id: string;
  username: string;
  profileImage?: string;
  email?: string;
};

type QuittingStats = {
  days: number;
  hours: number;
  minutes: number;
  isActive: boolean;
  startDate: string | null;
};

type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  quittingStats: QuittingStats | null;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  startQuitting: () => Promise<void>;
  stopQuitting: () => Promise<void>;
  updateQuittingDate: (newDate: Date) => Promise<void>;
  refreshQuittingStats: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [quittingStats, setQuittingStats] = useState<QuittingStats | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("accessToken");
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setAccessToken(savedToken);
    }
  }, []);

  // Helper function to refresh access token
  async function refreshAccessToken() {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        logout();
        return false;
      }

      const response = await fetch("http://localhost:3000/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        setAccessToken(data.accessToken);
        localStorage.setItem("accessToken", data.accessToken);
        return true;
      } else {
        logout();
        return false;
      }
    } catch (err) {
      console.error("Failed to refresh token:", err);
      logout();
      return false;
    }
  }

  // Wrapper for API calls that handles 401
  async function fetchWithRefresh(url: string, options: RequestInit = {}) {
    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`
      }
    });

    // If 401, try to refresh and retry
    if (response.status === 401 && accessToken) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        });
      }
    }

    return response;
  }

  async function refreshQuittingStats() {
    if (!accessToken) return;
    try {
      const response = await fetchWithRefresh("http://localhost:3000/quitting/stats");
      if (response.ok) {
        const data = await response.json();
        setQuittingStats(data);
      }
    } catch (err) {
      console.error("Failed to refresh quitting stats:", err);
    }
  }

  async function startQuitting() {
    if (!accessToken) throw new Error("Not authenticated");
    const response = await fetchWithRefresh("http://localhost:3000/quitting/start", {
      method: "POST"
    });
    if (!response.ok) throw new Error("Failed to start quitting");
    const data = await response.json();
    setQuittingStats(data);
  }

  async function stopQuitting() {
    if (!accessToken) throw new Error("Not authenticated");
    const response = await fetchWithRefresh("http://localhost:3000/quitting/stop", {
      method: "POST"
    });
    if (!response.ok) throw new Error("Failed to stop quitting");
    await refreshQuittingStats();
  }

  async function updateQuittingDate(newDate: Date) {
    if (!accessToken) throw new Error("Not authenticated");
    const response = await fetchWithRefresh("http://localhost:3000/quitting/update-date", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newDate: newDate.toISOString() })
    });
    if (!response.ok) throw new Error("Failed to update date");
    const data = await response.json();
    setQuittingStats(data);
  }

  function login(user: User, accessToken: string, refreshToken: string) {
    setUser(user);
    setAccessToken(accessToken);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    // Fetch quitting stats immediately with the new token
    fetchQuittingStatsWithToken(accessToken);
  }

  async function fetchQuittingStatsWithToken(token: string) {
    try {
      const response = await fetch("http://localhost:3000/quitting/stats", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setQuittingStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch quitting stats after login:", err);
    }
  }

  function logout() {
    setUser(null);
    setAccessToken(null);
    setQuittingStats(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        quittingStats,
        login,
        logout,
        startQuitting,
        stopQuitting,
        updateQuittingDate,
        refreshQuittingStats
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}