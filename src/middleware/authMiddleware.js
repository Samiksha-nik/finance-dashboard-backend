const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require("../utils/env");
const { HttpError } = require("../utils/httpError");
const { AccessTokenBlacklist } = require("../models");
const { hashToken } = require("../utils/tokenHash");

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || typeof authHeader !== "string") {
    return next(new HttpError(401, "Missing Authorization header", "AUTH_MISSING"));
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return next(new HttpError(401, "Invalid Authorization header", "AUTH_INVALID"));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded?.tokenType !== "access") {
      return next(new HttpError(401, "Invalid token type", "AUTH_INVALID_TYPE"));
    }

    const tokenHash = hashToken(token);
    const blacklisted = await AccessTokenBlacklist.findOne({
      tokenHash,
      expiresAt: { $gt: new Date() },
      revokedAt: null,
    });

    if (blacklisted) {
      return next(new HttpError(401, "Token has been logged out", "AUTH_BLACKLISTED"));
    }

    req.user = decoded;
    next();
  } catch (err) {
    return next(
      new HttpError(401, "Invalid or expired token", "AUTH_INVALID_TOKEN")
    );
  }
}

module.exports = { authMiddleware };

