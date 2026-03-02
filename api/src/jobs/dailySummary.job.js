const cron = require("node-cron");
const Event = require("../models/Event");
const dailySummaryService = require("../services/dailySummary.service");
const logger = require("../utils/logger");

/**
 * Schedule the daily summary aggregation job.
 * Runs at 00:15 every day — processes yesterday's events for all users.
 */
function scheduleDailySummaryJob() {
  cron.schedule("15 0 * * *", async () => {
    logger.info("Running daily summary job...");

    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().slice(0, 10);

      // Find all users with events yesterday
      const dayStart = new Date(`${dateStr}T00:00:00.000Z`);
      const dayEnd = new Date(`${dateStr}T23:59:59.999Z`);

      const userIds = await Event.distinct("user", {
        timestamp: { $gte: dayStart, $lte: dayEnd },
      });

      logger.info(`Processing summaries for ${userIds.length} users (${dateStr})`);

      for (const userId of userIds) {
        try {
          await dailySummaryService.computeAndStore(userId, dateStr);
        } catch (err) {
          logger.error(`Failed to compute summary for user ${userId}: ${err.message}`);
        }
      }

      logger.info("Daily summary job completed");
    } catch (err) {
      logger.error(`Daily summary job failed: ${err.message}`);
    }
  });

  logger.info("Daily summary job scheduled (00:15 UTC)");
}

module.exports = { scheduleDailySummaryJob };
