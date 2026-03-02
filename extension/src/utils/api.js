import { API_BASE_URL } from "./constants";
import { storage } from "./storage";

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
    // Refresh failed — clear auth state
    await logout();
    throw new Error("Session expired");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `API error: ${response.status}`);
  }

  return response.json();
}

async function tryRefreshToken() {
  const refreshToken = await storage.get("refreshToken");
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return false;

    const data = await response.json();
    await storage.set("authToken", data.token);
    await storage.set("refreshToken", data.refreshToken);
    return true;
  } catch {
    return false;
  }
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
