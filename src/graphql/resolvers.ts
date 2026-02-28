
import { mergeResolvers } from "@graphql-tools/merge"

import ProjectResolvers from "../services/projects/project.resolvers"

export const allResolvers = mergeResolvers([
  ProjectResolvers
])