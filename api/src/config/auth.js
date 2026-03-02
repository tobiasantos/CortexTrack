const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET must be set in production");
}

module.exports = {
  jwtSecret: jwtSecret || "dev-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "2h",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  saltRounds: 10,
};
