import mongoose from "mongoose";
const { Schema, model } = mongoose;


const ProductSchema = new Schema(
  {
    name:        { type: String, required: true },
    description: { type: String },
    sku:         { type: String },
    barcode:     { type: String },
    isActive:    { type: Boolean, default: true },
    vatRate:     { type: Number, default: 0 },
 
    // Reorder thresholds in BASE units (site-level overrides live on SiteStock)
    reorderLevel:    { type: Number, default: 0 },
    reorderQuantity: { type: Number, default: 0 },

    siteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Site',
        required: true
     },
 
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductCategory",
    },
    defaultSupplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },
  },
  { timestamps: true }
);
 


//Product category

const ProductCategorySchema = new Schema(
  {
    name:        { type: String, required: true },
    description: { type: String },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductCategory",
      default: null,
    },
  },
  { timestamps: true }
);
 

// For a given product, this record answers:
// "How many base units does ONE of this UoM equal?"

const ProductUnitConversionSchema = new Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    unitOfMeasure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UnitOfMeasure",
      required: true,
    },
 
    // How many BASE units does ONE of this unit equal?
    conversionFactor: { type: Number, required: true, default: 1 },
 
    isBaseUnit:     { type: Boolean, default: false }, // exactly one per product
    isPurchaseUnit: { type: Boolean, default: false }, // usable on purchase orders
    isIssuingUnit:  { type: Boolean, default: false }, // usable when issuing to tasks
 
    // Cost snapshot — updated when a PO using this unit is received
    costPrice: { type: Number, default: 0 },
  },
  { timestamps: true }
);
 
// One row per (product, unitOfMeasure) pair — no duplicates
ProductUnitConversionSchema.index(
  { product: 1, unitOfMeasure: 1 },
  { unique: true }
);




export const Product = model("Product", ProductSchema);

export const ProductCategory = model("ProductCategory", ProductCategorySchema);
 
export const ProductUnitConversion = model(
  "ProductUnitConversion",
  ProductUnitConversionSchema
);