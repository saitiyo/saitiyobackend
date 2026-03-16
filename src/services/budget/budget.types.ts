const budgetTypes = /* GraphQL */ `

  # ─── Enums ──────────────────────────────────────────────────────────────────

  enum ExpenseCategory {
    LABOUR
    MATERIALS
    EQUIPMENT
  }

  enum ExpenseStatus {
    PENDING
    APPROVED
    REJECTED
  }

  # ─── Budget ──────────────────────────────────────────────────────────────────
  # One per site. Tracks total allocated amount and per-category split.

  type CategoryAllocation {
    category: ExpenseCategory!
    allocated: Float!
    spent: Float!        # derived: sum of APPROVED expenses in this category
    remaining: Float!    # derived: allocated - spent
  }

  type BudgetSummary {
    totalAllocated: Float!
    totalSpent: Float!       # sum of all APPROVED expenses
    totalRemaining: Float!
    utilizationPct: Float!   # (totalSpent / totalAllocated) * 100
    pendingAmount: Float!    # sum of PENDING expenses (not yet approved)
    categoryBreakdown: [CategoryAllocation!]!
  }

  type Budget {
    _id: ID!
    site: ID!
    totalAllocated: Float!
    currency: String!
    categoryAllocations: [CategoryAllocation!]!
    managers: [ID!]!
    summary: BudgetSummary!
    createdBy: ID!
    createdAt: String
    updatedAt: String
  }

  # ─── Expense ──────────────────────────────────────────────────────────────────

  type Expense {
    _id: ID!
    site: ID!
    budget: ID!
    task: ID             # nullable — optionally linked to a task
    title: String!
    description: String
    amount: Float!
    category: ExpenseCategory!
    status: ExpenseStatus!
    receiptUrl: String
    submittedBy: ID!
    reviewedBy: ID
    reviewNote: String
    reviewedAt: String
    createdAt: String
    updatedAt: String
  }

  # ─── Queries ──────────────────────────────────────────────────────────────────

  type Query {
    # Full budget doc + live summary for a site
    getBudget(siteId: ID!): Budget

    # All expenses for a site, with optional status filter
    getExpenses(
      siteId: ID!
      status: ExpenseStatus
      category: ExpenseCategory
    ): [Expense!]!

    # Single expense detail
    getExpense(id: ID!): Expense
  }

  # ─── Mutations ────────────────────────────────────────────────────────────────

  type Mutation {
    # Site owner creates/updates the budget for a site.
    # Can be called again to update allocations.
    setBudget(
      siteId: ID!
      userId: ID!
      totalAllocated: Float!
      currency: String
      categoryAllocations: [CategoryAllocationInput!]!
    ): Budget!

    # Assign a manager who can approve/reject expenses on this site
    addBudgetManager(siteId: ID!, managerId: ID!, requesterId: ID!): Budget!
    removeBudgetManager(siteId: ID!, managerId: ID!, requesterId: ID!): Budget!

    # Any user submits an expense against a site budget
    submitExpense(
      siteId: ID!
      submittedBy: ID!
      title: String!
      amount: Float!
      category: ExpenseCategory!
      description: String
      taskId: ID            # optional
      receiptUrl: String    # optional
    ): Expense!

    # Site owner OR manager approves or rejects
    reviewExpense(
      expenseId: ID!
      reviewerId: ID!
      status: ExpenseStatus!   # APPROVED or REJECTED
      reviewNote: String
    ): Expense!

    # Delete a PENDING expense (only submitter or owner)
    deleteExpense(expenseId: ID!, requesterId: ID!): Boolean!
  }

  # ─── Inputs ───────────────────────────────────────────────────────────────────

  input CategoryAllocationInput {
    category: ExpenseCategory!
    allocated: Float!
  }
`;

export default budgetTypes;