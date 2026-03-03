const mongoose = require("mongoose");
const DailySummary = require("../models/DailySummary");
const Event = require("../models/Event");
const dailySummaryService = require("../services/dailySummary.service");
const featureService = require("../services/feature.service");
const classificationService = require("../services/classification.service");
const { dayBounds } = require("../utils/date");

function getTz(req) {
  return parseInt(req.query.tz) || 0;
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function daily(req, res, next) {
  try {
    const date = req.query.date || todayStr();
    const tz = getTz(req);
    const summary = await dailySummaryService.getOrCompute(req.user.id, date, tz);
    if (!summary) return res.json(null);
    res.json(summary);
  } catch (err) {
    next(err);
  }
}

async function weekly(req, res, next) {
  try {
    const endDate = req.query.date || todayStr();
    const tz = getTz(req);
    const end = new Date(endDate);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);

    const dates = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().slice(0, 10));
    }

    const summaries = await Promise.all(
      dates.map((date) => dailySummaryService.getOrCompute(req.user.id, date, tz))
    );

    res.json(summaries.filter(Boolean));
  } catch (err) {
    next(err);
  }
}

async function monthly(req, res, next) {
  try {
    const month = req.query.month || todayStr().slice(0, 7); // YYYY-MM
    const summaries = await DailySummary.find({
      user: req.user.id,
      date: { $regex: `^${month}` },
    })
      .sort({ date: 1 })
      .lean();

    res.json(summaries);
  } catch (err) {
    next(err);
  }
}

async function timeline(req, res, next) {
  try {
    const date = req.query.date || todayStr();
    const tz = getTz(req);
    const features = await featureService.getDailyFeatures(req.user.id, date, tz);
    if (!features) return res.json([]);
    res.json(features.timeline);
  } catch (err) {
    next(err);
  }
}

async function topSites(req, res, next) {
  try {
    const { period = "day", date } = req.query;
    const tz = getTz(req);
    const targetDate = date || todayStr();

    if (period === "day") {
      const features = await featureService.getDailyFeatures(req.user.id, targetDate, tz);
      return res.json(features ? features.topSites : []);
    }

    // For week/month, aggregate from events directly
    const end = new Date(targetDate);
    const start = new Date(end);
    if (period === "week") start.setDate(start.getDate() - 6);
    else start.setDate(1); // first of month

    const startBounds = dayBounds(start.toISOString().slice(0, 10), tz);
    const endBounds = dayBounds(end.toISOString().slice(0, 10), tz);

    const results = await Event.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user.id),
          eventType: "visit",
          timestamp: { $gte: startBounds.start, $lte: endBounds.end },
        },
      },
      { $group: { _id: "$domain", time: { $sum: "$duration" } } },
      { $sort: { time: -1 } },
      { $limit: 10 },
    ]);

    // Add categories
    const domains = results.map((r) => r._id);
    const categoryMap = await classificationService.classifyMany(domains, req.user.id);

    const sites = results.map((r) => ({
      domain: r._id,
      time: r.time,
      category: categoryMap.get(r._id) || "neutral",
    }));

    res.json(sites);
  } catch (err) {
    next(err);
  }
}

async function categories(req, res, next) {
  try {
    const { period = "day", date } = req.query;
    const tz = getTz(req);
    const targetDate = date || todayStr();

    if (period === "day") {
      const summary = await dailySummaryService.getOrCompute(req.user.id, targetDate, tz);
      if (!summary) return res.json({ productive: 0, neutral: 0, distraction: 0 });
      return res.json({
        productive: summary.productiveTime,
        neutral: summary.neutralTime,
        distraction: summary.distractionTime,
      });
    }

    // Week/month: sum from DailySummary
    const end = new Date(targetDate);
    const start = new Date(end);
    if (period === "week") start.setDate(start.getDate() - 6);
    else start.setDate(1);

    const summaries = await DailySummary.find({
      user: req.user.id,
      date: {
        $gte: start.toISOString().slice(0, 10),
        $lte: end.toISOString().slice(0, 10),
      },
    }).lean();

    const totals = summaries.reduce(
      (acc, s) => ({
        productive: acc.productive + s.productiveTime,
        neutral: acc.neutral + s.neutralTime,
        distraction: acc.distraction + s.distractionTime,
      }),
      { productive: 0, neutral: 0, distraction: 0 }
    );

    res.json(totals);
  } catch (err) {
    next(err);
  }
}

async function focusScoreHistory(req, res, next) {
  try {
    const days = parseInt(req.query.days) || 30;
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - days + 1);

    const summaries = await DailySummary.find({
      user: req.user.id,
      date: {
        $gte: start.toISOString().slice(0, 10),
        $lte: end.toISOString().slice(0, 10),
      },
      focusScore: { $ne: null },
    })
      .sort({ date: 1 })
      .lean();

    res.json(summaries.map((s) => ({ date: s.date, score: s.focusScore })));
  } catch (err) {
    next(err);
  }
}

module.exports = { daily, weekly, monthly, timeline, topSites, categories, focusScoreHistory };
