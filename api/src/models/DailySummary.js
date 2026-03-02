const mongoose = require("mongoose");

const dailySummarySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  productiveTime: { type: Number, default: 0 },
  distractionTime: { type: Number, default: 0 },
  neutralTime: { type: Number, default: 0 },
  focusScore: { type: Number, default: null },
  tabSwitches: { type: Number, default: 0 },
  totalSessions: { type: Number, default: 0 },
  topSites: { type: mongoose.Schema.Types.Mixed, default: [] },
});

dailySummarySchema.index({ user: 1, date: -1 }, { unique: true });

module.exports = mongoose.model("DailySummary", dailySummarySchema);
