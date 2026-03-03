const Event = require("../models/Event");

async function ingestEvents(req, res, next) {
  try {
    const events = req.body;

    const docs = events.map((e) => ({
      user: req.user.id,
      url: e.url,
      domain: extractDomain(e.url),
      title: e.title,
      eventType: e.eventType,
      timestamp: new Date(e.timestamp),
      duration: e.duration,
      sessionId: e.sessionId,
    }));

    await Event.insertMany(docs, { ordered: false });

    res.json({ received: docs.length });
  } catch (err) {
    next(err);
  }
}

function extractDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

async function getEventLog(req, res, next) {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const limit = Math.min(parseInt(req.query.limit) || 200, 500);
    const offset = parseInt(req.query.offset) || 0;
    const tz = parseInt(req.query.tz) || 0;

    const { dayBounds } = require("../utils/date");
    const { start: startOfDay, end: endOfDay } = dayBounds(date, tz);

    const filter = {
      user: req.user.id,
      timestamp: { $gte: startOfDay, $lte: endOfDay },
    };

    const [events, total] = await Promise.all([
      Event.find(filter)
        .sort({ timestamp: -1 })
        .skip(offset)
        .limit(limit)
        .lean(),
      Event.countDocuments(filter),
    ]);

    res.json({ events, total, limit, offset });
  } catch (err) {
    next(err);
  }
}

module.exports = { ingestEvents, getEventLog };
