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

module.exports = { ingestEvents };
