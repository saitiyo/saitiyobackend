const taskTypes = /* GraphQL */ `
  enum TaskStatus {
    BACKLOG
    IN_PROGRESS
    REVIEW
    DONE
    CANCELLED
  }

  enum TaskPriority {
    LOW
    MEDIUM
    HIGH
    URGENT
  }

  # Add to your existing types
type UserBasic {
  _id: ID!
  firstName: String!
  lastName: String!
}

type TaskDetails {
  _id: ID!
  title: String!
  description: String
  status: TaskStatus!
  priority: TaskPriority!
  dueDate: String
  progress: Int!
  createdBy: UserBasic
  assignees: [UserBasic!]!
  createdAt: String!
  updatedAt: String!
}

type TeamMemberBasic {
  _id: ID!
  userId: UserBasic!
  role: String!
}

  type Task {
    _id: ID!
    siteId: ID!
    title: String!
    description: String
    assignees: [ID!]!
    createdBy: ID!
    status: TaskStatus!
    priority: TaskPriority!
    dueDate: String
    isDeleted: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type TaskBoardColumn {
    status: TaskStatus!
    tasks: [Task!]!
    count: Int!
  }

  type TaskBoard {
    columns: [TaskBoardColumn!]!
    totalTasks: Int!
  }

  input CreateTaskInput {
    siteId: ID!
    title: String!
    description: String
    assignees: [ID!]
    priority: TaskPriority
    dueDate: String
  }

  input UpdateTaskInput {
    title: String
    description: String
    assignees: [ID!]
    priority: TaskPriority
    dueDate: String
  }

  input UpdateTaskStatusInput {
    taskId: ID!
    status: TaskStatus!
  }

  input TaskFilterInput {
    siteId: ID!
    status: TaskStatus
    assignees: [ID!]
    priority: TaskPriority
    search: String
  }

  type Query {
    getTask(id: ID!): Task
    getTasks(filter: TaskFilterInput!): [Task!]!
    getTaskBoard(siteId: ID!): TaskBoard!
    getMyTasks(siteId: ID!): [Task!]!
    getTaskDetails(id: ID!): TaskDetails
  }

  type Mutation {
    createTask(input: CreateTaskInput!): Task!
    updateTask(id: ID!, input: UpdateTaskInput!): Task!
    updateTaskStatus(input: UpdateTaskStatusInput!): Task!
    deleteTask(id: ID!): Boolean!
  }
`;

export default taskTypes;