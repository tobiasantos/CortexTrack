const Event = require("../models/Event");
const classificationService = require("./classification.service");
const { dayBounds } = require("../utils/date");

/**
 * Extract daily features for a user on a given date.
 * Returns aggregated metrics used for DailySummary and dashboard.
 * @param {string} userId
 * @param {string} dateStr - YYYY-MM-DD (local calendar day)
 * @param {number} [tzOffset=0] - Client timezone offset in minutes
 */
async function getDailyFeatures(userId, dateStr, tzOffset = 0) {
  const { start: dayStart, end: dayEnd } = dayBounds(dateStr, tzOffset);

  const events = await Event.find({
    user: userId,
    timestamp: { $gte: dayStart, $lte: dayEnd },
  }).lean();

  if (!events.length) return null;

  // Collect all unique domains and classify them
  const visitEvents = events.filter((e) => e.eventType === "visit");
  const domains = [...new Set(visitEvents.map((e) => e.domain))];
  const categoryMap = await classificationService.classifyMany(domains, userId);

  // Aggregate time by category
  let productiveTime = 0;
  let distractionTime = 0;
  let neutralTime = 0;

  // Aggregate time by domain
  const domainTime = new Map();

  // Hourly breakdown (24 buckets)
  const hourlyProductive = new Array(24).fill(0);
  const hourlyDistraction = new Array(24).fill(0);
  const hourlyNeutral = new Array(24).fill(0);

  for (const event of visitEvents) {
    const category = categoryMap.get(event.domain) || "neutral";
    const duration = event.duration || 0;
    // Convert UTC timestamp to local hour using the client's timezone offset
    const utcMs = new Date(event.timestamp).getTime();
    const hour = new Date(utcMs - tzOffset * 60000).getUTCHours();

    // Category totals
    if (category === "productive") {
      productiveTime += duration;
      hourlyProductive[hour] += duration;
    } else if (category === "distraction") {
      distractionTime += duration;
      hourlyDistraction[hour] += duration;
    } else {
      neutralTime += duration;
      hourlyNeutral[hour] += duration;
    }

    // Domain totals
    domainTime.set(event.domain, (domainTime.get(event.domain) || 0) + duration);
  }

  // Top sites (sorted by time, with category)
  const topSites = [...domainTime.entries()]
    .map(([domain, time]) => ({
      domain,
      time,
      category: categoryMap.get(domain) || "neutral",
    }))
    .sort((a, b) => b.time - a.time)
    .slice(0, 10);

  // Tab switches: count tab_switch events or approximate from visit events
  const tabSwitches = events.filter((e) => e.eventType === "tab_switch").length || visitEvents.length;

  // Unique sessions
  const sessions = new Set(events.map((e) => e.sessionId));

  // Hourly timeline
  const timeline = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    productive: hourlyProductive[hour],
    distraction: hourlyDistraction[hour],
    neutral: hourlyNeutral[hour],
  }));

  return {
    productiveTime,
    distractionTime,
    neutralTime,
    topSites,
    tabSwitches,
    totalSessions: sessions.size,
    timeline,
    totalEvents: events.length,
  };
}

module.exports = { getDailyFeatures };
