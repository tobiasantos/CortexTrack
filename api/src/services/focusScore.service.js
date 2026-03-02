const { clamp } = require("../utils/math");
const User = require("../models/User");

/**
 * Calculate the focus score for a set of daily features.
 *
 * Formula:
 *   raw = productiveTime - (distractionTime * weight)
 *   score = clamp(raw / totalActiveTime * 100, 0, 100)
 *
 * Returns null if there is no activity.
 */
async function calculate(features, userId) {
  const { productiveTime, distractionTime, neutralTime } = features;
  const totalActive = productiveTime + distractionTime + neutralTime;

  if (totalActive === 0) return null;

  // Get user's custom weight or use default
  let weight = 1.5;
  if (userId) {
    const user = await User.findById(userId).lean();
    if (user?.preferences?.focusWeight) {
      weight = user.preferences.focusWeight;
    }
  }

  const raw = productiveTime - distractionTime * weight;
  const score = clamp((raw / totalActive) * 100 + 50, 0, 100);

  return Math.round(score * 10) / 10; // 1 decimal place
}

module.exports = { calculate };
