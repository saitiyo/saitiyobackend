import mongoose from "mongoose";

const { Schema, model } = mongoose;

// ─── SitePlan Schema ──────────────────────────────────────────────────────────
// Each document represents one uploaded PDF plan for a site.
// The actual file lives on Cloudinary; we store the secure URL + metadata.

const SitePlanSchema = new Schema(
  {
    site: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Site",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    planType: {
      type: String,
      enum: [
        "FLOOR_PLAN",
        "ELEVATION",
        "SECTION",
        "SITE_LAYOUT",
        "ELECTRICAL",
        "PLUMBING",
        "STRUCTURAL",
        "OTHER",
      ],
      required: true,
      default: "OTHER",
    },
    fileUrl: {
      type: String,
      required: true, // Cloudinary secure_url
    },
    publicId: {
      type: String,
      required: true, // Cloudinary public_id — needed if we ever add deletion via API
    },
    fileSize: {
      type: Number, // bytes — stored for display ("2.4 MB")
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const SitePlan = model("SitePlan", SitePlanSchema);