
import { mergeResolvers } from "@graphql-tools/merge"

import SiteResolvers from "../services/sites/site.resolvers"
import CountryResolvers from "../services/admin/country/country.resolvers"
import { AuthResolvers } from "../services/auth/auth.resolvers"
import teamMemberResolvers from "../services/team/teamMember.resolvers"
import BudgetResolvers from "../services/budget/budget.resolvers"
import SitePlanResolvers from "../services/plans/siteplans.resolvers"
import SupportTeamMemberResolvers from "../services/team/supportTeamMember.resolvers"

// Combine all resolvers into a single export

export const allResolvers = mergeResolvers([
  SiteResolvers,
  CountryResolvers,
  AuthResolvers,
  teamMemberResolvers,
  BudgetResolvers,
  SitePlanResolvers,
  SupportTeamMemberResolvers
])