const SiteClassification = require("../models/SiteClassification");

/**
 * Classify a domain for a given user.
 * Priority: user override > global default > "neutral" fallback.
 */
async function classify(domain, userId) {
  // Check user-specific override first
  if (userId) {
    const userOverride = await SiteClassification.findOne({ domain, user: userId });
    if (userOverride?.userCategory) return userOverride.userCategory;
  }

  // Check global default
  const global = await SiteClassification.findOne({ domain, user: null });
  if (global) return global.defaultCategory;

  return "neutral";
}

/**
 * Classify multiple domains at once (batch, more efficient).
 * Returns a Map<domain, category>.
 */
async function classifyMany(domains, userId) {
  const uniqueDomains = [...new Set(domains)];

  // Fetch all relevant classifications in two queries
  const [globals, userOverrides] = await Promise.all([
    SiteClassification.find({ domain: { $in: uniqueDomains }, user: null }),
    userId
      ? SiteClassification.find({ domain: { $in: uniqueDomains }, user: userId })
      : Promise.resolve([]),
  ]);

  const globalMap = new Map(globals.map((g) => [g.domain, g.defaultCategory]));
  const userMap = new Map(
    userOverrides.filter((u) => u.userCategory).map((u) => [u.domain, u.userCategory])
  );

  const result = new Map();
  for (const domain of uniqueDomains) {
    result.set(domain, userMap.get(domain) || globalMap.get(domain) || "neutral");
  }
  return result;
}

/**
 * Get all classifications for a user (merged defaults + overrides).
 */
async function getAllForUser(userId) {
  const [globals, overrides] = await Promise.all([
    SiteClassification.find({ user: null }),
    SiteClassification.find({ user: userId }),
  ]);

  const merged = new Map();
  for (const g of globals) {
    merged.set(g.domain, { domain: g.domain, category: g.defaultCategory, isOverride: false });
  }
  for (const o of overrides) {
    if (o.userCategory) {
      merged.set(o.domain, { domain: o.domain, category: o.userCategory, isOverride: true });
    }
  }

  return [...merged.values()].sort((a, b) => a.domain.localeCompare(b.domain));
}

/**
 * Set a user's classification override for a domain.
 */
async function setUserOverride(userId, domain, category) {
  return SiteClassification.findOneAndUpdate(
    { domain, user: userId },
    { domain, user: userId, userCategory: category },
    { upsert: true, new: true }
  );
}

module.exports = { classify, classifyMany, getAllForUser, setUserOverride };
