require("dotenv").config();

const mongoose = require("mongoose");
const { connectDB } = require("../config/database");
const SiteClassification = require("../models/SiteClassification");
const classifications = require("./default-classifications");
const logger = require("../utils/logger");

async function seed() {
  await connectDB();

  // Only insert global defaults (user: null) that don't already exist
  let inserted = 0;
  for (const entry of classifications) {
    const exists = await SiteClassification.findOne({ domain: entry.domain, user: null });
    if (!exists) {
      await SiteClassification.create({ ...entry, user: null });
      inserted++;
    }
  }

  logger.info(`Seeded ${inserted} new classifications (${classifications.length - inserted} already existed)`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  logger.error("Seed failed:", err);
  process.exit(1);
});
