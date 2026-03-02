const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { jwtSecret, jwtExpiresIn, jwtRefreshExpiresIn, saltRounds } = require("../config/auth");

function generateAccessToken(user) {
  return jwt.sign({ sub: user._id, email: user.email }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });
}

function generateRefreshToken(user) {
  return jwt.sign({ sub: user._id, type: "refresh" }, jwtSecret, {
    expiresIn: jwtRefreshExpiresIn,
  });
}

async function register(req, res, next) {
  try {
    const { email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, saltRounds);
    const user = await User.create({ email, passwordHash });

    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      token,
      refreshToken,
      user: { id: user._id, email: user.email },
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      token,
      refreshToken,
      user: { id: user._id, email: user.email },
    });
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token required" });
    }

    let payload;
    try {
      payload = jwt.verify(refreshToken, jwtSecret);
    } catch {
      return res.status(401).json({ error: "Invalid or expired refresh token" });
    }

    const user = await User.findById(payload.sub);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const token = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({ token, refreshToken: newRefreshToken });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, refresh };
