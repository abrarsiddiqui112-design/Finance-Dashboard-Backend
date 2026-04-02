const Record = require("../models/Record");
const asyncHandler = require("../utils/asyncHandler");

const parseDate = (value) => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const buildRecordFilters = (query) => {
  // ========Query Filter Builder========
  const filter = {};

  if (query.type) {
    filter.type = query.type;
  }

  if (query.category) {
    filter.category = query.category;
  }

  const startDate = parseDate(query.startDate);
  const endDate = parseDate(query.endDate);

  if (startDate || endDate) {
    filter.date = {};

    if (startDate) {
      filter.date.$gte = startDate;
    }

    if (endDate) {
      filter.date.$lte = endDate;
    }
  }

  return filter;
};

const createRecord = asyncHandler(async (req, res) => {
  const { amount, type, category, date, note } = req.body;

  if (!req.user || !req.user._id) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized request."
    });
  }

  if (!amount || !type || !category || !date) {
    return res.status(400).json({
      success: false,
      message: "amount, type, category, and date are required."
    });
  }

  if (Number(amount) <= 0) {
    return res.status(400).json({
      success: false,
      message: "Amount must be greater than 0."
    });
  }

  const parsedDate = parseDate(date);
  if (!parsedDate) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid date."
    });
  }

  const record = await Record.create({
    userId: req.user._id,
    amount,
    type,
    category: String(category).trim(),
    date: parsedDate,
    note
  });

  return res.status(201).json({
    success: true,
    message: "Record created.",
    data: record
  });
});

const getRecords = asyncHandler(async (req, res) => {
  // ========Pagination Guardrails========
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const filter = buildRecordFilters(req.query);

  const [records, totalRecords] = await Promise.all([
    Record.find(filter)
      .populate("userId", "name email role")
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Record.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(totalRecords / limit) || 1;

  return res.status(200).json({
    success: true,
    message: "Records fetched.",
    pagination: {
      page,
      limit,
      totalRecords,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    },
    data: records
  });
});

const updateRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };

  if (updates.amount !== undefined && Number(updates.amount) <= 0) {
    return res.status(400).json({
      success: false,
      message: "Amount must be greater than 0."
    });
  }

  if (updates.date !== undefined) {
    const parsedDate = parseDate(updates.date);
    if (!parsedDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid date."
      });
    }

    updates.date = parsedDate;
  }

  const record = await Record.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true
  });

  if (!record) {
    return res.status(404).json({
      success: false,
      message: "Record not found."
    });
  }

  return res.status(200).json({
    success: true,
    message: "Record updated.",
    data: record
  });
});

const deleteRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const record = await Record.findByIdAndDelete(id);

  if (!record) {
    return res.status(404).json({
      success: false,
      message: "Record not found."
    });
  }

  return res.status(200).json({
    success: true,
    message: "Record deleted."
  });
});

module.exports = {
  createRecord,
  getRecords,
  updateRecord,
  deleteRecord
};
