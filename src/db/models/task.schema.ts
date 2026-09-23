import mongoose from "mongoose";
const { Schema, model } = mongoose;

const TaskSchema = new Schema(
  {
    // Use siteId to match your TeamMember/Invitation schemas

    siteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Site",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    
    assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    status: {
      type: String,
      enum: ["BACKLOG", "IN_PROGRESS", "REVIEW", "DONE", "CANCELLED"],
      default: "BACKLOG",
    },
    
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM",
    },

     progress: { 
    type: Number, 
    min: 0, 
    max: 100, 
    default: 0 
  },
  // Optional: for counting attachments/comments
  attachmentsCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
    
    dueDate: { type: Date },
    isDeleted: { type: Boolean, default: false }, 
  },
  { timestamps: true }
);

// Indexes for fast board rendering
TaskSchema.index({ siteId: 1, status: 1, isDeleted: 1 });
TaskSchema.index({ assignees: 1, status: 1 });

export const Task = model("Task", TaskSchema);