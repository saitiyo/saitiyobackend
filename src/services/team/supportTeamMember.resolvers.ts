import { GraphQLError } from "graphql";
import { SupportTeamMember } from "../../db/models/team.schema";
import { Site } from "../../db/models/site.schema";

// ─── Helper ───────────────────────────────────────────────────────────────────
// Derives fullName so the GraphQL type can expose it without storing it.
const withFullName = (doc: any) => ({
  ...doc,
  fullName: `${doc.firstName} ${doc.lastName}`.trim(),
});

const SupportTeamMemberResolvers = {

  Query: {
    // ── getSupportTeamMembers ───────────────────────────────────────────────
    getSupportTeamMembers: async (
      _: any,
      { siteId, status }: { siteId: string; status?: string }
    ) => {
      const filter: Record<string, any> = { siteId };
      if (status) filter.status = status;

      const members = await SupportTeamMember.find(filter).sort({ createdAt: -1 });
      return members.map((m) => withFullName(m.toObject()));
    },

    // ── getSupportTeamMember ────────────────────────────────────────────────
    getSupportTeamMember: async (_: any, { id }: { id: string }) => {
      const member = await SupportTeamMember.findById(id);
      if (!member)
        throw new GraphQLError("Support team member not found", {
          extensions: { code: "NOT_FOUND" },
        });

      return withFullName(member.toObject());
    },
  },

  Mutation: {
    // ── addSupportTeamMember ────────────────────────────────────────────────
    addSupportTeamMember: async (
      _: any,
      {
        siteId,
        firstName,
        lastName,
        mobileNumber,
        email,
        gender,
      }: {
        siteId: string;
        firstName: string;
        lastName: string;
        mobileNumber: string;
        email?: string;
        gender: string;
      }
    ) => {
      // Confirm the site exists
      const site = await Site.findById(siteId);
      if (!site)
        throw new GraphQLError("Site not found", {
          extensions: { code: "NOT_FOUND" },
        });

      // Prevent duplicate mobile numbers on the same site
      const existing = await SupportTeamMember.findOne({ siteId, mobileNumber });
      if (existing)
        throw new GraphQLError(
          "A support member with this mobile number already exists on this site",
          { extensions: { code: "BAD_USER_INPUT" } }
        );

      const member = new SupportTeamMember({
        siteId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        mobileNumber: mobileNumber.trim(),
        email: email?.trim() ?? null,
        gender,
        status: "ACTIVE",
      });

      await member.save();
      return withFullName(member.toObject());
    },

    // ── updateSupportTeamMember ─────────────────────────────────────────────
    updateSupportTeamMember: async (
      _: any,
      {
        id,
        firstName,
        lastName,
        mobileNumber,
        email,
        gender,
      }: {
        id: string;
        firstName?: string;
        lastName?: string;
        mobileNumber?: string;
        email?: string;
        gender?: string;
      }
    ) => {
      const member = await SupportTeamMember.findById(id);
      if (!member)
        throw new GraphQLError("Support team member not found", {
          extensions: { code: "NOT_FOUND" },
        });

      // If changing mobile number, check it isn't taken by another member on the same site
    //   if (mobileNumber && mobileNumber !== member.mobileNumber){
    //     const duplicate = await SupportTeamMember.findOne({
    //       siteId: member.siteId,
    //       mobileNumber: mobileNumber.trim(),
    //       _id: { $ne: id as any},
    //     });
    //     if (duplicate)
    //       throw new GraphQLError(
    //         "Another support member with this mobile number already exists on this site",
    //         { extensions: { code: "BAD_USER_INPUT" }}
    //       );
    //   }

      // Only apply fields that were actually passed
      if (firstName !== undefined) member.firstName = firstName.trim();
      if (lastName  !== undefined) member.lastName  = lastName.trim();
      if (mobileNumber !== undefined) member.mobileNumber = mobileNumber.trim();
      if (email     !== undefined) member.email     = email?.trim() ?? null;
      if (gender    !== undefined) member.gender    = gender as any;

      await member.save();
      return withFullName(member.toObject());
    },

    // ── setSupportTeamMemberStatus ──────────────────────────────────────────
    setSupportTeamMemberStatus: async (
      _: any,
      { id, status }: { id: string; status: string }
    ) => {
      const member = await SupportTeamMember.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );

      if (!member)
        throw new GraphQLError("Support team member not found", {
          extensions: { code: "NOT_FOUND" },
        });

      return withFullName(member.toObject());
    },

    // ── deleteSupportTeamMember ─────────────────────────────────────────────
    deleteSupportTeamMember: async (_: any, { id }: { id: string }) => {
      const member = await SupportTeamMember.findById(id);
      if (!member)
        throw new GraphQLError("Support team member not found", {
          extensions: { code: "NOT_FOUND" },
        });

      await SupportTeamMember.findByIdAndDelete(id);
      return true;
    },
  },
};

export default SupportTeamMemberResolvers;