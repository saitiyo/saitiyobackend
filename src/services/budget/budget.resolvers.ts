import { GraphQLError } from "graphql";
import { Budget, Expense } from "../../db/models/budget.schema";
import { Site } from "../../db/models/site.schema";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Throws if the requester is neither the site owner nor a budget manager. */
async function assertCanManage(siteId: string, userId: string) {
  const site = await Site.findById(siteId);
  if (!site) throw new GraphQLError("Site not found", { extensions: { code: "NOT_FOUND" } });

  const budget = await Budget.findOne({ site: siteId });
  const isOwner = site.owner?.toString() === userId;
  const isManager = budget?.managers.some((m) => m.toString() === userId) ?? false;

  if (!isOwner && !isManager) {
    throw new GraphQLError("Not authorised to manage this budget", {
      extensions: { code: "FORBIDDEN" },
    });
  }
  return { site, budget };
}

/**
 * Given a budget document and its approved expenses, compute the
 * live BudgetSummary that the GraphQL type exposes.
 */
async function buildSummary(budget: any) {
  const approvedExpenses = await Expense.find({
    budget: budget._id,
    status: "APPROVED",
  });
  const pendingExpenses = await Expense.find({
    budget: budget._id,
    status: "PENDING",
  });

  const totalSpent = approvedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const pendingAmount = pendingExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalAllocated = budget.totalAllocated;
  const totalRemaining = Math.max(0, totalAllocated - totalSpent);
  const utilizationPct =
    totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

  // Per-category breakdown
  const categoryBreakdown = budget.categoryAllocations.map((alloc: any) => {
    const catSpent = approvedExpenses
      .filter((e) => e.category === alloc.category)
      .reduce((sum, e) => sum + e.amount, 0);
    return {
      category: alloc.category,
      allocated: alloc.allocated,
      spent: catSpent,
      remaining: Math.max(0, alloc.allocated - catSpent),
    };
  });

  return {
    totalAllocated,
    totalSpent,
    totalRemaining,
    utilizationPct: parseFloat(utilizationPct.toFixed(2)),
    pendingAmount,
    categoryBreakdown,
  };
}

// ─── Resolvers ────────────────────────────────────────────────────────────────

const BudgetResolvers = {
  // Resolve the computed `summary` field on Budget type
  Budget: {
    summary: async (parent: any) => buildSummary(parent),
    // Also resolve live categoryAllocations with spent/remaining
    categoryAllocations: async (parent: any) => {
      const approvedExpenses = await Expense.find({
        budget: parent._id,
        status: "APPROVED",
      });
      return parent.categoryAllocations.map((alloc: any) => {
        const spent = approvedExpenses
          .filter((e) => e.category === alloc.category)
          .reduce((sum, e) => sum + e.amount, 0);
        return {
          category: alloc.category,
          allocated: alloc.allocated,
          spent,
          remaining: Math.max(0, alloc.allocated - spent),
        };
      });
    },
  },

  Query: {
    // ── getBudget ────────────────────────────────────────────────────────────
    getBudget: async (_: any, { siteId }: { siteId: string }) => {
      const budget = await Budget.findOne({ site: siteId });
      if (!budget) return null;
      return budget.toObject();
    },

    // ── getExpenses ──────────────────────────────────────────────────────────
    getExpenses: async (
      _: any,
      {
        siteId,
        status,
        category,
      }: { siteId: string; status?: string; category?: string }
    ) => {
      const filter: Record<string, any> = { site: siteId };
      if (status) filter.status = status;
      if (category) filter.category = category;

      const expenses = await Expense.find(filter).sort({ createdAt: -1 });
      return expenses.map((e) => e.toObject());
    },

    // ── getExpense ───────────────────────────────────────────────────────────
    getExpense: async (_: any, { id }: { id: string }) => {
      const expense = await Expense.findById(id);
      if (!expense)
        throw new GraphQLError("Expense not found", {
          extensions: { code: "NOT_FOUND" },
        });
      return expense.toObject();
    },
  },

  Mutation: {
    // ── setBudget ────────────────────────────────────────────────────────────
    // Upsert: creates a budget if none exists, updates if it does.
    // Only site owner can call this.
    setBudget: async (
      _: any,
      {
        siteId,
        userId,
        totalAllocated,
        currency,
        categoryAllocations,
      }: {
        siteId: string;
        userId: string;
        totalAllocated: number;
        currency?: string;
        categoryAllocations: { category: string; allocated: number }[];
      }
    ) => {
      const site = await Site.findById(siteId);
      if (!site)
        throw new GraphQLError("Site not found", {
          extensions: { code: "NOT_FOUND" },
        });

      if (site.owner?.toString() !== userId) {
        throw new GraphQLError("Only the site owner can set the budget", {
          extensions: { code: "FORBIDDEN" },
        });
      }

      const allocTotal = categoryAllocations.reduce(
        (sum, c) => sum + c.allocated,
        0
      );
      if (allocTotal > totalAllocated) {
        throw new GraphQLError(
          "Category allocations exceed the total budget",
          { extensions: { code: "BAD_USER_INPUT" } }
        );
      }

      const budget = await Budget.findOneAndUpdate(
        { site: siteId },
        {
          $set: {
            totalAllocated,
            currency: currency ?? "USD",
            categoryAllocations,
            createdBy: userId,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      return budget!.toObject();
    },

    // ── addBudgetManager ─────────────────────────────────────────────────────
    addBudgetManager: async (
      _: any,
      {
        siteId,
        managerId,
        requesterId,
      }: { siteId: string; managerId: string; requesterId: string }
    ) => {
      const site = await Site.findById(siteId);
      if (!site)
        throw new GraphQLError("Site not found", {
          extensions: { code: "NOT_FOUND" },
        });

      if (site.owner?.toString() !== requesterId) {
        throw new GraphQLError("Only the site owner can assign managers", {
          extensions: { code: "FORBIDDEN" },
        });
      }

      const budget = await Budget.findOneAndUpdate(
        { site: siteId },
        { $addToSet: { managers: managerId } },
        { new: true }
      );

      if (!budget)
        throw new GraphQLError("Budget not found — create it first", {
          extensions: { code: "NOT_FOUND" },
        });

      return budget.toObject();
    },

    // ── removeBudgetManager ──────────────────────────────────────────────────
    removeBudgetManager: async (
      _: any,
      {
        siteId,
        managerId,
        requesterId,
      }: { siteId: string; managerId: string; requesterId: string }
    ) => {
      const site = await Site.findById(siteId);
      if (!site)
        throw new GraphQLError("Site not found", {
          extensions: { code: "NOT_FOUND" },
        });

      if (site.owner?.toString() !== requesterId) {
        throw new GraphQLError("Only the site owner can remove managers", {
          extensions: { code: "FORBIDDEN" },
        });
      }

      const budget = await Budget.findOneAndUpdate(
        { site: siteId },
        { $pull: { managers: managerId } },
        { new: true }
      );

      if (!budget)
        throw new GraphQLError("Budget not found", {
          extensions: { code: "NOT_FOUND" },
        });

      return budget.toObject();
    },

    // ── submitExpense ────────────────────────────────────────────────────────
    submitExpense: async (
      _: any,
      {
        siteId,
        submittedBy,
        title,
        amount,
        category,
        description,
        taskId,
        receiptUrl,
      }: {
        siteId: string;
        submittedBy: string;
        title: string;
        amount: number;
        category: string;
        description?: string;
        taskId?: string;
        receiptUrl?: string;
      }
    ) => {
      if (amount <= 0) {
        throw new GraphQLError("Expense amount must be greater than zero", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const budget = await Budget.findOne({ site: siteId });
      if (!budget)
        throw new GraphQLError(
          "No budget found for this site — ask the owner to set one first",
          { extensions: { code: "NOT_FOUND" } }
        );

      const expense = new Expense({
        site: siteId,
        budget: budget._id,
        task: taskId ?? null,
        title,
        description,
        amount,
        category,
        receiptUrl,
        submittedBy,
        status: "PENDING",
      });

      await expense.save();
      return expense.toObject();
    },

    // ── reviewExpense ────────────────────────────────────────────────────────
    reviewExpense: async (
      _: any,
      {
        expenseId,
        reviewerId,
        status,
        reviewNote,
      }: {
        expenseId: string;
        reviewerId: string;
        status: string;
        reviewNote?: string;
      }
    ) => {
      if (!["APPROVED", "REJECTED"].includes(status)) {
        throw new GraphQLError("Status must be APPROVED or REJECTED", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const expense = await Expense.findById(expenseId);
      if (!expense)
        throw new GraphQLError("Expense not found", {
          extensions: { code: "NOT_FOUND" },
        });

      if (expense.status !== "PENDING") {
        throw new GraphQLError("Only PENDING expenses can be reviewed", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Confirm reviewer is owner or manager
      await assertCanManage(expense.site.toString(), reviewerId);

      expense.status = status as any;
      expense.reviewedBy = reviewerId as any;
      expense.reviewNote = reviewNote as any;
      expense.reviewedAt = new Date();

      await expense.save();
      return expense.toObject();
    },

    // ── deleteExpense ────────────────────────────────────────────────────────
    deleteExpense: async (
      _: any,
      { expenseId, requesterId }: { expenseId: string; requesterId: string }
    ) => {
      const expense = await Expense.findById(expenseId);
      if (!expense)
        throw new GraphQLError("Expense not found", {
          extensions: { code: "NOT_FOUND" },
        });

      if (expense.status !== "PENDING") {
        throw new GraphQLError(
          "Only PENDING expenses can be deleted",
          { extensions: { code: "BAD_USER_INPUT" }}
        );
      }

      // Only the submitter or site owner/manager can delete
      const isSubmitter = expense.submittedBy.toString() === requesterId;
      if (!isSubmitter) {
        await assertCanManage(expense.site.toString(), requesterId);
      }

      await Expense.findByIdAndDelete(expenseId);
      return true;
    },
  },
};

export default BudgetResolvers;