const { Router } = require("express");
const { register, login, refresh } = require("../controllers/auth.controller");
const { validate, registerSchema, loginSchema } = require("../middleware/validation");
const { authLimiter } = require("../middleware/rateLimit");

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/refresh", authLimiter, refresh);

module.exports = router;
