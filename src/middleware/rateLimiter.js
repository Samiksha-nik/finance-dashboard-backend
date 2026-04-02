const rateLimit = require("express-rate-limit");

function createRateLimiter({
  windowMs = 15 * 60 * 1000, // 15 minutes
  max = 100, // requests per windowMs per IP
  message = "Too many requests. Please try again later.",
  code = "RATE_LIMIT",
} = {}) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: { message, code },
      });
    },
  });
}

module.exports = { createRateLimiter };

