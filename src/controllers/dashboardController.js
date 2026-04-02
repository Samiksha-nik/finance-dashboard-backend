const { FinancialRecord } = require("../models");

function isAdmin(req) {
  return String(req?.user?.role || "").toLowerCase() === "admin";
}

function getUserId(req) {
  return req?.user?.userId;
}

function buildMatch(req) {
  // Always exclude soft-deleted records.
  const base = { isDeleted: false };
  if (isAdmin(req)) return base;
  return { ...base, user: getUserId(req) };
}

async function summary(req, res, next) {
  try {
    const match = buildMatch(req);

    const results = await FinancialRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
            },
          },
          totalExpenses: {
            $sum: {
              $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalIncome: 1,
          totalExpenses: 1,
          netBalance: { $subtract: ["$totalIncome", "$totalExpenses"] },
        },
      },
    ]);

    const data = results?.[0] || {
      totalIncome: 0,
      totalExpenses: 0,
      netBalance: 0,
    };

    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

async function categoryBreakdown(req, res, next) {
  try {
    const match = buildMatch(req);

    const results = await FinancialRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$category",
          incomeTotal: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
            },
          },
          expenseTotal: {
            $sum: {
              $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          incomeTotal: 1,
          expenseTotal: 1,
          netBalance: { $subtract: ["$incomeTotal", "$expenseTotal"] },
        },
      },
      { $sort: { category: 1 } },
    ]);

    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
}

async function monthlyTrends(req, res, next) {
  try {
    const match = buildMatch(req);

    const results = await FinancialRecord.aggregate([
      { $match: match },
      {
        $addFields: {
          month: {
            $dateToString: {
              format: "%Y-%m",
              date: "$date",
              timezone: "UTC",
            },
          },
        },
      },
      {
        $group: {
          _id: "$month",
          incomeTotal: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
            },
          },
          expenseTotal: {
            $sum: {
              $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          incomeTotal: 1,
          expenseTotal: 1,
          netBalance: { $subtract: ["$incomeTotal", "$expenseTotal"] },
        },
      },
      { $sort: { month: 1 } },
    ]);

    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  summary,
  categoryBreakdown,
  monthlyTrends,
};

