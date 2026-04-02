const express = require("express");

const healthRoutes = require("./healthRoutes");
const authRoutes = require("./authRoutes");
const recordsRoutes = require("./recordsRoutes");
const dashboardRoutes = require("./dashboardRoutes");

const router = express.Router();

// Keep endpoints at the root level (e.g. `/auth/login`).
router.use("/auth", authRoutes);
router.use("/records", recordsRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/", healthRoutes);

module.exports = router;

