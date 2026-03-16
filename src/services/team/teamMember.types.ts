const teamMemberTypes = /* GraphQL */ `
  enum UserRole {
    OWNER
    MANAGER
    WORKER
  }

  enum MemberStatus {
    ACTIVE
    INACTIVE
    REMOVED
  }

  type User {
    id:ID!
    firstName:String
    lastName:String
    mobileNumber:String
  }

  type TeamMember {
    id: ID!
    siteId: ID!
    userId: ID!
    user: User
    role: UserRole!
    status: MemberStatus!
    joinedAt: String!
    createdAt: String!
  }

  type Invitation {
    id: ID!
    siteId: ID!
    siteName: String!
    invitedBy: ID!
    invitedByUser: User!
    invitedUser: ID
    invitedUserInfo: User
    invitedMobileNumber: String!
    role: UserRole!
    status: InvitationStatus!
    message: String
    expiresAt: String!
    acceptedAt: String
    createdAt: String!
  }

  enum InvitationStatus {
    PENDING
    ACCEPTED
    REJECTED
    CANCELLED
  }

  type TeamMemberResponse {
    success: Boolean!
    message: String!
    data: TeamMember
  }

  type InvitationResponse {
    success: Boolean!
    message: String!
    data: Invitation
  }

  type Query {
    # Get all team members for a site
    getSiteTeamMembers(siteId: ID!): [TeamMember]!

    # Get all members count for a site
    getSiteTeamMembersCount(siteId: ID!): Int!

    # Get all pending invitations for logged-in user
    getMyPendingInvitations(userId: ID!): [Invitation]!

    # Get all invitations sent for a site
    getSiteInvitations(siteId: ID!): [Invitation]!

    # Get single invitation details
    getInvitation(invitationId: ID!): Invitation

    # Check if user is team member of a site
    isTeamMember(siteId: ID!, userId: ID!): Boolean!
  }

  type Mutation {
    # Send invitation by mobile number
    inviteTeamMember(
      siteId: ID!
      invitedByUserId: ID!
      invitedMobileNumber: String!
      role: UserRole
      message: String
    ): InvitationResponse!

    # Accept invitation
    acceptInvitation(invitationId: ID!, userId: ID!): InvitationResponse!

    # Reject invitation
    rejectInvitation(invitationId: ID!, userId: ID!): InvitationResponse!

    # Cancel invitation (by site owner)
    cancelInvitation(invitationId: ID!, userId: ID!): InvitationResponse!

    # Remove team member from site
    removeTeamMember(siteId: ID!, memberId: ID!, userId: ID!): TeamMemberResponse!

    # Update team member role
    updateTeamMemberRole(
      siteId: ID!
      memberId: ID!
      role: UserRole!
      userId: ID!
    ): TeamMemberResponse!
  }
`;

export default teamMemberTypes;