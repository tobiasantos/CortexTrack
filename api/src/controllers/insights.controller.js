const Insight = require("../models/Insight");

async function list(req, res, next) {
  try {
    const { type, severity, limit = 20, offset = 0 } = req.query;

    const filter = { user: req.user.id };
    if (type) filter.type = type;
    if (severity) filter.severity = severity;

    const [items, total] = await Promise.all([
      Insight.find(filter)
        .sort({ createdAt: -1 })
        .skip(Number(offset))
        .limit(Number(limit))
        .lean(),
      Insight.countDocuments(filter),
    ]);

    const unreadCount = await Insight.countDocuments({ user: req.user.id, read: false });

    res.json({ items, total, unreadCount });
  } catch (err) {
    next(err);
  }
}

async function markRead(req, res, next) {
  try {
    const insight = await Insight.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: true },
      { new: true }
    );

    if (!insight) return res.status(404).json({ error: "Insight not found" });
    res.json(insight);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, markRead };
