const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: { type: String, required: true },
  refreshToken: { type: String, default: null },
  previousRefreshToken: { type: String, default: null },
  refreshTokenRotatedAt: { type: Date, default: null },
  preferences: {
    focusWeight: { type: Number, default: 1.5 },
    siteOverrides: [
      {
        domain: String,
        category: { type: String, enum: ["productive", "neutral", "distraction"] },
      },
    ],
    goals: [
      {
        metric: String, // e.g. "productive_time", "focus_score"
        target: Number, // e.g. 14400000 (4h in ms) or 80 (score)
      },
    ],
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
