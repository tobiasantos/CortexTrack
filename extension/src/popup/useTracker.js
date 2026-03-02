import { useState, useEffect } from "react";
import { storage } from "../utils/storage";
import { apiRequest, isAuthenticated } from "../utils/api";

export function useTracker() {
  const [trackingActive, setTrackingActive] = useState(true);
  const [currentTab, setCurrentTab] = useState(null);
  const [focusScore, setFocusScore] = useState(null);
  const [totalTimeMs, setTotalTimeMs] = useState(0);
  const [topSites, setTopSites] = useState([]);
  const [siteCount, setSiteCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
    loadPendingCount();
    loadBackendData();
  }, []);

  async function loadStatus() {
    try {
      const response = await chrome.runtime.sendMessage({ type: "GET_STATUS" });
      setTrackingActive(response.trackingActive);
      setCurrentTab(response.currentTab);
    } catch (err) {
      console.error("Failed to get status:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadBackendData() {
    const authed = await isAuthenticated();
    if (!authed) return;

    try {
      const [summary, sites] = await Promise.all([
        apiRequest("/summary/daily").catch(() => null),
        apiRequest("/top-sites?period=day").catch(() => null),
      ]);

      if (summary) {
        const total =
          (summary.productiveTime || 0) +
          (summary.neutralTime || 0) +
          (summary.distractionTime || 0);
        setTotalTimeMs(total);
        setFocusScore(summary.focusScore);
      }

      if (sites && Array.isArray(sites)) {
        setTopSites(sites.slice(0, 5).map((s) => ({
          domain: s.domain,
          time: s.time,
          category: s.category,
        })));
        setSiteCount(sites.length);
      }
    } catch (err) {
      console.error("Failed to load backend data:", err);
    }
  }

  async function loadPendingCount() {
    const events = (await storage.get("pendingEvents")) || [];
    setPendingCount(events.length);
  }

  async function toggleTracking() {
    const response = await chrome.runtime.sendMessage({ type: "TOGGLE_TRACKING" });
    setTrackingActive(response.trackingActive);
  }

  async function forceSync() {
    setSyncing(true);
    try {
      await chrome.runtime.sendMessage({ type: "FORCE_SYNC" });
      await loadPendingCount();
      await loadBackendData();
    } catch (err) {
      console.error("Force sync failed:", err);
    } finally {
      setSyncing(false);
    }
  }

  return {
    trackingActive,
    currentTab,
    focusScore,
    totalTimeMs,
    topSites,
    siteCount,
    pendingCount,
    syncing,
    loading,
    toggleTracking,
    forceSync,
    refresh: () => {
      loadStatus();
      loadPendingCount();
      loadBackendData();
    },
  };
}
