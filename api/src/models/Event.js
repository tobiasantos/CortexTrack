const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  url: { type: String, required: true },
  domain: { type: String, required: true },
  title: { type: String, default: "" },
  eventType: {
    type: String,
    enum: ["visit", "tab_switch", "tab_close", "idle_start", "idle_end"],
    required: true,
  },
  timestamp: { type: Date, required: true },
  duration: { type: Number, default: 0 },
  sessionId: { type: String, required: true },
});

eventSchema.index({ user: 1, timestamp: -1 });
eventSchema.index({ user: 1, domain: 1 });

module.exports = mongoose.model("Event", eventSchema);
