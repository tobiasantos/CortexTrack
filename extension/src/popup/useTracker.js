import { useState, useEffect } from "react";

export function useTracker() {
  const [trackingActive, setTrackingActive] = useState(true);
  const [currentTab, setCurrentTab] = useState(null);
  const [todayEvents, setTodayEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
    loadTodayEvents();
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

  async function loadTodayEvents() {
    try {
      const events = await chrome.runtime.sendMessage({ type: "GET_TODAY_EVENTS" });
      setTodayEvents(events || []);
    } catch (err) {
      console.error("Failed to get events:", err);
    }
  }

  async function toggleTracking() {
    const response = await chrome.runtime.sendMessage({ type: "TOGGLE_TRACKING" });
    setTrackingActive(response.trackingActive);
  }

  const totalTimeMs = todayEvents
    .filter((e) => e.eventType === "visit")
    .reduce((sum, e) => sum + (e.duration || 0), 0);

  const topSites = Object.entries(
    todayEvents
      .filter((e) => e.eventType === "visit" && e.url)
      .reduce((acc, e) => {
        try {
          const domain = new URL(e.url).hostname;
          acc[domain] = (acc[domain] || 0) + (e.duration || 0);
        } catch {}
        return acc;
      }, {})
  )
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([domain, time]) => ({ domain, time }));

  return {
    trackingActive,
    currentTab,
    todayEvents,
    totalTimeMs,
    topSites,
    loading,
    toggleTracking,
    refresh: () => {
      loadStatus();
      loadTodayEvents();
    },
  };
}
