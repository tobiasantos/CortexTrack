# CortexTrack - Frontend Requirements

## Purpose

The frontend is the **visualization and interaction layer**. It presents processed data, AI-generated insights, and productivity metrics through an intuitive dashboard.

---

## Functional Requirements

### Pages & Navigation

#### FE-FR-01: Authentication Pages

- **Login page**: email + password form, link to register
- **Register page**: email + password + confirm password, link to login
- Redirect to dashboard after successful auth
- Show validation errors inline

#### FE-FR-02: Dashboard (Main Page)

The primary view with a daily overview:

- **Focus Score** - large, prominent display with trend indicator (up/down)
- **Today's Summary** - productive time, distraction time, neutral time
- **Category Breakdown** - donut/pie chart (productive vs neutral vs distraction)
- **Hourly Timeline** - bar/area chart showing activity distribution across hours
- **Top Sites** - ranked list with time spent and category badge
- **Active Insights** - latest unread insights with severity indicators
- Date picker to view historical days

#### FE-FR-03: Analytics Page

Deep-dive analytics with longer time ranges:

- **Productivity Heatmap** - grid showing focus intensity by day/hour (like GitHub contributions)
- **Focus Score Trend** - line chart over weeks/months
- **Weekly Comparison** - side-by-side bar charts (this week vs last week)
- **Category Trends** - stacked area chart showing category proportions over time
- **Tab Switch Analysis** - frequency chart correlated with productivity
- Time range selector: 7d, 30d, 90d, custom

#### FE-FR-04: Insights Page

- List of all AI-generated insights
- Filter by type: anomaly, trend, pattern, prediction
- Filter by severity: info, warning, critical
- Mark as read / dismiss
- Each insight card shows:
  - Icon based on type
  - Natural language message
  - Supporting data visualization (mini chart or stat)
  - Timestamp

#### FE-FR-05: Goals Page

- View current goals with progress bars
- Create/edit/delete goals
- Goal types:
  - Daily productive time target
  - Maximum distraction time
  - Focus score target
  - Session count target
- Streak counter for consecutive days meeting goals
- AI-suggested goals based on user history

#### FE-FR-06: Settings Page

- **Profile**: email, change password
- **Site Classifications**: view/override category for any tracked domain
- **Preferences**: default time range, theme (light/dark), notification preferences
- **Data**: export data, delete account

---

## UI Components

### FE-FR-07: Core Components

| Component             | Description                                           |
| --------------------- | ----------------------------------------------------- |
| `ScoreCard`           | Large number display with label, trend arrow, color   |
| `CategoryDonut`       | Donut chart with productive/neutral/distraction       |
| `HourlyTimeline`      | Bar chart with 24 hourly slots, color-coded           |
| `ProductivityHeatmap` | Calendar grid with color intensity per cell           |
| `InsightCard`         | Card with icon, message, mini-viz, actions            |
| `SiteList`            | Ranked list with favicon, domain, time, category tag  |
| `GoalProgress`        | Progress bar with target, current value, streak       |
| `TrendChart`          | Line chart for time series data                       |
| `ComparisonBars`      | Side-by-side bar comparison                           |
| `DateRangePicker`     | Selector for time ranges                              |

### FE-FR-08: Layout

- Responsive sidebar navigation (collapsible on mobile)
- Top bar with user avatar, notifications bell, settings gear
- Main content area with grid-based card layout
- Mobile-first responsive design

---

## Non-Functional Requirements

### FE-NFR-01: Performance

- Initial page load: < 2 seconds
- Dashboard data render: < 1 second after API response
- Lazy load analytics page charts
- Cache API responses with short TTL for navigation between pages

### FE-NFR-02: Responsiveness

- Breakpoints: mobile (< 768px), tablet (768-1024px), desktop (> 1024px)
- Charts resize gracefully
- Sidebar collapses to bottom nav on mobile

### FE-NFR-03: Accessibility

- Semantic HTML elements
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast ratio >= 4.5:1
- Charts include data tables as fallback

### FE-NFR-04: UX

- Loading skeletons while fetching data
- Empty states with helpful messages
- Error states with retry actions
- Smooth transitions between pages
- Tooltips on chart data points

---

## State Management

### Global State

```
{
  auth: {
    user: User | null,
    token: string | null,
    isAuthenticated: boolean
  },
  dashboard: {
    summary: DailySummary,
    timeline: HourlyData[],
    topSites: SiteEntry[],
    focusScore: number,
    selectedDate: Date
  },
  analytics: {
    heatmap: HeatmapData[],
    trends: TrendData[],
    comparison: ComparisonData,
    dateRange: { start: Date, end: Date }
  },
  insights: {
    items: Insight[],
    filters: { type: string[], severity: string[] },
    unreadCount: number
  },
  goals: {
    items: Goal[],
    suggestions: Goal[]
  },
  settings: {
    classifications: SiteClassification[],
    preferences: UserPreferences
  }
}
```

---

## Pages Structure

```
frontend/
  src/
    app/
      layout.tsx              # Root layout with sidebar
      page.tsx                # Dashboard (main page)
      login/
        page.tsx
      register/
        page.tsx
      analytics/
        page.tsx
      insights/
        page.tsx
      goals/
        page.tsx
      settings/
        page.tsx
    components/
      ui/                     # Base UI components (buttons, inputs, cards)
      charts/
        CategoryDonut.tsx
        HourlyTimeline.tsx
        ProductivityHeatmap.tsx
        TrendChart.tsx
        ComparisonBars.tsx
      dashboard/
        ScoreCard.tsx
        DailySummary.tsx
        TopSites.tsx
      insights/
        InsightCard.tsx
        InsightList.tsx
      goals/
        GoalProgress.tsx
        GoalForm.tsx
      layout/
        Sidebar.tsx
        TopBar.tsx
        MobileNav.tsx
    hooks/
      useAuth.ts
      useDashboard.ts
      useAnalytics.ts
      useInsights.ts
      useGoals.ts
    services/
      api.ts                  # Axios/fetch client with auth interceptor
      auth.service.ts
      dashboard.service.ts
      analytics.service.ts
      insights.service.ts
      goals.service.ts
    lib/
      utils.ts
      constants.ts
      formatters.ts           # Time, score, percentage formatters
    styles/
      globals.css
      theme.ts                # Color tokens, spacing, typography
    types/
      index.ts                # Shared TypeScript interfaces
  public/
    favicon.ico
    logo.svg
```
