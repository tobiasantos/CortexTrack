const Joi = require("joi");

/**
 * Express middleware factory that validates req.body against a Joi schema.
 */
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((d) => d.message);
      return res.status(400).json({ error: "Validation failed", details });
    }

    req.body = value;
    next();
  };
}

// --- Schemas ---

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const eventSchema = Joi.object({
  url: Joi.string().pattern(/^https?:\/\/.+/).required(),
  title: Joi.string().allow("").default(""),
  timestamp: Joi.string().isoDate().required(),
  eventType: Joi.string()
    .valid("visit", "tab_switch", "tab_close", "idle_start", "idle_end")
    .required(),
  duration: Joi.number().integer().min(0).default(0),
  sessionId: Joi.string().required(),
});

const eventsArraySchema = Joi.array().items(eventSchema).min(1).max(1000);

const classificationSchema = Joi.object({
  domain: Joi.string().required(),
  category: Joi.string().valid("productive", "neutral", "distraction").required(),
});

const goalsSchema = Joi.array().items(
  Joi.object({
    metric: Joi.string().required(),
    target: Joi.number().required(),
  })
);

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  eventsArraySchema,
  classificationSchema,
  goalsSchema,
};
