import mongoose from "mongoose";

const { Schema, model } = mongoose;

// ─── Budget Schema ─────────────────────────────────────────────────────────
// One budget document per site. Holds the total allocated amount and
// per-category breakdowns. Actual spend is derived from approved expenses.

const CategoryAllocationSchema = new Schema(
  {
    category: {
      type: String,
      enum: ["LABOUR", "MATERIALS", "EQUIPMENT"],
      required: true,
    },
    allocated: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const BudgetSchema = new Schema(
  {
    site: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Site",
      required: true,
      unique: true, // one budget per site
    },
    totalAllocated: { type: Number, required: true, default: 0 },
    currency: { type: String, default: "USD" },
    categoryAllocations: {
      type: [CategoryAllocationSchema],
      default: [
        { category: "LABOUR", allocated: 0 },
        { category: "MATERIALS", allocated: 0 },
        { category: "EQUIPMENT", allocated: 0 },
      ],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    managers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// ─── Expense Schema ────────────────────────────────────────────────────────
// Each expense belongs to a site budget, optionally linked to a task.
// Goes through a PENDING → APPROVED / REJECTED flow.

const ExpenseSchema = new Schema(
  {
    site: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Site",
      required: true,
    },
    budget: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Budget",
      required: true,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null, // optional
    },
    title: { type: String, required: true },
    description: { type: String },
    amount: { type: Number, required: true },
    category: {
      type: String,
      enum: ["LABOUR", "MATERIALS", "EQUIPMENT"],
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    receiptUrl: { type: String }, // optional file upload later
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewNote: { type: String }, // reason for rejection etc.
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

export const Budget = model("Budget", BudgetSchema);
export const Expense = model("Expense", ExpenseSchema);