const mongoose = require("mongoose");

const { FinancialRecord } = require("../models");

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseISODateToRange(dateStr) {
  // Expected: YYYY-MM-DD
  if (!dateStr || typeof dateStr !== "string") return null;
  const trimmed = dateStr.trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;

  const [y, m, d] = trimmed.split("-").map((n) => Number(n));
  const start = new Date(y, m - 1, d, 0, 0, 0, 0);
  const end = new Date(y, m - 1, d, 23, 59, 59, 999);
  return { start, end };
}

function getUserId(req) {
  return req?.user?.userId;
}

function isAdmin(req) {
  return String(req?.user?.role || "").toLowerCase() === "admin";
}

async function createRecord(req, res, next) {
  try {
    const userId = getUserId(req);
    const { amount, type, category, date, note } = req.body || {};

    const record = await FinancialRecord.create({
      user: userId,
      amount,
      type,
      category,
      date,
      note,
    });

    res.status(201).json(record);
  } catch (err) {
    return next(err);
  }
}

async function listRecords(req, res, next) {
  try {
    const userId = getUserId(req);

    const { date, type, category } = req.query || {};

    const filter = {};

    // Restrict non-admin users to their own records.
    if (!isAdmin(req)) filter.user = userId;

    if (type) filter.type = String(type).toLowerCase();

    if (category) {
      const clean = String(category).trim();
      if (clean) {
        filter.category = new RegExp(`^${escapeRegex(clean)}$`, "i");
      }
    }

    if (date) {
      const range = parseISODateToRange(String(date));
      if (!range) return res.status(400).json({ error: "Invalid date" });
      filter.date = { $gte: range.start, $lte: range.end };
    }

    const records = await FinancialRecord.find(filter).sort({ date: -1, createdAt: -1 });

    res.status(200).json(records);
  } catch (err) {
    return next(err);
  }
}

async function updateRecord(req, res, next) {
  try {
    const { id } = req.params;
    const userId = getUserId(req);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid record id" });
    }

    const record = await FinancialRecord.findById(id);
    if (!record) return res.status(404).json({ error: "Record not found" });

    const admin = isAdmin(req);
    const owner = String(record.user) === String(userId);

    if (!admin && !owner) return res.status(403).json({ error: "Forbidden" });

    const { amount, type, category, date, note } = req.body || {};

    if (typeof amount !== "undefined") record.amount = amount;
    if (typeof type !== "undefined") record.type = type;
    if (typeof category !== "undefined") record.category = category;
    if (typeof date !== "undefined") record.date = date;
    if (typeof note !== "undefined") record.note = note;

    await record.save();

    res.status(200).json(record);
  } catch (err) {
    return next(err);
  }
}

async function deleteRecord(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid record id" });
    }

    const record = await FinancialRecord.findById(id);
    if (!record) return res.status(404).json({ error: "Record not found" });

    await FinancialRecord.findByIdAndDelete(id);

    res.status(200).json({ success: true });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createRecord,
  listRecords,
  updateRecord,
  deleteRecord,
};

