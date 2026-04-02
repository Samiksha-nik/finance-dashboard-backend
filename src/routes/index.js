const express = require("express");

const healthRoutes = require("./healthRoutes");
const authRoutes = require("./authRoutes");

const router = express.Router();

// Keep endpoints at the root level (e.g. `/auth/login`).
router.use("/auth", authRoutes);
router.use("/", healthRoutes);

module.exports = router;

