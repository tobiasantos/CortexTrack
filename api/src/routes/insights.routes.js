const { Router } = require("express");
const { authenticate } = require("../middleware/auth");
const { list, markRead } = require("../controllers/insights.controller");

const router = Router();

router.use(authenticate);

router.get("/", list);
router.patch("/:id", markRead);

module.exports = router;
