import { GraphQLError } from "graphql";
import mongoose from "mongoose";
import { Task as TaskModel } from "../../db/models/task.schema"; // Adjust path to your task schema
import { TeamMember } from "../../db/models/team.schema";
import { Expense } from "../../db/models/budget.schema";

// ─── Argument Types ────────────────────────────────────────────────────────
type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
type TaskStatus = "BACKLOG" | "IN_PROGRESS" | "CANCELLED" | "REVIEW" | "DONE";

type CreateTaskArgs = {
  input: {
    siteId: string;
    title: string;
    description?: string;
    assignees?: string[];
    priority?: TaskPriority;
    dueDate?: string;
  };
};

type UpdateTaskArgs = {
  id: string;
  input: {
    title?: string;
    description?: string;
    assignees?: string[];
    priority?: TaskPriority;
    dueDate?: string;
  };
};

type UpdateTaskStatusArgs = {
  input: {
    taskId: string;
    status: TaskStatus;
  };
};

type TaskFilterArgs = {
  filter: {
    siteId: string;
    status?: string;
    assignees?: string[];
    priority?: string;
    search?: string;
  };
};

// ─── Business Rules ────────────────────────────────────────────────────────
const VALID_TRANSITIONS: Record<string, string[]> = {
  BACKLOG: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["REVIEW", "BACKLOG"],
  REVIEW: ["DONE", "IN_PROGRESS"],
  DONE: ["IN_PROGRESS"],
  CANCELLED: ["BACKLOG"],
};

// ─── Authorization Helper ──────────────────────────────────────────────────
async function requireSiteAccess(userId: string, siteId: string, allowedRoles = ["OWNER", "MANAGER", "WORKER"]) {

  console.log(siteId,"========site id========")
  console.log(userId,"========user id========")
  const member = await TeamMember.findOne({
    siteId,
    userId,
  });
  
  console.log("requireSiteAccess: member", member);
  
  if (!member || !allowedRoles.includes(member.role)) {
    throw new GraphQLError("Unauthorized: You are not an active member of this site with required permissions", {
      extensions: { code: "FORBIDDEN" },
    });
  }
  return member.role;
}

// ─── Resolvers ─────────────────────────────────────────────────────────────
const TaskResolvers = {
  Query: {
    getTask: async (_: unknown, { id }: { id: string }, ctx: any) => {
      if (!ctx.user) throw new GraphQLError("Unauthorized", { extensions: { code: "UNAUTHENTICATED" } });

      try {
        const task = await TaskModel.findOne({ _id: id, isDeleted: false });
        if (!task) throw new GraphQLError("Task not found", { extensions: { code: "NOT_FOUND" } });

        await requireSiteAccess(ctx.user._id.toString(), task.siteId.toString());
        return task;
      } catch (error: any) {
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError("Failed to fetch task", { extensions: { code: "INTERNAL_SERVER_ERROR" } });
      }
    },

    getTasks: async (_: unknown, { filter }: TaskFilterArgs, ctx: any) => {
      if (!ctx.user) throw new GraphQLError("Unauthorized", { extensions: { code: "UNAUTHENTICATED" } });

      try {
        await requireSiteAccess(ctx.user._id.toString(), filter.siteId);

        const query: any = { siteId: filter.siteId, isDeleted: false };

        if (filter.status) query.status = filter.status;
        if (filter.priority) query.priority = filter.priority;
        if (filter.assignees && filter.assignees.length > 0) {
          query.assignees = { $in: filter.assignees };
        }
        if (filter.search) {
          query.$or = [
            { title: { $regex: filter.search, $options: "i" } },
            { description: { $regex: filter.search, $options: "i" } },
          ];
        }

        return await TaskModel.find(query).sort({ createdAt: -1 });
      } catch (error: any) {
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError("Failed to fetch tasks", { extensions: { code: "INTERNAL_SERVER_ERROR" } });
      }
    },

    getTaskBoard: async (_: unknown, { siteId }: { siteId: string }, ctx: any) => {
      if (!ctx.user) throw new GraphQLError("Unauthorized", { extensions: { code: "UNAUTHENTICATED" } });

      try {
        await requireSiteAccess(ctx.user._id.toString(), siteId);

        const tasks = await TaskModel.find({
          siteId: siteId,
          isDeleted: false,
          status: { $ne: "CANCELLED" },
        }).sort({ createdAt: -1 });

        const activeStatuses = ["BACKLOG", "IN_PROGRESS", "REVIEW", "DONE"];

        const columns = activeStatuses.map((status) => {
          const columnTasks = tasks.filter((t) => t.status === status);
          return {
            status,
            tasks: columnTasks,
            count: columnTasks.length,
          };
        });

        return { columns, totalTasks: tasks.length };
      } catch (error: any) {
        console.error("Error in getTaskBoard:", error);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError("Failed to fetch task board", { extensions: { code: "INTERNAL_SERVER_ERROR" } });
      }
    },

    getMyTasks: async (_: unknown, { siteId }: { siteId: string }, ctx: any) => {
      if (!ctx.user) throw new GraphQLError("Unauthorized", { extensions: { code: "UNAUTHENTICATED" } });

      try {
        await requireSiteAccess(ctx.user._id.toString(), siteId);

        return await TaskModel.find({
          siteId: siteId,
          assignees: ctx.user._id,
          isDeleted: false,
          status: { $nin: ["DONE", "CANCELLED"] },
        }).sort({ dueDate: 1 });
      } catch (error: any) {
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError("Failed to fetch my tasks", { extensions: { code: "INTERNAL_SERVER_ERROR" } });
      }
    },
    getTaskDetails: async (_: unknown, { id }: { id: string }, ctx: any) => {
    if (!ctx.user) throw new GraphQLError("Unauthorized", { extensions: { code: "UNAUTHENTICATED" } });

    const task = await TaskModel.findOne({ _id: id, isDeleted: false })
      .populate('assignees', 'firstName lastName')
      .populate('createdBy', 'firstName lastName');

    if (!task) throw new GraphQLError("Task not found", { extensions: { code: "NOT_FOUND" } });

    await requireSiteAccess(ctx.user._id.toString(), task.siteId.toString());
    return task;
  }

  },

  Mutation: {
    createTask: async (_: unknown, { input }: CreateTaskArgs, ctx: any) => {
      if (!ctx.user) throw new GraphQLError("Unauthorized", { extensions: { code: "UNAUTHENTICATED" } });

      try {
        // Only managers and owners can create tasks
        await requireSiteAccess(ctx.user._id.toString(), input.siteId, ["OWNER", "MANAGER"]);

        const task = new TaskModel({
          siteId: input.siteId,
          title: input.title.trim(),
          description: input.description?.trim(),
          assignees: input.assignees || [],
          createdBy: ctx.user._id,
          status: "BACKLOG",
          priority: input.priority || "MEDIUM",
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
          isDeleted: false,
        });

        await task.save();
        return task;
      } catch (error: any) {
        if (error instanceof GraphQLError) throw error;
        if (error instanceof mongoose.Error.ValidationError) {
          throw new GraphQLError("Invalid task data", {
            extensions: { code: "BAD_USER_INPUT", details: Object.values(error.errors).map((e: any) => e.message) },
          });
        }
        throw new GraphQLError("Failed to create task", { extensions: { code: "INTERNAL_SERVER_ERROR" } });
      }
    },

    updateTask: async (_: unknown, { id, input }: UpdateTaskArgs, ctx: any) => {
      if (!ctx.user) throw new GraphQLError("Unauthorized", { extensions: { code: "UNAUTHENTICATED" } });

      try {
        const task = await TaskModel.findOne({ _id: id, isDeleted: false });
        if (!task) throw new GraphQLError("Task not found", { extensions: { code: "NOT_FOUND" } });

        const role = await requireSiteAccess(ctx.user._id.toString(), task.siteId.toString());

        // Workers can only edit tasks they are assigned to
        if (role === "WORKER") {
          const isAssigned = task.assignees.some((a: any) => a.toString() === ctx.user._id.toString());
          if (!isAssigned) {
            throw new GraphQLError("Workers can only edit tasks they are assigned to", {
              extensions: { code: "FORBIDDEN" },
            });
          }
        }

        if (input.title !== undefined) task.title = input.title.trim();
        if (input.description !== undefined) task.description = input.description?.trim();
        if (input.assignees !== undefined) {
          task.assignees = input.assignees.map((assigneeId) => new mongoose.Types.ObjectId(assigneeId));
        }
        if (input.priority !== undefined) task.priority = input.priority;
        if (input.dueDate !== undefined) task.dueDate = input.dueDate ? new Date(input.dueDate) : null;

        await task.save();
        return task;
      } catch (error: any) {
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError("Failed to update task", { extensions: { code: "INTERNAL_SERVER_ERROR" } });
      }
    },

    updateTaskStatus: async (_: unknown, { input }: UpdateTaskStatusArgs, ctx: any) => {
      if (!ctx.user) throw new GraphQLError("Unauthorized", { extensions: { code: "UNAUTHENTICATED" } });

      try {
        const task = await TaskModel.findOne({ _id: input.taskId, isDeleted: false });
        if (!task) throw new GraphQLError("Task not found", { extensions: { code: "NOT_FOUND" } });

        await requireSiteAccess(ctx.user._id.toString(), task.siteId.toString());

        const currentStatus = task.status;
        const newStatus = input.status;

        if (!VALID_TRANSITIONS[currentStatus]?.includes(newStatus)) {
          throw new GraphQLError(`Invalid status transition from ${currentStatus} to ${newStatus}`, {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }

        task.status = newStatus;
        await task.save();
        return task;
      } catch (error: any) {
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError("Failed to update task status", { extensions: { code: "INTERNAL_SERVER_ERROR" } });
      }
    },

    deleteTask: async (_: unknown, { id }: { id: string }, ctx: any) => {
      if (!ctx.user) throw new GraphQLError("Unauthorized", { extensions: { code: "UNAUTHENTICATED" } });

      try {
        const task = await TaskModel.findOne({ _id: id, isDeleted: false });
        if (!task) throw new GraphQLError("Task not found", { extensions: { code: "NOT_FOUND" } });

        // Only managers and owners can delete
        await requireSiteAccess(ctx.user._id.toString(), task.siteId.toString(), ["OWNER", "MANAGER"]);

        if (task.status !== "BACKLOG") {
          throw new GraphQLError("Only tasks in BACKLOG status can be deleted", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }

        const expenseCount = await Expense.countDocuments({ task: id });
        if (expenseCount > 0) {
          throw new GraphQLError("Cannot delete a task that already has expenses linked to it", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }

        // Soft delete
        task.isDeleted = true;
        task.status = "CANCELLED";
        await task.save();

        return true;
      } catch (error: any) {
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError("Failed to delete task", { extensions: { code: "INTERNAL_SERVER_ERROR" } });
      }
    },
  },
};

export default TaskResolvers;