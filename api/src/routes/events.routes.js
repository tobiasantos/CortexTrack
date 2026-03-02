const { Router } = require("express");
const { ingestEvents } = require("../controllers/events.controller");
const { authenticate } = require("../middleware/auth");
const { validate, eventsArraySchema } = require("../middleware/validation");

const router = Router();

router.post("/", authenticate, validate(eventsArraySchema), ingestEvents);

module.exports = router;
