const { Router } = require("express");
const { getGoals, updateGoals } = require("../controllers/goals.controller");
const { authenticate } = require("../middleware/auth");
const { validate, goalsSchema } = require("../middleware/validation");

const router = Router();

router.use(authenticate);

router.get("/", getGoals);
router.put("/", validate(goalsSchema), updateGoals);

module.exports = router;
