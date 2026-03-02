const { Router } = require("express");
const { authenticate } = require("../middleware/auth");
const {
  daily,
  weekly,
  monthly,
  timeline,
  topSites,
  categories,
  focusScoreHistory,
} = require("../controllers/summary.controller");

const router = Router();

router.use(authenticate);

// /api/summary/*
router.get("/daily", daily);
router.get("/weekly", weekly);
router.get("/monthly", monthly);

module.exports = router;

// Export individual handlers so server.js can mount them at top-level paths
module.exports.handlers = { timeline, topSites, categories, focusScoreHistory };
