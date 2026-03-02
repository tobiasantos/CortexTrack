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
    queueEvent({
      url: "",
      title: "",
      timestamp: timestamp(),
      eventType: "idle_end",
      duration: 0,
      sessionId,
    });
  }
});

// --- Event Queue ---

async function queueEvent(event) {
  const events = (await storage.get("pendingEvents")) || [];
  events.push(event);
  await storage.set("pendingEvents", events);
}

// --- Batch Sync ---

chrome.alarms.create("syncEvents", {
  periodInMinutes: SYNC_INTERVAL_MINUTES,
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "syncEvents") {
    syncEvents();
  }
});

async function syncEvents() {
  const events = (await storage.get("pendingEvents")) || [];
  if (events.length === 0) return;

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

// --- Startup ---

chrome.runtime.onInstalled.addListener(() => {
  console.log("[CortexTrack] Extension installed");
  storage.set("pendingEvents", []);
});
