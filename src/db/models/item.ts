import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ItemSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    imageUri: {
      type: String,
      default: null,
    },

    images: {
      type: [String],
      default: [],
    },

    price: {
      type: Number,
      default: 0,
    },

    costPrice: {
      type: Number,
      default: 0,
    },

    stock: {
      type: Number,
      default: 0,
    },

    description: {
      type: String,
      default: null,
    },

    isArchived: {
      type: Boolean,
      default: false,
    },

    isMarketplaceVisible: {
      type: Boolean,
      default: true,
    },

    itemType: {
      type: String,
      enum: ["PRODUCT", "SERVICE"],
      default: "PRODUCT",
    },

    // Inventory belongs to a site
    siteId: {
      type: Schema.Types.ObjectId,
      ref: "Site",
      required: true,
      index: true,
    },

    // AI Categorization Fields
    primaryCategory: {
      type: String,
      default: "Other",
    },

    subcategory: {
      type: String,
      default: null,
    },

    categoryPath: {
      type: [String],
      default: [],
    },

    tags: {
      type: [String],
      default: [],
    },

    confidence: {
      type: Number,
      default: 0.5,
    },

    searchQuery: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

ItemSchema.index({
  isMarketplaceVisible: 1,
  isArchived: 1,
  primaryCategory: 1,
  subcategory: 1,
});

ItemSchema.index({
  name: 1,
});

ItemSchema.index({
  tags: 1,
});

ItemSchema.index({
  searchQuery: 1,
});

export const Item = model("Item", ItemSchema);