import { mergeTypeDefs } from "@graphql-tools/merge"

import siteTypes from "../services/sites/site.types"
import countryTypes from "../services/admin/country/country.types"
import authTypes from "../services/auth/auth.types"
import teamMemberTypes from "../services/team/teamMember.types"
import budgetTypes from "../services/budget/budget.types"
import sitePlanTypes from "../services/plans/siteplans.types"
import supportTeamMemberTypes from "../services/team/supportTeamMember.types"
import unitOfMeasureTypes from "../services/unitsOfMeasure/unitsOfMeasure.types"

export const typeDefs = mergeTypeDefs([
  siteTypes,
  countryTypes,
  authTypes,
  teamMemberTypes,
  budgetTypes,
  sitePlanTypes,
  supportTeamMemberTypes,
  // unitOfMeasureTypes
])
