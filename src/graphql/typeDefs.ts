import { mergeTypeDefs } from "@graphql-tools/merge"

import projectTypes from "../services/projects/project.types"
import countryTypes from "../services/admin/country/country.types"

export const typeDefs = mergeTypeDefs([
  projectTypes,
  countryTypes
])
