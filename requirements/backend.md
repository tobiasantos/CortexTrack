# CortexTrack - Backend Requirements

## Purpose

The backend is the **brain** of CortexTrack. It receives raw browsing events from the extension, processes them into meaningful features, runs AI-based analysis, and serves insights to the frontend.

---

## Functional Requirements

### API - Event Ingestion

#### BE-FR-01: Receive Browsing Events

- Accept batched browsing events from the extension
- Validate event structure and reject malformed data
- Store raw events in the database
- Return acknowledgment with processed event count

#### BE-FR-02: Authentication & Authorization

- User registration (email + password)
- User login with JWT token issuance
- Token refresh endpoint
- Protect all data endpoints with auth middleware
- Each user can only access their own data

### Data Processing Pipeline

#### BE-FR-03: Site Classification

- Automatically classify sites into categories:
  - **Productive** (e.g., GitHub, Stack Overflow, Docs)
  - **Neutral** (e.g., email, calendar)
  - **Distraction** (e.g., social media, entertainment, news)
- Provide a default classification database
- Allow user to override classifications via API
- Learn from user feedback over time

#### BE-FR-04: Feature Extraction

Transform raw events into analytical features:

| Feature                    | Description                                  |
| -------------------------- | -------------------------------------------- |
| `daily_productive_time`    | Total productive time per day                |
| `daily_distraction_time`   | Total distraction time per day               |
| `peak_focus_hours`         | Hours with highest productive ratio          |
| `peak_distraction_hours`   | Hours with highest distraction ratio         |
| `tab_switch_frequency`     | Tab switches per hour                        |
| `avg_session_duration`     | Average browsing session length              |
| `site_sequence_patterns`   | Common site visit sequences                  |
| `usage_variance`           | Day-to-day consistency of behavior           |

#### BE-FR-05: Focus Score Calculation

- Calculate daily focus score using formula:
  ```
  focus_score = productive_time - (distraction_time * weight)
  ```
- Normalize score to 0-100 range
- Weight is configurable and adapts over time
- Store historical scores for trend analysis

### AI Engine

#### BE-FR-06: Behavioral Change Detection

- Detect when user routine changes significantly
- First version: Z-score and moving average on daily metrics
- Evolved version: Isolation Forest for anomaly detection
- Generate alerts when deviations exceed threshold

#### BE-FR-07: Automated Insight Generation

- Generate natural language insights from detected patterns
- Examples:
  - "Your YouTube usage increased 72% in the mornings compared to your weekly average"
  - "You were 40% more focused on Tuesdays this month"
  - "Your tab switching frequency doubled after 3 PM today"
- Prioritize insights by relevance and severity

#### BE-FR-08: Productivity Risk Prediction

- Predict days with high chance of low productivity
- Based on: day of week, recent trends, session start time patterns
- Provide early warning to user

#### BE-FR-09: Sequential Pattern Detection

- Identify recurring site visit sequences
- Detect distraction chains (e.g., email -> twitter -> youtube)
- Surface patterns the user may not be aware of

### Data Serving

#### BE-FR-10: Dashboard Data API

- Daily/weekly/monthly summaries
- Time series data for charts (hourly, daily granularity)
- Top sites by time spent
- Category breakdown (productive/neutral/distraction)
- Focus score history

#### BE-FR-11: Insights API

- List generated insights with pagination
- Filter by date range, type, severity
- Mark insights as read/dismissed

#### BE-FR-12: Goals & Comparison

- Allow user to set productivity goals (e.g., "4h productive time/day")
- Track progress against goals
- Compare current week vs previous weeks
- Adaptive goal suggestions based on user history

---

## Non-Functional Requirements

### BE-NFR-01: Performance

- Event ingestion endpoint: < 200ms response time
- Dashboard data endpoints: < 500ms response time
- Support batch processing of up to 1000 events per request

### BE-NFR-02: Security

- Passwords hashed with bcrypt
- JWT with short-lived access tokens + refresh tokens
- Rate limiting on auth endpoints
- Input validation and sanitization on all endpoints
- CORS configured for frontend and extension origins only

### BE-NFR-03: Scalability

- Stateless API design (horizontal scaling ready)
- Background job processing for AI analysis (not blocking API responses)
- Database indexing on user_id, timestamps

### BE-NFR-04: Reliability

- Graceful error handling with meaningful error responses
- Database migration system for schema changes
- Health check endpoint

---

## Data Model

### User

```
{
  id: UUID,
  email: string,
  password_hash: string,
  created_at: timestamp,
  preferences: {
    focus_weight: number,
    site_overrides: { url: string, category: string }[],
    goals: { metric: string, target: number }[]
  }
}
```

### BrowsingEvent

```
{
  id: UUID,
  user_id: UUID (FK),
  url: string,
  domain: string,
  title: string,
  event_type: enum,
  timestamp: timestamp,
  duration: integer (ms),
  session_id: string
}
```

### DailySummary

```
{
  id: UUID,
  user_id: UUID (FK),
  date: date,
  productive_time: integer (ms),
  distraction_time: integer (ms),
  neutral_time: integer (ms),
  focus_score: float,
  tab_switches: integer,
  total_sessions: integer,
  top_sites: jsonb
}
```

### Insight

```
{
  id: UUID,
  user_id: UUID (FK),
  type: "anomaly" | "trend" | "pattern" | "prediction",
  severity: "info" | "warning" | "critical",
  message: string,
  data: jsonb,
  created_at: timestamp,
  read: boolean
}
```

### SiteClassification

```
{
  domain: string,
  default_category: "productive" | "neutral" | "distraction",
  user_id: UUID | null,         // null = global default
  user_category: string | null  // user override
}
```

---

## API Endpoints

### Auth

| Method | Endpoint             | Description          |
| ------ | -------------------- | -------------------- |
| POST   | `/api/auth/register` | Create new user      |
| POST   | `/api/auth/login`    | Login, get JWT       |
| POST   | `/api/auth/refresh`  | Refresh access token |

### Events

| Method | Endpoint          | Description              |
| ------ | ----------------- | ------------------------ |
| POST   | `/api/events`     | Submit batch of events   |

### Dashboard

| Method | Endpoint                   | Description                  |
| ------ | -------------------------- | ---------------------------- |
| GET    | `/api/summary/daily`       | Daily summary                |
| GET    | `/api/summary/weekly`      | Weekly summary               |
| GET    | `/api/summary/monthly`     | Monthly summary              |
| GET    | `/api/timeline`            | Hourly time series data      |
| GET    | `/api/top-sites`           | Top sites by time            |
| GET    | `/api/categories`          | Time by category             |
| GET    | `/api/focus-score/history` | Focus score over time        |

### Insights

| Method | Endpoint                    | Description             |
| ------ | --------------------------- | ----------------------- |
| GET    | `/api/insights`             | List insights           |
| PATCH  | `/api/insights/:id`         | Mark as read/dismissed  |

### Goals & Settings

| Method | Endpoint                          | Description                 |
| ------ | --------------------------------- | --------------------------- |
| GET    | `/api/goals`                      | Get user goals              |
| PUT    | `/api/goals`                      | Update goals                |
| GET    | `/api/settings/classifications`   | Get site classifications    |
| PUT    | `/api/settings/classifications`   | Override site classification|
| GET    | `/api/comparison/weekly`          | Compare weeks               |

### System

| Method | Endpoint       | Description       |
| ------ | -------------- | ----------------- |
| GET    | `/api/health`  | Health check      |

---

## Project Structure

```
backend/
  src/
    server.js                  # App entry point
    config/
      database.js
      auth.js
      cors.js
    middleware/
      auth.js                  # JWT verification
      validation.js            # Request validation
      rateLimit.js
    routes/
      auth.routes.js
      events.routes.js
      summary.routes.js
      insights.routes.js
      goals.routes.js
      settings.routes.js
    controllers/
      auth.controller.js
      events.controller.js
      summary.controller.js
      insights.controller.js
      goals.controller.js
    services/
      classification.service.js   # Site classifier
      feature.service.js           # Feature extraction
      focusScore.service.js        # Score calculation
      anomaly.service.js           # Change detection (Z-score, Isolation Forest)
      insight.service.js           # Insight generation
      prediction.service.js        # Risk prediction
      pattern.service.js           # Sequential pattern detection
    models/
      user.model.js
      event.model.js
      summary.model.js
      insight.model.js
      classification.model.js
    jobs/
      dailySummary.job.js          # Nightly aggregation
      insightGeneration.job.js     # Periodic AI analysis
    utils/
      math.js                      # Z-score, moving average helpers
      logger.js
  migrations/
  seeds/
    default-classifications.js     # Default site categories
  tests/
```
