const siteTypes = /* GraphQL */ `
           type Site {
            id: ID!
            name: String!
            logoUrl: String
            status: SiteStatus!
            daysLeft: Int
            progress: Float
            notificationCount: Int
            endDate: String
        }

        enum SiteStatus {
        IN_PROGRESS
        CLOSED
        ON_HOLD
        }

        type Query {
        # Returns the list of projects for the dashboard
        getMySites(userId:ID!): [Site]
        getSite(id: ID!): Site
        }

        type Mutation {
        # Handles the "Add New" button logic
        createSite(
            userId:ID!
            name: String!, 
            endDate: String!, 
            logoUrl: String
        ): Site
  }
`

export default siteTypes;