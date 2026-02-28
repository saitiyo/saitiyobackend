import { mergeTypeDefs } from "@graphql-tools/merge"

import projectTypes from "../services/projects/project.types"

export const typeDefs = mergeTypeDefs([
  projectTypes
])
