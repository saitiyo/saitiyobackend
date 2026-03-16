import { GraphQLError } from "graphql";
import { SitePlan } from "../../db/models/siteplan.schema";
import { Site } from "../../db/models/site.schema";

const SitePlanResolvers = {
  Query: {
    // ── getSitePlans ────────────────────────────────────────────────────────
    getSitePlans: async (
      _: any,
      { siteId, planType }: { siteId: string; planType?: string }
    ) => {
      const filter: Record<string, any> = { site: siteId };
      if (planType) filter.planType = planType;

      const plans = await SitePlan.find(filter).sort({ createdAt: -1 });
      return plans.map((p) => p.toObject());
    },

    // ── getSitePlan ─────────────────────────────────────────────────────────
    getSitePlan: async (_: any, { id }: { id: string }) => {
      const plan = await SitePlan.findById(id);
      if (!plan)
        throw new GraphQLError("Site plan not found", {
          extensions: { code: "NOT_FOUND" },
        });
      return plan.toObject();
    },
  },

  Mutation: {
    // ── addSitePlan ─────────────────────────────────────────────────────────
    // Front-end uploads PDF to Cloudinary first, then calls this with the
    // returned secure_url and public_id.
    addSitePlan: async (
      _: any,
      {
        siteId,
        uploadedBy,
        title,
        planType,
        fileUrl,
        publicId,
        fileSize,
        description,
      }: {
        siteId: string;
        uploadedBy: string;
        title: string;
        planType: string;
        fileUrl: string;
        publicId: string;
        fileSize?: number;
        description?: string;
      }
    ) => {
      // Confirm the site exists
      const site = await Site.findById(siteId);
      if (!site)
        throw new GraphQLError("Site not found", {
          extensions: { code: "NOT_FOUND" },
        });

      const plan = new SitePlan({
        site: siteId,
        uploadedBy,
        title,
        planType,
        fileUrl,
        publicId,
        fileSize: fileSize ?? null,
        description: description ?? null,
      });

      await plan.save();
      return plan.toObject();
    },

    // ── deleteSitePlan ──────────────────────────────────────────────────────
    // Any team member can delete — just verifying the plan exists.
    // publicId is returned so the caller can optionally clean up Cloudinary.
    deleteSitePlan: async (
      _: any,
      { id, requesterId }: { id: string; requesterId: string }
    ) => {
      const plan = await SitePlan.findById(id);
      if (!plan)
        throw new GraphQLError("Site plan not found", {
          extensions: { code: "NOT_FOUND" },
        });

      await SitePlan.findByIdAndDelete(id);
      return true;
    },
  },
};

export default SitePlanResolvers;