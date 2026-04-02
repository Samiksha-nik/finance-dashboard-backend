const express = require("express");

const { createRecord, listRecords, updateRecord, deleteRecord } = require("../controllers/recordsController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// GET /records - read access for viewer/analyst/admin
router.get(
  "/",
  authMiddleware,
  authorizeRoles(["viewer", "analyst", "admin"]),
  listRecords
);

// POST /records - create access for analyst/admin
router.post(
  "/",
  authMiddleware,
  authorizeRoles(["analyst", "admin"]),
  createRecord
);

// PUT /records/:id - update access for analyst/admin
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles(["analyst", "admin"]),
  updateRecord
);

// DELETE /records/:id - delete access for admin only
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles(["admin"]),
  deleteRecord
);

module.exports = router;

