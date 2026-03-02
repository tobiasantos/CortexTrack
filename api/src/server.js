require("dotenv").config();

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const { corsMiddleware } = require("./config/cors");
const { connectDB } = require("./config/database");
const logger = require("./utils/logger");
const { scheduleDailySummaryJob } = require("./jobs/dailySummary.job");
const { authenticate } = require("./middleware/auth");

const authRoutes = require("./routes/auth.routes");
const eventsRoutes = require("./routes/events.routes");
const summaryRoutes = require("./routes/summary.routes");
const { handlers: summaryHandlers } = require("./routes/summary.routes");
const insightsRoutes = require("./routes/insights.routes");
const goalsRoutes = require("./routes/goals.routes");
const settingsRoutes = require("./routes/settings.routes");
const { weeklyComparison } = require("./controllers/goals.controller");

const app = express();
const PORT = process.env.PORT || 3000;

app.use("/api", corsMiddleware);
app.use(express.json({ limit: "5mb" }));

// --- Routes ---
app.get("/api/health", async (_req, res) => {
  const dbState = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.json({ status: "ok", db: dbState, uptime: process.uptime() });
});

app.use("/api/auth", authRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/summary", summaryRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api/goals", goalsRoutes);
app.use("/api/settings", settingsRoutes);

// Top-level dashboard routes (per API spec)
app.get("/api/timeline", authenticate, summaryHandlers.timeline);
app.get("/api/top-sites", authenticate, summaryHandlers.topSites);
app.get("/api/categories", authenticate, summaryHandlers.categories);
app.get("/api/focus-score/history", authenticate, summaryHandlers.focusScoreHistory);
app.get("/api/comparison/weekly", authenticate, weeklyComparison);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const staticPath = path.join(__dirname, "../public");
  app.use(express.static(staticPath));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });
}

// --- Global error handler ---
app.use((err, _req, res, _next) => {
  logger.error(err.stack || err.message);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Internal server error",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

// --- Start ---
async function start() {
  await connectDB();
  scheduleDailySummaryJob();

  app.listen(PORT, () => {
    logger.info(`CortexTrack API running on port ${PORT}`);
  });
}

start().catch((err) => {
  logger.error("Failed to start server:", err);
  process.exit(1);
});
