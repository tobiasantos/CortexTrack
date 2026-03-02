import { storage } from "../utils/storage";
import { apiRequest } from "../utils/api";
import {
  IDLE_THRESHOLD_SECONDS,
  SYNC_INTERVAL_MINUTES,
} from "../utils/constants";

let currentTab = null;
let trackingActive = true;
let sessionId = generateSessionId();

function generateSessionId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function timestamp() {
  return new Date().toISOString();
}

// --- Tab Tracking ---

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  if (!trackingActive) return;

  const tab = await chrome.tabs.get(activeInfo.tabId);
  handleTabChange(tab);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!trackingActive) return;
  if (changeInfo.status !== "complete") return;
  if (!tab.active) return;

  handleTabChange(tab);
});

function handleTabChange(tab) {
  const now = Date.now();

  if (shouldIgnoreUrl(tab.url)) return;

  // Close previous tab event
  if (currentTab) {
    const duration = now - currentTab.startTime;
    queueEvent({
      url: currentTab.url,
      title: currentTab.title,
      timestamp: currentTab.timestamp,
      eventType: "visit",
      duration,
      sessionId,
    });
  }

  // Start tracking new tab
  currentTab = {
    tabId: tab.id,
    url: tab.url,
    title: tab.title,
    startTime: now,
    timestamp: timestamp(),
  };
}

function shouldIgnoreUrl(url) {
  if (!url) return true;
  return url.startsWith("chrome://") || url.startsWith("chrome-extension://");
}

// --- Idle Detection ---

chrome.idle.setDetectionInterval(IDLE_THRESHOLD_SECONDS);

chrome.idle.onStateChanged.addListener((newState) => {
  if (!trackingActive) return;

  if (newState === "idle" || newState === "locked") {
    // Close current tab tracking
    if (currentTab) {
      const duration = Date.now() - currentTab.startTime;
      queueEvent({
        url: currentTab.url,
        title: currentTab.title,
        timestamp: currentTab.timestamp,
        eventType: "idle_start",
        duration,
        sessionId,
      });
      currentTab = null;
    }
  } else if (newState === "active") {
    // idle_end: no URL needed, skip queueing to avoid API validation error
    console.log("[CortexTrack] User returned from idle");
  }
});

// --- Event Queue ---

async function queueEvent(event) {
  const events = (await storage.get("pendingEvents")) || [];
  events.push(event);
  await storage.set("pendingEvents", events);
  console.log(`[CortexTrack] Queued ${event.eventType}: ${event.url} (${events.length} pending)`);
}

// --- Sync Scheduling ---

// Primary: chrome.alarms (persists across SW termination)
chrome.alarms.create("syncEvents", {
  delayInMinutes: 1,
  periodInMinutes: SYNC_INTERVAL_MINUTES,
});

chrome.alarms.onAlarm.addListener((alarm) => {
  console.log(`[CortexTrack] Alarm fired: ${alarm.name}`);
  if (alarm.name === "syncEvents") {
    syncEvents();
  }
});

// Fallback: setInterval while SW is alive (covers cases where alarms misbehave)
setInterval(() => {
  console.log("[CortexTrack] Interval tick, syncing...");
  syncEvents();
}, SYNC_INTERVAL_MINUTES * 60 * 1000);

chrome.runtime.onInstalled.addListener(() => {
  console.log("[CortexTrack] Extension installed");
});

chrome.runtime.onStartup.addListener(() => {
  console.log("[CortexTrack] Browser started");
});

// --- Batch Sync ---

async function syncEvents() {
  const token = await storage.get("authToken");
  if (!token) {
    console.log("[CortexTrack] No auth token, skipping sync");
    return;
  }

  const allEvents = (await storage.get("pendingEvents")) || [];
  // Filter out events with empty URLs (idle_end leftovers)
  const events = allEvents.filter((e) => e.url && e.url.length > 0);

  if (events.length === 0) {
    // Clean up any invalid events too
    if (allEvents.length > 0) {
      await storage.set("pendingEvents", []);
    }
    console.log("[CortexTrack] No events to sync");
    return;
  }

  try {
    await apiRequest("/events", {
      method: "POST",
      body: JSON.stringify(events),
    });
    console.log(`[CortexTrack] Synced ${events.length} events`);
    await storage.set("pendingEvents", []);
  } catch (err) {
    console.warn(`[CortexTrack] Sync failed, will retry: ${err.message}`);
  }
}

// --- Message Handler (Popup Communication) ---

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "GET_STATUS":
      sendResponse({
        trackingActive,
        currentTab: currentTab
          ? { url: currentTab.url, title: currentTab.title }
          : null,
        sessionId,
      });
      break;

    case "TOGGLE_TRACKING":
      trackingActive = !trackingActive;
      if (!trackingActive && currentTab) {
        const duration = Date.now() - currentTab.startTime;
        queueEvent({
          url: currentTab.url,
          title: currentTab.title,
          timestamp: currentTab.timestamp,
          eventType: "visit",
          duration,
          sessionId,
        });
        currentTab = null;
      }
      sendResponse({ trackingActive });
      break;

    case "GET_TODAY_EVENTS":
      getTodayEvents().then(sendResponse);
      return true; // async response

    case "FORCE_SYNC":
      syncEvents().then(() => sendResponse({ success: true }));
      return true;

    default:
      sendResponse({ error: "Unknown message type" });
  }
});

async function getTodayEvents() {
  const events = (await storage.get("pendingEvents")) || [];
  const today = new Date().toISOString().slice(0, 10);
  return events.filter((e) => e.timestamp && e.timestamp.startsWith(today));
}
