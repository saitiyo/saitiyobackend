import mongoose from "mongoose";
const { Schema, model } = mongoose;


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
 
export const ProductUnitConversion = model(
  "ProductUnitConversion",
  ProductUnitConversionSchema
);