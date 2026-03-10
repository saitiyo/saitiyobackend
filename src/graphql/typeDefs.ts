import { mergeTypeDefs } from "@graphql-tools/merge"

import siteTypes from "../services/sites/site.types"
import countryTypes from "../services/admin/country/country.types"
import authTypes from "../services/auth/auth.types"
import teamMemberTypes from "../services/team/teamMember.types"

export const typeDefs = mergeTypeDefs([
  siteTypes,
  countryTypes,
  authTypes,
  teamMemberTypes 
])
