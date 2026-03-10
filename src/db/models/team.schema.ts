import mongoose from "mongoose";
const { Schema, model } = mongoose;


const teamMemberSchema = new Schema({
  siteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Site',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['OWNER', 'MANAGER', 'WORKER'],
    default: 'WORKER'
  },
  status: {
    type: String,
    required: true,
    enum: ['ACTIVE', 'INACTIVE', 'REMOVED'],
    default: 'ACTIVE'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });


const SupportTeamMemberSchema = new Schema({
    firstName:{type: String, required: true },
    lastName:{type:String, required:true},
    mobileNumber:{type: String, required: true },
    email:{type: String, required: false },
    gender:{
        type: String,
        required: true,
        enum: ['MALE', 'FEMALE'], 
        default: 'MALE'
    },
    status:{
        type:String,
        required:true,
        enum:['ACTIVE','INACTIVE'],
        default:['ACTIVE']
    },
    siteId:{type: mongoose.Schema.Types.ObjectId, ref: 'Site' },
})


// Ensure unique user per site
teamMemberSchema.index({ siteId: 1, userId: 1 }, { unique: true });

export const TeamMember = model("TeamMember",teamMemberSchema)
export const SupportTeamMember = model("SupportTeamMember",SupportTeamMemberSchema)