const User = require("../models/User");
const DailySummary = require("../models/DailySummary");

async function getGoals(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.preferences.goals || []);
  } catch (err) {
    next(err);
  }
}

async function updateGoals(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    user.preferences.goals = req.body;
    await user.save();
    res.json(user.preferences.goals);
  } catch (err) {
    next(err);
  }
}

async function weeklyComparison(req, res, next) {
  try {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    // Current week: last 7 days
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().slice(0, 10);

    // Previous week: 8-14 days ago
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const twoWeeksAgoStr = twoWeeksAgo.toISOString().slice(0, 10);

    const [thisWeek, lastWeek] = await Promise.all([
      DailySummary.find({
        user: req.user.id,
        date: { $gt: weekAgoStr, $lte: todayStr },
      }).sort({ date: 1 }),
      DailySummary.find({
        user: req.user.id,
        date: { $gt: twoWeeksAgoStr, $lte: weekAgoStr },
      }).sort({ date: 1 }),
    ]);

    const aggregate = (summaries) => ({
      days: summaries.length,
      productiveTime: summaries.reduce((s, d) => s + d.productiveTime, 0),
      distractionTime: summaries.reduce((s, d) => s + d.distractionTime, 0),
      neutralTime: summaries.reduce((s, d) => s + d.neutralTime, 0),
      avgFocusScore:
        summaries.length > 0
          ? summaries.reduce((s, d) => s + (d.focusScore || 0), 0) / summaries.length
          : null,
    });

    res.json({
      thisWeek: aggregate(thisWeek),
      lastWeek: aggregate(lastWeek),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getGoals, updateGoals, weeklyComparison };
