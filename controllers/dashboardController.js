const Record = require("../models/Record");
const asyncHandler = require("../utils/asyncHandler");

const getSummary = asyncHandler(async (req, res) => {
  // ========Summary Aggregation========
  const summary = await Record.aggregate([
    {
      $group: {
        _id: "$type",
        totalAmount: { $sum: "$amount" }
      }
    }
  ]);

  const totalIncome = summary.find((item) => item._id === "income")?.totalAmount || 0;
  const totalExpense = summary.find((item) => item._id === "expense")?.totalAmount || 0;

  return res.status(200).json({
    success: true,
    message: "Summary fetched.",
    data: {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense
    }
  });
});

const getCategoryTotals = asyncHandler(async (req, res) => {
  // ========Category Totals Aggregation========
  const categoryTotals = await Record.aggregate([
    {
      $group: {
        _id: {
          category: "$category",
          type: "$type"
        },
        totalAmount: { $sum: "$amount" }
      }
    },
    {
      $project: {
        _id: 0,
        category: "$_id.category",
        type: "$_id.type",
        totalAmount: 1
      }
    },
    {
      $sort: { category: 1, type: 1 }
    }
  ]);

  return res.status(200).json({
    success: true,
    message: "Category totals fetched.",
    data: categoryTotals
  });
});

const getTrends = asyncHandler(async (req, res) => {
  // ========Monthly Trends Aggregation========
  const trends = await Record.aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" }
        },
        totalIncome: {
          $sum: {
            $cond: [{ $eq: ["$type", "income"] }, "$amount", 0]
          }
        },
        totalExpense: {
          $sum: {
            $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0]
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        month: "$_id.month",
        totalIncome: 1,
        totalExpense: 1,
        net: { $subtract: ["$totalIncome", "$totalExpense"] }
      }
    },
    {
      $sort: { year: 1, month: 1 }
    }
  ]);

  return res.status(200).json({
    success: true,
    message: "Trends fetched.",
    data: trends
  });
});

module.exports = {
  getSummary,
  getCategoryTotals,
  getTrends
};
