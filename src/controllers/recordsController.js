const mongoose = require("mongoose");

const { FinancialRecord } = require("../models");
const { HttpError } = require("../utils/httpError");
const { isNonEmptyString, toLowerEnum } = require("../utils/validation");

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

    const parsedAmount = typeof amount === "undefined" ? NaN : Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      throw new HttpError(400, "Amount must be a non-negative number", "VALIDATION_AMOUNT");
    }

    const normalizedType = toLowerEnum(type, ["income", "expense"]);
    if (!normalizedType) {
      throw new HttpError(400, "Type must be income or expense", "VALIDATION_TYPE");
    }

    if (!isNonEmptyString(category)) {
      throw new HttpError(400, "Category is required", "VALIDATION_CATEGORY");
    }

    const parsedDate = date instanceof Date ? date : new Date(date);
    if (!(parsedDate instanceof Date) || Number.isNaN(parsedDate.getTime())) {
      throw new HttpError(400, "Valid date is required", "VALIDATION_DATE");
    }

    if (typeof note !== "undefined" && typeof note !== "string") {
      throw new HttpError(400, "Note must be a string", "VALIDATION_NOTE");
    }

    const record = await FinancialRecord.create({
      user: userId,
      amount: parsedAmount,
      type: normalizedType,
      category,
      date: parsedDate,
      note: typeof note === "string" ? note : undefined,
    });

    res.status(201).json(record);
  } catch (err) {
    return next(err);
  }
}

async function listRecords(req, res, next) {
  try {
    const userId = getUserId(req);

    const { date, type, category, page, limit, search } = req.query || {};

    const filter = {};

    // Restrict non-admin users to their own records.
    if (!isAdmin(req)) filter.user = userId;

    if (type) {
      const normalizedType = toLowerEnum(type, ["income", "expense"]);
      if (!normalizedType) {
        throw new HttpError(400, "Type must be income or expense", "VALIDATION_TYPE");
      }
      filter.type = normalizedType;
    }

    if (category) {
      const clean = String(category).trim();
      if (!clean) throw new HttpError(400, "Category cannot be empty", "VALIDATION_CATEGORY");
      filter.category = new RegExp(`^${escapeRegex(clean)}$`, "i");
    }

    if (date) {
      const range = parseISODateToRange(String(date));
      if (!range) throw new HttpError(400, "Invalid date", "VALIDATION_DATE");
      filter.date = { $gte: range.start, $lte: range.end };
    }

    const pageNum = page ? Number(page) : 1;
    const limitNum = limit ? Number(limit) : 10;

    if (!Number.isFinite(pageNum) || !Number.isInteger(pageNum) || pageNum < 1) {
      throw new HttpError(400, "Invalid `page`", "VALIDATION_PAGE");
    }
    if (
      !Number.isFinite(limitNum) ||
      !Number.isInteger(limitNum) ||
      limitNum < 1 ||
      limitNum > 100
    ) {
      throw new HttpError(400, "Invalid `limit` (1-100)", "VALIDATION_LIMIT");
    }

    if (search) {
      const clean = String(search).trim();
      if (clean) {
        const re = new RegExp(escapeRegex(clean), "i");
        filter.$or = [{ category: re }, { note: re }];
      }
    }

    const skip = (pageNum - 1) * limitNum;

    const [total, records] = await Promise.all([
      FinancialRecord.countDocuments(filter),
      FinancialRecord.find(filter)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
    ]);

    res.status(200).json({
      records,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 0,
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function updateRecord(req, res, next) {
  try {
    const { id } = req.params;
    const userId = getUserId(req);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpError(400, "Invalid record id", "VALIDATION_ID");
    }

    const record = await FinancialRecord.findById(id);
    if (!record) throw new HttpError(404, "Record not found", "RECORD_NOT_FOUND");

    const admin = isAdmin(req);
    const owner = String(record.user) === String(userId);

    if (!admin && !owner) throw new HttpError(403, "Forbidden", "FORBIDDEN");

    const { amount, type, category, date, note } = req.body || {};

    if (
      typeof amount === "undefined" &&
      typeof type === "undefined" &&
      typeof category === "undefined" &&
      typeof date === "undefined" &&
      typeof note === "undefined"
    ) {
      throw new HttpError(400, "No fields provided to update", "NO_UPDATE_FIELDS");
    }

    if (typeof amount !== "undefined") {
      const parsedAmount = Number(amount);
      if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
        throw new HttpError(400, "Amount must be a non-negative number", "VALIDATION_AMOUNT");
      }
      record.amount = parsedAmount;
    }

    if (typeof type !== "undefined") {
      const normalizedType = toLowerEnum(type, ["income", "expense"]);
      if (!normalizedType) {
        throw new HttpError(400, "Type must be income or expense", "VALIDATION_TYPE");
      }
      record.type = normalizedType;
    }

    if (typeof category !== "undefined") {
      if (!isNonEmptyString(category)) {
        throw new HttpError(400, "Category cannot be empty", "VALIDATION_CATEGORY");
      }
      record.category = category;
    }

    if (typeof date !== "undefined") {
      const parsedDate = date instanceof Date ? date : new Date(date);
      if (!(parsedDate instanceof Date) || Number.isNaN(parsedDate.getTime())) {
        throw new HttpError(400, "Valid date is required", "VALIDATION_DATE");
      }
      record.date = parsedDate;
    }

    if (typeof note !== "undefined") {
      if (typeof note !== "string") {
        throw new HttpError(400, "Note must be a string", "VALIDATION_NOTE");
      }
      record.note = note;
    }

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
      throw new HttpError(400, "Invalid record id", "VALIDATION_ID");
    }

    const record = await FinancialRecord.findById(id);
    if (!record) throw new HttpError(404, "Record not found", "RECORD_NOT_FOUND");

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

