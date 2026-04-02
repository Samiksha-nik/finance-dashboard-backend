const express = require("express");

const { register, login, refresh, logout } = require("../controllers/authController");
const { createRateLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

// Rate limit auth endpoints to reduce brute-force attempts.
router.use(
  createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests. Please try again later.",
    code: "RATE_LIMIT",
  })
);

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

module.exports = router;

