# CortexTrack - Backend API

REST API that receives browsing events from the Chrome extension, classifies sites, calculates focus scores, and serves dashboard data.

## Setup

```bash
npm install
```

### Start MongoDB with Docker

```bash
docker compose up -d mongo
```

### Seed default site classifications

```bash
npm run seed
```

### Run the API

```bash
npm run dev       # development (nodemon, auto-reload)
npm start         # production
```

The API runs on `http://localhost:3000` by default.

### Full stack with Docker Compose

```bash
docker compose up       # MongoDB + API together
```

## Environment Variables

Copy `.env.example` to `.env` and adjust as needed:

| Variable               | Default                                    | Description                        |
| ---------------------- | ------------------------------------------ | ---------------------------------- |
| `PORT`                 | `3000`                                     | API server port                    |
| `MONGODB_URI`          | `mongodb://localhost:27017/cortextrack`     | MongoDB connection string          |
| `JWT_SECRET`           | —                                          | Secret for signing JWTs            |
| `JWT_EXPIRES_IN`       | `15m`                                      | Access token lifetime              |
| `JWT_REFRESH_EXPIRES_IN` | `7d`                                     | Refresh token lifetime             |
| `CORS_ORIGINS`         | `http://localhost:5173,chrome-extension://` | Allowed origins (comma-separated)  |

## Architecture

```
Extension (batch POST every 5 min)
        ↓
   POST /api/events
        ↓
┌───────────────────────────────────────────┐
│  Express API                              │
│                                           │
│  middleware/auth.js ── JWT verification    │
│  middleware/validation.js ── Joi schemas   │
│  middleware/rateLimit.js ── rate limiting  │
│                                           │
│  controllers/ ── request handling         │
│  services/ ── business logic              │
│  models/ ── Mongoose schemas              │
│  jobs/ ── scheduled tasks (node-cron)     │
└───────────────────────────────────────────┘
        ↓
   MongoDB (events, summaries, insights)
```

### Request lifecycle

1. Request hits Express with CORS and JSON parsing middleware.
2. Auth middleware verifies the JWT and attaches `req.user`.
3. Validation middleware checks the request body against a Joi schema.
4. Controller delegates to the appropriate service.
5. Service interacts with Mongoose models and returns data.
6. Controller sends the JSON response.

### Data processing pipeline

When browsing events arrive via `POST /api/events`:

1. **Ingestion** — events are validated, the `domain` is extracted from each URL server-side, and all events are bulk-inserted with `Event.insertMany()`.
2. **Classification** — each domain is classified as `productive`, `neutral`, or `distraction` using a default database of ~55 sites. Users can override any classification.
3. **Feature extraction** — on-demand (lazy) or via nightly cron job. Raw events are aggregated into daily features: time by category, hourly breakdown, top sites, tab switches, session count.
4. **Focus score** — calculated from the formula `raw = productiveTime - (distractionTime * weight)`, normalized to 0–100. Weight is per-user configurable (default: 1.5).
5. **Daily summary** — computed features and focus score are cached in a `DailySummary` document. Subsequent requests return the cached version.

### Lazy computation

Dashboard endpoints don't require pre-computed data. If a `DailySummary` for a requested date doesn't exist, the service computes it on the fly from raw events and caches the result. The nightly cron job (00:15 UTC) pre-computes yesterday's summaries for all active users.

## API Endpoints

### System

| Method | Endpoint       | Auth | Description                          |
| ------ | -------------- | ---- | ------------------------------------ |
| GET    | `/api/health`  | No   | Returns `{ status, db, uptime }`     |

### Authentication

| Method | Endpoint             | Auth | Description                           |
| ------ | -------------------- | ---- | ------------------------------------- |
| POST   | `/api/auth/register` | No   | Create account. Body: `{ email, password }`. Returns JWT + refresh token. |
| POST   | `/api/auth/login`    | No   | Login. Body: `{ email, password }`. Returns JWT + refresh token. |
| POST   | `/api/auth/refresh`  | No   | Body: `{ refreshToken }`. Returns new JWT + refresh token. |

Rate limited to 10 requests/minute.

### Event Ingestion

| Method | Endpoint      | Auth | Description                                  |
| ------ | ------------- | ---- | -------------------------------------------- |
| POST   | `/api/events` | Yes  | Submit batch of events (max 1000). Returns `{ received: N }`. |

**Event body** (array):

```json
[
  {
    "url": "https://github.com",
    "title": "GitHub",
    "timestamp": "2026-02-25T14:30:00.000Z",
    "eventType": "visit",
    "duration": 45000,
    "sessionId": "1740494000000-a1b2c3d"
  }
]
```

Event types: `visit`, `tab_switch`, `tab_close`, `idle_start`, `idle_end`.

### Dashboard

All dashboard endpoints require authentication.

| Method | Endpoint                   | Query Params                   | Description                          |
| ------ | -------------------------- | ------------------------------ | ------------------------------------ |
| GET    | `/api/summary/daily`       | `date=YYYY-MM-DD`             | Daily summary (lazy computed)        |
| GET    | `/api/summary/weekly`      | `date=YYYY-MM-DD`             | 7 daily summaries ending on date     |
| GET    | `/api/summary/monthly`     | `month=YYYY-MM`               | All summaries for the month          |
| GET    | `/api/timeline`            | `date=YYYY-MM-DD`             | 24-hour breakdown (productive/neutral/distraction per hour) |
| GET    | `/api/top-sites`           | `period=day\|week\|month`, `date` | Top 10 domains by time spent         |
| GET    | `/api/categories`          | `period=day\|week\|month`, `date` | Total time by category               |
| GET    | `/api/focus-score/history` | `days=30`                      | Array of `{ date, score }`           |

### Insights

| Method | Endpoint            | Query Params                      | Description                    |
| ------ | ------------------- | --------------------------------- | ------------------------------ |
| GET    | `/api/insights`     | `type`, `severity`, `limit`, `offset` | List insights (paginated). Returns `{ items, total, unreadCount }`. |
| PATCH  | `/api/insights/:id` | —                                 | Mark insight as read           |

### Goals & Comparison

| Method | Endpoint                 | Description                                    |
| ------ | ------------------------ | ---------------------------------------------- |
| GET    | `/api/goals`             | Get user's productivity goals                  |
| PUT    | `/api/goals`             | Update goals. Body: `[{ metric, target }]`     |
| GET    | `/api/comparison/weekly` | This week vs last week (productive/distraction/focus score) |

### Settings

| Method | Endpoint                        | Description                                              |
| ------ | ------------------------------- | -------------------------------------------------------- |
| GET    | `/api/settings/classifications` | All site classifications (defaults + user overrides)     |
| PUT    | `/api/settings/classifications` | Override a domain's category. Body: `{ domain, category }` |

## Data Models

### User

```
email           string (unique)
passwordHash    string (bcrypt)
refreshToken    string
preferences
  focusWeight     number (default: 1.5)
  siteOverrides   [{ domain, category }]
  goals           [{ metric, target }]
createdAt       Date
```

### Event

```
user        ObjectId (ref: User)
url         string
domain      string (extracted server-side)
title       string
eventType   "visit" | "tab_switch" | "tab_close" | "idle_start" | "idle_end"
timestamp   Date
duration    number (ms)
sessionId   string
```

Indexes: `{ user, timestamp }`, `{ user, domain }`

### DailySummary

```
user            ObjectId (ref: User)
date            string "YYYY-MM-DD"
productiveTime  number (ms)
distractionTime number (ms)
neutralTime     number (ms)
focusScore      number (0–100, nullable)
tabSwitches     number
totalSessions   number
topSites        [{ domain, time, category }]
```

Index: `{ user, date }` (unique)

### Insight

```
user       ObjectId (ref: User)
type       "anomaly" | "trend" | "pattern" | "prediction"
severity   "info" | "warning" | "critical"
message    string
data       Mixed (JSON)
read       boolean (default: false)
createdAt  Date
```

Index: `{ user, createdAt }`

### SiteClassification

```
domain          string
defaultCategory "productive" | "neutral" | "distraction"
user            ObjectId (nullable — null = global default)
userCategory    string (nullable — user override)
```

Index: `{ domain, user }` (unique)

## Focus Score Formula

```
raw   = productiveTime - (distractionTime * weight)
score = clamp(raw / totalActiveTime * 100 + 50, 0, 100)
```

- `weight` defaults to 1.5, configurable per user via `preferences.focusWeight`.
- A score of 50 means productive and distraction time are balanced.
- Score > 50 means the user spent more time on productive sites.
- If there is no activity for a day, the score is `null` (not 0).

## Site Classification

The seed database (`src/seeds/default-classifications.js`) includes ~55 domains pre-classified:

- **Productive**: github.com, stackoverflow.com, developer.mozilla.org, notion.so, figma.com, leetcode.com, etc.
- **Neutral**: mail.google.com, calendar.google.com, slack.com, discord.com, google.com, wikipedia.org, etc.
- **Distraction**: youtube.com, twitter.com, reddit.com, instagram.com, netflix.com, tiktok.com, etc.

Classification priority: **user override > global default > "neutral" fallback**.

Users can override any domain via `PUT /api/settings/classifications`. Unrecognized domains default to `neutral`.

## Project Structure

```
src/
├── server.js                       # Entry point, Express app, route mounting
├── config/
│   ├── database.js                 # Mongoose connection
│   ├── auth.js                     # JWT config (secret, expiry)
│   └── cors.js                     # CORS whitelist
├── middleware/
│   ├── auth.js                     # JWT verification → req.user
│   ├── validation.js               # Joi schemas & validate() middleware
│   └── rateLimit.js                # express-rate-limit for auth endpoints
├── models/
│   ├── User.js
│   ├── Event.js
│   ├── DailySummary.js
│   ├── Insight.js
│   └── SiteClassification.js
├── routes/
│   ├── auth.routes.js
│   ├── events.routes.js
│   ├── summary.routes.js
│   ├── insights.routes.js
│   ├── goals.routes.js
│   └── settings.routes.js
├── controllers/
│   ├── auth.controller.js          # register, login, refresh
│   ├── events.controller.js        # batch ingestion
│   ├── summary.controller.js       # dashboard data endpoints
│   ├── insights.controller.js      # list, mark read
│   └── goals.controller.js         # goals CRUD, weekly comparison
├── services/
│   ├── classification.service.js   # classify / classifyMany / user overrides
│   ├── feature.service.js          # daily feature extraction from raw events
│   ├── focusScore.service.js       # focus score calculation
│   └── dailySummary.service.js     # getOrCompute (lazy caching)
├── jobs/
│   └── dailySummary.job.js         # Nightly cron (00:15 UTC)
├── seeds/
│   ├── default-classifications.js  # ~55 pre-classified domains
│   └── run.js                      # Seed runner script
└── utils/
    ├── math.js                     # mean, stddev, zScore, movingAverage, clamp
    └── logger.js                   # Winston logger
```

## Tech Stack

- **Express 4** — HTTP framework
- **Mongoose 8** — MongoDB ODM
- **MongoDB 7** — document database (via Docker)
- **jsonwebtoken** — JWT authentication
- **bcryptjs** — password hashing
- **Joi** — request validation
- **express-rate-limit** — rate limiting
- **node-cron** — scheduled jobs
- **Winston** — structured logging
- **nodemon** — development auto-reload
