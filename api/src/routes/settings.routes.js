const { Router } = require("express");
const { authenticate } = require("../middleware/auth");
const { validate, classificationSchema } = require("../middleware/validation");
const classificationService = require("../services/classification.service");

const router = Router();

router.use(authenticate);

router.get("/classifications", async (req, res, next) => {
  try {
    const classifications = await classificationService.getAllForUser(req.user.id);
    res.json(classifications);
  } catch (err) {
    next(err);
  }
});

router.put("/classifications", validate(classificationSchema), async (req, res, next) => {
  try {
    const { domain, category } = req.body;
    await classificationService.setUserOverride(req.user.id, domain, category);
    res.json({ domain, category });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
