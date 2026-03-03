const DailySummary = require("../models/DailySummary");
const featureService = require("./feature.service");
const focusScoreService = require("./focusScore.service");

/**
 * Get or compute a DailySummary for a user on a specific date.
 * For today: always recompute from events (data is still arriving).
 * For past dates: use cached summary if available.
 */
async function getOrCompute(userId, dateStr, tzOffset = 0) {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const isToday = dateStr === today;

  // Use cache only for past dates
  if (!isToday) {
    const cached = await DailySummary.findOne({ user: userId, date: dateStr }).lean();
    if (cached) return cached;
  }

  // Compute from raw events
  const features = await featureService.getDailyFeatures(userId, dateStr, tzOffset);
  if (!features) return null;

  const focusScore = await focusScoreService.calculate(features, userId);

  const summary = await DailySummary.findOneAndUpdate(
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
