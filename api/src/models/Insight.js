const mongoose = require("mongoose");

const insightSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: ["anomaly", "trend", "pattern", "prediction"],
    required: true,
  },
  severity: {
    type: String,
    enum: ["info", "warning", "critical"],
    default: "info",
  },
  message: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

insightSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Insight", insightSchema);
