const SiteClassification = require("../models/SiteClassification");
const Event = require("../models/Event");

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
 * Get all classifications for a user based on their actually visited domains.
 * Merges: user overrides > global defaults > "neutral" fallback.
 */
async function getAllForUser(userId) {
  const [globals, overrides, userDomains] = await Promise.all([
    SiteClassification.find({ user: null }),
    SiteClassification.find({ user: userId }),
    Event.distinct("domain", { user: userId }),
  ]);

  const globalMap = new Map(globals.map((g) => [g.domain, g.defaultCategory]));
  const overrideMap = new Map(
    overrides.filter((o) => o.userCategory).map((o) => [o.domain, o.userCategory])
  );

  const merged = new Map();
  for (const domain of userDomains) {
    merged.set(domain, {
      domain,
      category: overrideMap.get(domain) || globalMap.get(domain) || "neutral",
      isOverride: overrideMap.has(domain),
    });
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
