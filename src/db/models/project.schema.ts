import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ProjectSchema = new Schema({
  name: { type: String, required: true },
  logoUrl: { type: String }, // For the building icons
  status: { 
    type: String, 
    enum: ['IN_PROGRESS', 'CLOSED', 'ON_HOLD'], 
    default: 'IN_PROGRESS' 
  },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  totalTasks: { type: Number, default: 0 },
  completedTasks: { type: Number, default: 0 },
  notificationCount: { type: Number, default: 0 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } 
});

export const Project = model('Project', ProjectSchema);