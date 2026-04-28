import { TeamMember } from "../../db/models/team.schema";
import { Invitation } from "../../db/models/invitation.schema";
import { User } from "../../db/models/models";
import { Site } from "../../db/models/site.schema";
import { addDays } from 'date-fns';

const teamMemberResolvers = {
  Query: {
    /**
     * Get all team members for a site
     */
    getSiteTeamMembers: async (_: any, { siteId }: { siteId: string }) => {
      try {
        const teamMembers = await TeamMember.find({
          siteId,
          status: 'ACTIVE'
        })
          .populate('userId', 'firstName lastName email mobileNumber')
          .sort({ joinedAt: -1 });

        return teamMembers.map((member) => ({
          ...member.toObject(),
          id: member._id,
          user: member.toObject().userId
        }));
      } catch (error) {
        console.error("Error fetching team members:", error);
        throw new Error("Failed to fetch team members");
      }
    },

    /**
     * Get count of active team members for a site
     */
    getSiteTeamMembersCount: async (_: any, { siteId }: { siteId: string }) => {
      try {
        const count = await TeamMember.countDocuments({
          siteId,
          status: 'ACTIVE'
        });
        return count;
      } catch (error) {
        console.error("Error counting team members:", error);
        throw new Error("Failed to count team members");
      }
    },

    /**
     * Get all pending invitations for a user
     */
    getMyPendingInvitations: async (_: any, { userId }: { userId: string }) => {
      try {
        const invitations = await Invitation.find({
          invitedUser: userId,
          status: 'PENDING',
          expiresAt: { $gt: new Date() } // Not expired
        })
          .sort({ createdAt: -1 });


        const  _invitedBy = await User.findById(invitations[0]?.invitedBy);

        return invitations.map((invitation) => ({
          ...invitation.toObject(),
          id: invitation._id,
          siteName:'MY SITE',
          invitedByUser:_invitedBy ? {
            id: _invitedBy._id,
            firstName: _invitedBy.firstName,
            lastName: _invitedBy.lastName,
            email: _invitedBy.email,
            mobileNumber: _invitedBy.mobileNumber
          } : null
        }));
        

      } catch (error) {
        console.error("Error fetching pending invitations:", error);
        throw new Error("Failed to fetch invitations");
      }
    },
     /**
     * Get all pending invitations for a user
     */
    getAcceptedInvitations: async (_: any, { userId }: { userId: string }) => {
      try {
        const invitations = await Invitation.find({
          invitedUser: userId,
          status: 'ACCEPTED',
          expiresAt: { $gt: new Date() } // Not expired
        })
          .sort({ createdAt: -1 });


        const  _invitedBy = await User.findById(invitations[0]?.invitedBy);

        return invitations.map((invitation) => ({
          ...invitation.toObject(),
          id: invitation._id,
          siteName:'MY SITE',
          invitedByUser:_invitedBy ? {
            id: _invitedBy._id,
            firstName: _invitedBy.firstName,
            lastName: _invitedBy.lastName,
            email: _invitedBy.email,
            mobileNumber: _invitedBy.mobileNumber
          } : null
        }));
        

      } catch (error) {
        console.error("Error fetching accepted invitations:", error);
        throw new Error("Failed to fetch invitations");
      }
    },

     /**
     * Get all pending invitations for a user
     */
    getRejectedInvitations: async (_: any, { userId }: { userId: string }) => {
      try {
        const invitations = await Invitation.find({
          invitedUser: userId,
          status: 'REJECTED',
          expiresAt: { $gt: new Date() } // Not expired
        })
          .sort({ createdAt: -1 });


        const  _invitedBy = await User.findById(invitations[0]?.invitedBy);

        return invitations.map((invitation) => ({
          ...invitation.toObject(),
          id: invitation._id,
          siteName:'MY SITE',
          invitedByUser:_invitedBy ? {
            id: _invitedBy._id,
            firstName: _invitedBy.firstName,
            lastName: _invitedBy.lastName,
            email: _invitedBy.email,
            mobileNumber: _invitedBy.mobileNumber
          } : null
        }));
        

      } catch (error) {
        console.error("Error fetching rejected invitations:", error);
        throw new Error("Failed to fetch invitations");
      }
    },

    /**
     * Get all invitations for a site (for site owner/manager)
     */
    getSiteInvitations: async (_: any, { siteId }: { siteId: string }) => {
      try {
        const invitations = await Invitation.find({ siteId })
          .populate('siteId', 'name logoUrl')
          .populate('invitedByUser', 'firstName lastName email mobileNumber')
          .populate('invitedUser', 'firstName lastName email mobileNumber')
          .sort({ createdAt: -1 });

        return invitations.map((invitation) => ({
          ...invitation.toObject(),
          id: invitation._id,
          siteName: invitation.toObject().siteId || '',
          invitedByUser: invitation.toObject().invitedBy,
          invitedUserInfo: invitation.toObject().invitedUser
        }));
      } catch (error) {
        console.error("Error fetching site invitations:", error);
        throw new Error("Failed to fetch site invitations");
      }
    },

    /**
     * Get single invitation details
     */
    getInvitation: async (_: any, { invitationId }: { invitationId: string }) => {
      try {
        const invitation = await Invitation.findById(invitationId)
          .populate('siteId', 'name logoUrl')
          .populate('invitedByUser', 'firstName lastName email mobileNumber')
          .populate('invitedUser', 'firstName lastName email mobileNumber');

        if (!invitation) {
          throw new Error("Invitation not found");
        }

        return {
          ...invitation.toObject(),
          id: invitation._id,
          siteName: invitation.toObject().siteId || '',
          invitedByUser: invitation.toObject().invitedBy,
          invitedUserInfo: invitation.toObject().invitedUser
        };
      } catch (error) {
        console.error("Error fetching invitation:", error);
        throw new Error("Failed to fetch invitation");
      }
    },

    /**
     * Check if user is a team member of a site
     */
    isTeamMember: async (
      _: any,
      { siteId, userId }: { siteId: string; userId: string }
    ) => {
      try {
        const member = await TeamMember.findOne({
          siteId,
          userId,
          status: 'ACTIVE'
        });
        return !!member;
      } catch (error) {
        console.error("Error checking team member:", error);
        return false;
      }
    }
  },

  Mutation: {
    /**
     * Send invitation to user by mobile number
     */
    inviteTeamMember: async (
      _: any,
      {
        siteId,
        invitedByUserId,
        invitedMobileNumber,
        role = 'WORKER',
        message
      }: {
        siteId: string;
        invitedByUserId: string;
        invitedMobileNumber: string;
        role?: string;
        message?: string;
      }
    ) => {
      try {
        // Verify site exists and user is owner/manager
        const site = await Site.findById(siteId);
        if (!site) {
          return {
            success: false,
            message: "Site not found",
            data: null
          };
        }

        // Check if inviter is owner or manager
        const inviter = await TeamMember.findOne({
          siteId,
          userId: invitedByUserId
        });

        if (!inviter || !['OWNER', 'MANAGER'].includes(inviter.role)) {
          return {
            success: false,
            message: "Only site owner or manager can invite team members",
            data: null
          };
        }

        // Check if mobile number belongs to existing user
        const userToInvite = await User.findOne({
          mobileNumber: invitedMobileNumber
        });

        // Check if already a team member
        if (userToInvite) {
          const existingMember = await TeamMember.findOne({
            siteId,
            userId: userToInvite._id
          });

          if (existingMember && existingMember.status === 'ACTIVE') {
            return {
              success: false,
              message: "User is already a team member",
              data: null
            };
          }
        }

        // Check if pending invitation already exists
        const existingInvitation = await Invitation.findOne({
          siteId,
          invitedMobileNumber,
          status: 'PENDING'
        });

        if (existingInvitation) {
          return {
            success: false,
            message: "User already has a pending invitation for this site",
            data: null
          };
        }

        // Create invitation
        const invitation = new Invitation({
          siteId,
          invitedBy: invitedByUserId,
          invitedUser: userToInvite?._id || null,
          invitedMobileNumber,
          role,
          message,
          expiresAt: addDays(new Date(), 7) // Expire in 7 days
        });

        const savedInvitation = await invitation.save();
        const populatedInvitation = await Invitation.findById(savedInvitation._id)
          .populate('siteId', 'name logoUrl')
          .populate('invitedByUser', 'firstName lastName email mobileNumber');

        return {
          success: true,
          message: "Invitation sent successfully",
          data: {
            ...populatedInvitation?.toObject(),
            id: populatedInvitation?._id,
            siteName: (populatedInvitation?.toObject() as any).siteId?.name || '',
            invitedByUser: (populatedInvitation?.toObject() as any).invitedByUser
          }
        };
      } catch (error) {
        console.error("Error sending invitation:", error);
        return {
          success: false,
          message: "Failed to send invitation",
          data: null
        };
      }
    },

    /**
     * Accept invitation
     */
    acceptInvitation: async (
      _: any,
      { invitationId, userId }: { invitationId: string; userId: string }
    ) => {
      try {
        const invitation = await Invitation.findById(invitationId);

        if (!invitation) {
          return {
            success: false,
            message: "Invitation not found",
            data: null
          };
        }

        // Verify invitation is for this user and not expired
        if (invitation.invitedUser?.toString() !== userId) {
          return {
            success: false,
            message: "This invitation is not for you",
            data: null
          };
        }

        if (invitation.status !== 'PENDING') {
          return {
            success: false,
            message: `Invitation is already ${invitation.status.toLowerCase()}`,
            data: null
          };
        }

        if (new Date() > invitation.expiresAt) {
          return {
            success: false,
            message: "Invitation has expired",
            data: null
          };
        }

        // Create team member entry
        const teamMember = new TeamMember({
          siteId: invitation.siteId,
          userId,
          role: invitation.role,
          status: 'ACTIVE'
        });

        await teamMember.save();

        // Update invitation status
        invitation.status = 'ACCEPTED';
        invitation.acceptedAt = new Date();
        await invitation.save();

        const populatedMember = await TeamMember.findById(teamMember._id)
          .populate('userId', 'firstName lastName email mobileNumber');

        return {
          success: true,
          message: "Invitation accepted successfully",
          data: {
            ...populatedMember?.toObject(),
            id: populatedMember?._id,
            user: (populatedMember?.toObject() as any).userId
          }
        };
      } catch (error) {
        console.error("Error accepting invitation:", error);
        return {
          success: false,
          message: "Failed to accept invitation",
          data: null
        };
      }
    },

    /**
     * Reject invitation
     */
    rejectInvitation: async (
      _: any,
      { invitationId, userId }: { invitationId: string; userId: string }
    ) => {
      try {
        const invitation = await Invitation.findById(invitationId);

        if (!invitation) {
          return {
            success: false,
            message: "Invitation not found",
            data: null
          };
        }

        // Verify invitation is for this user
        if (invitation.invitedUser?.toString() !== userId) {
          return {
            success: false,
            message: "This invitation is not for you",
            data: null
          };
        }

        if (invitation.status !== 'PENDING') {
          return {
            success: false,
            message: `Invitation is already ${invitation.status.toLowerCase()}`,
            data: null
          };
        }

        // Update invitation status
        invitation.status = 'REJECTED';
        await invitation.save();

        return {
          success: true,
          message: "Invitation rejected",
          data: {
            ...invitation.toObject(),
            id: invitation._id
          }
        };
      } catch (error) {
        console.error("Error rejecting invitation:", error);
        return {
          success: false,
          message: "Failed to reject invitation",
          data: null
        };
      }
    },

    /**
     * Cancel invitation (by site owner/manager)
     */
    cancelInvitation: async (
      _: any,
      { invitationId, userId }: { invitationId: string; userId: string }
    ) => {
      try {
        const invitation = await Invitation.findById(invitationId);

        if (!invitation) {
          return {
            success: false,
            message: "Invitation not found",
            data: null
          };
        }

        // Verify user can cancel (must be owner/manager of the site)
        const teamMember = await TeamMember.findOne({
          siteId: invitation.siteId,
          userId
        });

        if (!teamMember || !['OWNER', 'MANAGER'].includes(teamMember.role)) {
          return {
            success: false,
            message: "Only site owner or manager can cancel invitations",
            data: null
          };
        }

        if (invitation.status !== 'PENDING') {
          return {
            success: false,
            message: "Only pending invitations can be cancelled",
            data: null
          };
        }

        // Update invitation status
        invitation.status = 'CANCELLED';
        await invitation.save();

        return {
          success: true,
          message: "Invitation cancelled",
          data: {
            ...invitation.toObject(),
            id: invitation._id
          }
        };
      } catch (error) {
        console.error("Error cancelling invitation:", error);
        return {
          success: false,
          message: "Failed to cancel invitation",
          data: null
        };
      }
    },

    /**
     * Remove team member from site
     */
    removeTeamMember: async (
      _: any,
      { siteId, memberId, userId }: { siteId: string; memberId: string; userId: string }
    ) => {
      try {
        // Verify user is owner or manager
        const userRole = await TeamMember.findOne({
          siteId,
          userId
        });

        if (!userRole || !['OWNER', 'MANAGER'].includes(userRole.role)) {
          return {
            success: false,
            message: "Only site owner or manager can remove members",
            data: null
          };
        }

        // Cannot remove owner
        const memberToRemove = await TeamMember.findById(memberId);
        if (memberToRemove?.role === 'OWNER') {
          return {
            success: false,
            message: "Cannot remove site owner",
            data: null
          };
        }

        // Update member status to REMOVED
        memberToRemove!.status = 'REMOVED';
        await memberToRemove!.save();

        return {
          success: true,
          message: "Team member removed",
          data: {
            ...memberToRemove?.toObject(),
            id: memberToRemove?._id
          }
        };
      } catch (error) {
        console.error("Error removing team member:", error);
        return {
          success: false,
          message: "Failed to remove team member",
          data: null
        };
      }
    },

    /**
     * Update team member role
     */
    updateTeamMemberRole: async (
      _: any,
      { siteId, memberId, role, userId }: { siteId: string; memberId: string; role: string; userId: string }
    ) => {
      try {
        // Verify user is owner
        const userRole = await TeamMember.findOne({
          siteId,
          userId
        });

        if (!userRole || userRole.role !== 'OWNER') {
          return {
            success: false,
            message: "Only site owner can change member roles",
            data: null
          };
        }

        // Cannot change owner role
        const memberToUpdate = await TeamMember.findById(memberId);
        if (memberToUpdate?.role === 'OWNER') {
          return {
            success: false,
            message: "Cannot change owner role",
            data: null
          };
        }

        // Update role
        memberToUpdate!.role = role as any;
        await memberToUpdate!.save();

        const populatedMember = await TeamMember.findById(memberId)
          .populate('userId', 'firstName lastName email mobileNumber');

        return {
          success: true,
          message: "Member role updated",
          data: {
            ...populatedMember?.toObject(),
            id: populatedMember?._id,
            user: (populatedMember?.toObject() as any).userId
          }
        };
      } catch (error) {
        console.error("Error updating member role:", error);
        return {
          success: false,
          message: "Failed to update member role",
          data: null
        };
      }
    }
  }
};

export default teamMemberResolvers;
