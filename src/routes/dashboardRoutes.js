const express = require("express");

const {
  summary,
  categoryBreakdown,
  monthlyTrends,
} = require("../controllers/dashboardController");

const { authMiddleware } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// Dashboard is read-only for all authenticated roles.
router.get(
  "/summary",
  authMiddleware,
  authorizeRoles(["viewer", "analyst", "admin"]),
  summary
);

router.get(
  "/category-breakdown",
  authMiddleware,
  authorizeRoles(["viewer", "analyst", "admin"]),
  categoryBreakdown
);

router.get(
  "/monthly-trends",
  authMiddleware,
  authorizeRoles(["viewer", "analyst", "admin"]),
  monthlyTrends
);

module.exports = router;

