# CortexTrack - Chrome Extension Requirements

## Purpose

The Chrome extension is the **data collection layer**. It runs in the background, captures browsing behavior events, and sends them to the backend API.

---

## Functional Requirements

### EXT-FR-01: Track Site Visits

- Capture every page navigation (URL, page title, timestamp)
- Detect when a tab becomes active or loses focus
- Ignore internal Chrome pages (`chrome://`, `chrome-extension://`)

### EXT-FR-02: Track Time Spent

- Measure active time on each site/tab
- Pause tracking when the browser is idle or minimized
- Handle tab switching accurately (stop timer on old tab, start on new)

### EXT-FR-03: Session Management

- Detect browsing session start (browser opened / first tab activity)
- Detect browsing session end (browser closed / prolonged idle)
- Track total session duration

### EXT-FR-04: Tab Switching Tracking

- Log every tab switch event with timestamps
- Calculate tab switch frequency per session
- Identify rapid tab alternation patterns (possible distraction signal)

### EXT-FR-05: Data Sync with Backend

- Send collected events to the backend API in batches
- Queue events locally when offline
- Retry failed syncs automatically when connection is restored
- Use authentication token for API requests

### EXT-FR-06: User Authentication

- Provide login/signup flow via extension popup
- Store auth token securely in `chrome.storage`
- Handle token expiration and refresh

### EXT-FR-07: Extension Popup UI

- Show current tracking status (active / paused)
- Display today's summary: total time, top sites, focus score
- Provide toggle to pause/resume tracking
- Show connection status with backend

### EXT-FR-08: User Preferences

- Allow user to configure:
  - Sites to exclude from tracking (allowlist/blocklist)
  - Idle timeout threshold
  - Data sync frequency
- Persist preferences in `chrome.storage.sync`

---

## Non-Functional Requirements

### EXT-NFR-01: Performance

- Background scripts must have minimal CPU and memory footprint
- Batch events before sending (avoid per-event API calls)
- No visible impact on browser performance

### EXT-NFR-02: Privacy

- Never capture page content, form data, or passwords
- Only collect: URL, title, timestamps, tab events
- All data transmitted over HTTPS
- Local data cleared on user request

### EXT-NFR-03: Reliability

- Persist unsent events in `chrome.storage.local` to survive browser restarts
- Gracefully handle API downtime without data loss

### EXT-NFR-04: Compatibility

- Support Chrome (Manifest V3)
- Target Chrome version 110+

---

## Data Model

### BrowsingEvent

```
{
  url: string,
  title: string,
  timestamp: ISO 8601 string,
  eventType: "visit" | "tab_switch" | "tab_close" | "idle_start" | "idle_end",
  duration: number (ms),       // for completed visits
  sessionId: string
}
```

---

## Chrome APIs Used

| API                       | Purpose                          |
| ------------------------- | -------------------------------- |
| `chrome.tabs`             | Track active tab and switches    |
| `chrome.idle`             | Detect idle state                |
| `chrome.storage.local`    | Queue events locally             |
| `chrome.storage.sync`     | Sync user preferences            |
| `chrome.alarms`           | Schedule batch sync              |
| `chrome.runtime`          | Lifecycle events, messaging      |

---

## Extension Structure

```
extension/
  manifest.json
  background/
    service-worker.js       # Main event tracking logic
  popup/
    popup.html
    popup.js                # Popup UI logic
    popup.css
  options/
    options.html
    options.js              # User preferences page
    options.css
  utils/
    api.js                  # Backend API client
    storage.js              # Storage helpers
    auth.js                 # Authentication logic
  assets/
    icon-16.png
    icon-48.png
    icon-128.png
```
