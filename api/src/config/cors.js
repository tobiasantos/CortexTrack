const cors = require("cors");

const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const corsMiddleware = cors({
  origin(origin, callback) {
    // Allow requests with no origin (curl, server-to-server, extensions)
    if (!origin) return callback(null, true);

    // Allow any chrome-extension:// origin
    if (origin.startsWith("chrome-extension://")) return callback(null, true);

    if (allowedOrigins.includes(origin)) return callback(null, true);

    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
});

module.exports = { corsMiddleware };
