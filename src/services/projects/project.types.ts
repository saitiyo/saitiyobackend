const projectTypes = /* GraphQL */ `
           type Project {
            id: ID!
            name: String!
            logoUrl: String
            status: ProjectStatus!
            daysLeft: Int
            progress: Float
            notificationCount: Int
        }

        enum ProjectStatus {
        IN_PROGRESS
        CLOSED
        ON_HOLD
        }

        type Query {
        # Returns the list of projects for the dashboard
        projects: [Project]
        project(id: ID!): Project
        }

        type Mutation {
        # Handles the "Add New" button logic
        createProject(
            name: String!, 
            endDate: String!, 
            logoUrl: String
        ): Project
  }
`

export default projectTypes;