const mongoose = require("mongoose");

const siteClassificationSchema = new mongoose.Schema({
  domain: { type: String, required: true },
  defaultCategory: {
    type: String,
    enum: ["productive", "neutral", "distraction"],
    default: "neutral",
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  userCategory: {
    type: String,
    enum: ["productive", "neutral", "distraction", null],
    default: null,
  },
});

siteClassificationSchema.index({ domain: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("SiteClassification", siteClassificationSchema);
