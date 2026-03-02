
import { mergeResolvers } from "@graphql-tools/merge"

import ProjectResolvers from "../services/projects/project.resolvers"
import CountryResolvers from "../services/admin/country/country.resolvers"

// Combine all resolvers into a single export

export const allResolvers = mergeResolvers([
  ProjectResolvers,
  CountryResolvers
])