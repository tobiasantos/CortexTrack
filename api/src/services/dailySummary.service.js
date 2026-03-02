const DailySummary = require("../models/DailySummary");
const featureService = require("./feature.service");
const focusScoreService = require("./focusScore.service");

/**
 * Get or compute a DailySummary for a user on a specific date.
 * Lazy: if the summary doesn't exist, compute it from events and cache.
 */
async function getOrCompute(userId, dateStr) {
  // Try cached summary first
  let summary = await DailySummary.findOne({ user: userId, date: dateStr }).lean();
  if (summary) return summary;

  // Compute from raw events
  const features = await featureService.getDailyFeatures(userId, dateStr);
  if (!features) return null;

  const focusScore = await focusScoreService.calculate(features, userId);

  summary = await DailySummary.findOneAndUpdate(
    { user: userId, date: dateStr },
    {
      user: userId,
      date: dateStr,
      productiveTime: features.productiveTime,
      distractionTime: features.distractionTime,
      neutralTime: features.neutralTime,
      focusScore,
      tabSwitches: features.tabSwitches,
      totalSessions: features.totalSessions,
      topSites: features.topSites,
    },
    { upsert: true, new: true }
  );

  return summary.toObject();
}

/**
 * Compute daily summary for a given user and date (used by the cron job).
 */
async function computeAndStore(userId, dateStr) {
  return getOrCompute(userId, dateStr);
}

module.exports = { getOrCompute, computeAndStore };
