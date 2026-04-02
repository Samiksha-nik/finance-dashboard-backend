const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require("../utils/env");
const { HttpError } = require("../utils/httpError");

function authMiddleware(req, res, next) {
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
    req.user = decoded;
    next();
  } catch (err) {
    return next(
      new HttpError(401, "Invalid or expired token", "AUTH_INVALID_TOKEN")
    );
  }
}

module.exports = { authMiddleware };

