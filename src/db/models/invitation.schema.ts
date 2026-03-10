import mongoose, { Schema } from 'mongoose';

const invitationSchema = new Schema({
  siteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Site',
    required: true
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  invitedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  invitedMobileNumber: {
    type: String,
    required: true
    // Store mobile number in case user doesn't exist yet
  },
  role: {
    type: String,
    enum: ['OWNER', 'MANAGER', 'WORKER'],
    default: 'WORKER'
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'],
    default: 'PENDING'
  },
  expiresAt: {
    type: Date,
    required: true
    // Invitation expires after 7 days (set when creating)
  },
  message: {
    type: String
    // Optional message from inviter
  },
  acceptedAt: {
    type: Date
    // When user accepted the invitation
  }
}, { timestamps: true });

// Index for efficient queries
invitationSchema.index({ siteId: 1, status: 1 });
invitationSchema.index({ invitedUser: 1, status: 1 });
invitationSchema.index({ invitedMobileNumber: 1, siteId: 1 });

export const Invitation = mongoose.model('Invitation', invitationSchema);