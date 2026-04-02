const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "userId is required."]
    },
    amount: {
      type: Number,
      required: [true, "Amount is required."],
      min: [0.01, "Amount must be a positive number."]
    },
    type: {
      type: String,
      required: [true, "Type is required."],
      enum: ["income", "expense"]
    },
    category: {
      type: String,
      required: [true, "Category is required."],
      trim: true,
      maxlength: [80, "Category cannot exceed 80 characters."]
    },
    date: {
      type: Date,
      required: [true, "Date is required."]
    },
    note: {
      type: String,
      trim: true,
      maxlength: [500, "Note cannot exceed 500 characters."]
    }
  },
  {
    timestamps: true
  }
);

// ========Read Query Indexes========
recordSchema.index({ type: 1, category: 1, date: -1 });
recordSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model("Record", recordSchema);
