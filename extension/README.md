# CortexTrack - Chrome Extension

Chrome extension that collects browsing behavior data to power the CortexTrack AI behavior analyzer.

## Setup

```bash
npm install
npm run build     # production build → dist/
npm run dev       # watch mode for development
```

Load the extension in Chrome: `chrome://extensions` → Enable **Developer mode** → **Load unpacked** → select the `dist/` folder.

## Architecture

```
popup (React UI)  ←— chrome.runtime.sendMessage —→  service-worker (background)
                                                          ↓
                                                   chrome.storage.local
                                                          ↓
                                                   Backend API (batch sync)
```

The extension has two main components:

- **Service Worker** (`src/background/service-worker.js`) — runs persistently in the background, listens to Chrome events, and queues browsing data.
- **Popup** (`src/popup/`) — React app that displays today's summary, communicates with the service worker via message passing.

## How Data Tracking Works

### Tab Visits

The service worker uses two Chrome APIs to detect navigation:

1. **`chrome.tabs.onActivated`** — fires when the user switches to a different tab. The listener calls `chrome.tabs.get()` to retrieve the tab's URL and title.
2. **`chrome.tabs.onUpdated`** — fires when a tab finishes loading (`changeInfo.status === "complete"`). Only tracked if the tab is the currently active one. This catches in-tab navigations (e.g., clicking a link within the same tab).

When a tab change is detected, the service worker:

1. Calculates the **duration** the user spent on the previous tab (`Date.now() - startTime`).
2. Queues a `"visit"` event for the previous tab with its URL, title, timestamp, and duration.
3. Starts tracking the new tab by storing its metadata and `startTime`.

Internal Chrome URLs (`chrome://`, `chrome-extension://`) are ignored.

### Idle Detection

Uses `chrome.idle.onStateChanged` with a configurable threshold (default: 60 seconds).

- When the state changes to `"idle"` or `"locked"`, the current tab tracking is finalized and an `"idle_start"` event is queued. This prevents inflating time on a site the user walked away from.
- When the state returns to `"active"`, an `"idle_end"` event is queued to mark the resume point.

### Session Management

Each browsing session gets a unique `sessionId` generated at service worker startup (`{timestamp}-{random}`). All events within a session share this ID, allowing the backend to group activity into sessions. A new session begins every time the service worker restarts (browser opened, extension reloaded, etc.).

### Event Queue & Sync

Events are not sent individually. They are appended to a `pendingEvents` array in `chrome.storage.local`. A `chrome.alarms` alarm triggers every 5 minutes to batch-sync the queue to the backend API. Events are only cleared from the queue after successful delivery.

### Popup Communication

The popup cannot access background state directly. It uses `chrome.runtime.sendMessage` with these message types:

| Message Type       | Direction        | Description                          |
| ------------------ | ---------------- | ------------------------------------ |
| `GET_STATUS`       | popup → bg       | Returns tracking state and current tab |
| `TOGGLE_TRACKING`  | popup → bg       | Pauses/resumes tracking              |
| `GET_TODAY_EVENTS` | popup → bg       | Returns today's events from the queue |
| `FORCE_SYNC`       | popup → bg       | Triggers immediate sync to backend   |

## Event Data Model

Each queued event has the following shape:

```json
{
  "url": "https://github.com",
  "title": "GitHub",
  "timestamp": "2026-02-25T14:30:00.000Z",
  "eventType": "visit",
  "duration": 45000,
  "sessionId": "1740494000000-a1b2c3d"
}
```

**Event types:**
- `visit` — user spent time on a tab (has duration)
- `tab_switch` — reserved for future tab-switch-frequency analysis
- `tab_close` — reserved for future use
- `idle_start` — user went idle (has duration of active time before idle)
- `idle_end` — user returned from idle (duration: 0)

## Known Limitations

### Service Worker Lifecycle

Manifest V3 service workers are **not persistent**. Chrome may terminate the service worker after ~30 seconds of inactivity. When this happens:

- The in-memory `currentTab` variable is lost, so the duration of the active tab at that moment is not captured.
- The `sessionId` is regenerated on restart, creating a new session even though the user never closed the browser.
- `chrome.alarms` keeps running and will wake the service worker for sync, but any tab that was being timed is lost.

**Impact:** Short gaps in tracking data and slightly inaccurate durations for long-idle tabs.

### Active Time vs Wall Time

Duration is calculated as `Date.now() - startTime`, which measures **wall clock time**, not active interaction time. If a user has a tab open but is using a different application (e.g., VS Code), the tab still accumulates time until:

- The user switches to another Chrome tab (triggers `onActivated`), or
- The idle detection kicks in (default: 60s of no mouse/keyboard input in Chrome).

**Impact:** Time spent on the last active tab before switching to another app may be overestimated by up to the idle threshold (60s).

### No Cross-Window Tracking

`chrome.tabs.onActivated` fires per-window. If the user has multiple Chrome windows, only tab switches within the focused window are captured. Switching between windows may not generate events unless the user also switches tabs.

### Browser Closure

When Chrome is closed abruptly, there is no guaranteed shutdown event in Manifest V3. The currently active tab's visit event may never be finalized, causing the last few minutes of activity to be lost.

### URL-Only Tracking

The extension only captures URLs and page titles. It does **not** capture:

- Page content, text selections, or form inputs
- Scroll depth or click interactions
- Incognito/private browsing tabs (unless explicitly allowed by the user in Chrome settings)

### Storage Limits

`chrome.storage.local` has a default quota of ~10 MB. If the backend is unreachable for an extended period and events accumulate, the queue could eventually hit this limit. No eviction strategy is currently implemented.

## Tech Stack

- **React 19** — popup UI
- **Tailwind CSS 4** — styling
- **Webpack 5** — bundling (common/dev/prod configs)
- **Babel** — JSX and ES6+ transpilation
- **Manifest V3** — Chrome extension platform

## Project Structure

```
src/
├── assets/
│   └── tailwind.css
├── background/
│   └── service-worker.js       # Event tracking, idle detection, sync
├── popup/
│   ├── popup.html
│   ├── index.jsx               # React entry point
│   ├── App.jsx                 # Popup UI
│   └── useTracker.js           # Hook for background communication
├── utils/
│   ├── api.js                  # Backend HTTP client
│   ├── constants.js            # Config (API URL, thresholds)
│   └── storage.js              # chrome.storage.local wrapper
└── static/
    ├── manifest.json
    └── icons/
```
