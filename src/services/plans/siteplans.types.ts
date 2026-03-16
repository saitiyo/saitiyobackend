const sitePlanTypes = /* GraphQL */ `

  # ─── Enums ───────────────────────────────────────────────────────────────────

  enum PlanType {
    FLOOR_PLAN
    ELEVATION
    SECTION
    SITE_LAYOUT
    ELECTRICAL
    PLUMBING
    STRUCTURAL
    OTHER
  }

  # ─── SitePlan ─────────────────────────────────────────────────────────────────
  # One document per uploaded PDF. The file itself lives on Cloudinary.

  type SitePlan {
    _id: ID!
    site: ID!
    title: String!
    planType: PlanType!
    fileUrl: String!      # Cloudinary secure_url — used for preview & download
    publicId: String!     # Cloudinary public_id
    fileSize: Int         # bytes
    description: String
    uploadedBy: ID!
    createdAt: String
    updatedAt: String
  }

  # ─── Queries ──────────────────────────────────────────────────────────────────

  type Query {
    # All plans for a site, optionally filtered by type
    getSitePlans(siteId: ID!, planType: PlanType): [SitePlan!]!

    # Single plan detail
    getSitePlan(id: ID!): SitePlan
  }

  # ─── Mutations ────────────────────────────────────────────────────────────────

  type Mutation {
    # Called after the frontend uploads to Cloudinary.
    # Stores the returned URL + metadata in MongoDB.
    addSitePlan(
      siteId: ID!
      uploadedBy: ID!
      title: String!
      planType: PlanType!
      fileUrl: String!
      publicId: String!
      fileSize: Int
      description: String
    ): SitePlan!

    # Delete a plan record (and optionally the Cloudinary asset via publicId)
    deleteSitePlan(id: ID!, requesterId: ID!): Boolean!
  }
`;

export default sitePlanTypes;