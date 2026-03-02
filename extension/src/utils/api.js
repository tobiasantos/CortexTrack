import { API_BASE_URL } from "./constants";
import { storage } from "./storage";

// Mutex to prevent concurrent refresh attempts (race condition with alarm + interval)
let isRefreshing = false;
let refreshPromise = null;

export async function apiRequest(endpoint, options = {}) {
  let token = await storage.get("authToken");

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  // Try to refresh token on 401
  if (response.status === 401 && token) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      const retryToken = await storage.get("authToken");
      const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${retryToken}`,
          ...options.headers,
        },
      });
      if (!retryResponse.ok) {
        throw new Error(`API error: ${retryResponse.status}`);
      }
      return retryResponse.json();
    }
    // Refresh failed — do NOT logout automatically.
    // Keep tokens in storage so next sync cycle can retry.
    // Only throw so caller knows this request failed.
    throw new Error("Token refresh failed, will retry on next sync");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `API error: ${response.status}`);
  }

  return response.json();
}

async function tryRefreshToken() {
  // If already refreshing, wait for the ongoing attempt
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = await storage.get("refreshToken");
  if (!refreshToken) return false;

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        // If the server explicitly says the refresh token is invalid (not a network error),
        // clear only the access token so popup shows re-login prompt on next check.
        // But keep refreshToken in case it was a transient server error.
        const body = await response.json().catch(() => ({}));
        console.warn(`[CortexTrack] Refresh failed: ${body.error || response.status}`);
        return false;
      }

      const data = await response.json();
      await storage.set("authToken", data.token);
      await storage.set("refreshToken", data.refreshToken);
      return true;
    } catch (err) {
      // Network error — don't clear anything, just fail silently
      console.warn(`[CortexTrack] Refresh network error: ${err.message}`);
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function login(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "Login failed");
  }

  const data = await response.json();
  await storage.set("authToken", data.token);
  await storage.set("refreshToken", data.refreshToken);
  await storage.set("userEmail", data.user.email);
  return data;
}

export async function logout() {
  await storage.remove("authToken");
  await storage.remove("refreshToken");
  await storage.remove("userEmail");
}

export async function isAuthenticated() {
  const token = await storage.get("authToken");
  return !!token;
}
