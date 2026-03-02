const { Router } = require("express");
const { ingestEvents, getEventLog } = require("../controllers/events.controller");
const { authenticate } = require("../middleware/auth");
const { validate, eventsArraySchema } = require("../middleware/validation");

const router = Router();

router.post("/", authenticate, validate(eventsArraySchema), ingestEvents);
router.get("/log", authenticate, getEventLog);

module.exports = router;
