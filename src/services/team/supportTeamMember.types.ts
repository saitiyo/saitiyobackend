const supportTeamMemberTypes = /* GraphQL */ `

  # ─── Enums ───────────────────────────────────────────────────────────────────

  enum Gender {
    MALE
    FEMALE
  }

  enum SupportMemberStatus {
    ACTIVE
    INACTIVE
  }

  # ─── SupportTeamMember ───────────────────────────────────────────────────────

  type SupportTeamMember {
    _id: ID!
    firstName: String!
    lastName: String!
    fullName: String!          # derived: firstName + lastName
    mobileNumber: String!
    email: String
    gender: Gender!
    status: SupportMemberStatus!
    siteId: ID!
    createdAt: String
    updatedAt: String
  }

  # ─── Queries ─────────────────────────────────────────────────────────────────

  type Query {
    # All support members for a site, optionally filtered by status
    getSupportTeamMembers(
      siteId: ID!
      status: SupportMemberStatus
    ): [SupportTeamMember!]!

    # Single member detail
    getSupportTeamMember(id: ID!): SupportTeamMember
  }

  # ─── Mutations ───────────────────────────────────────────────────────────────

  type Mutation {
    # Add a new support team member to a site
    addSupportTeamMember(
      siteId: ID!
      firstName: String!
      lastName: String!
      mobileNumber: String!
      email: String
      gender: Gender!
    ): SupportTeamMember!

    # Update member details
    updateSupportTeamMember(
      id: ID!
      firstName: String
      lastName: String
      mobileNumber: String
      email: String
      gender: Gender
    ): SupportTeamMember!

    # Toggle a member's status between ACTIVE and INACTIVE
    setSupportTeamMemberStatus(
      id: ID!
      status: SupportMemberStatus!
    ): SupportTeamMember!

    # Hard delete — only if no longer needed on this site
    deleteSupportTeamMember(id: ID!): Boolean!
  }
`;

export default supportTeamMemberTypes;