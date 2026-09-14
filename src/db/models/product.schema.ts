import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ProductCategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const ProductSchema = new Schema(
  {
    siteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Site",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: null },
    sku: { type: String, default: null, trim: true },
    barcode: { type: String, default: null, trim: true },
    vatRate: { type: Number, default: 0 },
    reorderLevel: { type: Number, default: 0 },
    reorderQuantity: { type: Number, default: 0 },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductCategory",
      default: null,
    },
    defaultSupplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      default: null,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ProductSchema.index({ siteId: 1, name: 1 }, { unique: true });
ProductSchema.index({ siteId: 1, sku: 1 }, { unique: true, sparse: true });

export const ProductCategory = model("ProductCategory", ProductCategorySchema);
export const Product = model("Product", ProductSchema);
