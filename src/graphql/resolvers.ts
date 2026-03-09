
import { mergeResolvers } from "@graphql-tools/merge"

import SiteResolvers from "../services/sites/site.resolvers"
import CountryResolvers from "../services/admin/country/country.resolvers"
import { AuthResolvers } from "../services/auth/auth.resolvers"

// Combine all resolvers into a single export

export const allResolvers = mergeResolvers([
  SiteResolvers,
  CountryResolvers,
  AuthResolvers
])