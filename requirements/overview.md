# CortexTrack - Project Overview

## Vision

CortexTrack is an AI-powered behavior analyzer that learns users' digital patterns and detects relevant behavioral changes. It goes beyond a simple tracker to become an **intelligent assistant** that understands focus patterns, detects distractions, alerts on routine changes, and suggests improvements.

## Architecture

The project is split into **3 independent components**:

| Component       | Description                                      |
| --------------- | ------------------------------------------------ |
| **Extension**   | Chrome extension that collects browsing data      |
| **Backend**     | API server with data processing and AI engine     |
| **Frontend**    | Web dashboard for visualization and insights      |

## Data Flow

```
[Chrome Extension] ---> [Backend API] ---> [Frontend Dashboard]
     (collect)          (process + AI)       (visualize)
```

1. **Extension** captures raw browsing events (visits, tab switches, session times)
2. **Backend** receives events, processes them into features, runs AI analysis, and generates insights
3. **Frontend** displays dashboards, scores, insights, and trends to the user

## Core Capabilities

- Real-time browsing data collection
- Automatic site classification (productive / neutral / distraction)
- Focus score calculation
- Behavioral change detection
- Automated insight generation
- Productivity heatmaps and trend visualization
- Adaptive goal system
- Weekly comparison reports

## Roadmap Reference

| Phase       | Focus                              |
| ----------- | ---------------------------------- |
| Weeks 1-2   | Extension + data collection        |
| Week 3      | Structured logs + database         |
| Week 4      | Basic dashboard                    |
| Week 5      | Anomaly detection algorithm        |
| Week 6      | Automated insights                 |
| Week 7      | Optimization + refined UI          |
| Week 8      | Deploy + documentation             |
