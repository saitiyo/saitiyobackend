import mongoose from "mongoose";
const { Schema, model } = mongoose;


const ItemSchema = new Schema(
  {
    name:        { type: String, required: true },
    description: { type: String },
    sku:         { type: String },
    barcode:     { type: String },

    // Media
    imageUri:    { type: String },
    images:      [{ type: String }],

    // Status & type
    isActive:    { type: Boolean, default: true },
    isArchived:  { type: Boolean, default: false },
    isMarketplaceVisible: { type: Boolean, default: true },
    itemType:    { type: String, enum: ["PRODUCT","SERVICE","MATERIAL","EQUIPMENT","TOOL"], default: "PRODUCT" },

    // Financial
    vatRate:     { type: Number, default: 0 },

    // Stock (denormalized base-unit quantity)
    stock:       { type: Number, default: 0 },

    // Reorder thresholds in BASE units
    reorderLevel:    { type: Number, default: 0 },
    reorderQuantity: { type: Number, default: 0 },

    // Site scope
    siteId:      { type: Schema.Types.ObjectId, ref: "Site", required: true },

    // Structured category (manual)
    category:    { type: Schema.Types.ObjectId, ref: "ItemCategory" },

    // AI categorization fields
    primaryCategory: { type: String, default: "Other" },
    subcategory:     { type: String },
    categoryPath:    [{ type: String }],
    tags:            [{ type: String }],
    confidence:      { type: Number, default: 0.5 },
    searchQuery:     { type: String },

    defaultSupplier: { type: Schema.Types.ObjectId, ref: "Supplier" },
  },
  { timestamps: true }
);

// Prisma-inspired indexes + your search needs
ItemSchema.index({ isMarketplaceVisible: 1, isArchived: 1, primaryCategory: 1, subcategory: 1 });
ItemSchema.index({ name: 1 });
ItemSchema.index({ tags: 1 });
ItemSchema.index({ searchQuery: 1 });
ItemSchema.index({ siteId: 1, sku: 1 });
ItemSchema.index({ siteId: 1, barcode: 1 });

export const Item = model("Item", ItemSchema);


const ItemUoMSchema = new Schema(
  {
    itemId:           { type: Schema.Types.ObjectId, ref: "Item", required: true },
    label:            { type: String, required: true },          // "crate", "50kg bag"
    conversionFactor: { type: Number, required: true, default: 1 }, // base units per 1 of this UoM

    sellingPrice:     { type: Number, default: 0 },
    costPrice:        { type: Number, default: 0 },

    isBaseUnit:       { type: Boolean, default: false },         // exactly one per item
    isDefault:        { type: Boolean, default: false },         // shown first in issuing/purchase UI

    // Optional link to system-wide UoM (null = fully custom)
    systemUomId:      { type: Schema.Types.ObjectId, ref: "SystemUoM", default: null },
  },
  { timestamps: true }
);

// One row per (item, label) — prevents duplicate "bag" definitions on the same item
ItemUoMSchema.index({ itemId: 1, label: 1 }, { unique: true });

// Exactly one base unit per item
ItemUoMSchema.index(
  { itemId: 1, isBaseUnit: 1 },
  { unique: true, partialFilterExpression: { isBaseUnit: true } }
);

// Exactly one default UoM per item
ItemUoMSchema.index(
  { itemId: 1, isDefault: 1 },
  { unique: true, partialFilterExpression: { isDefault: true } }
);

export const ItemUoM = model("ItemUoM", ItemUoMSchema);


const StockMovementSchema = new Schema(
  {
    itemId:        { type: Schema.Types.ObjectId, ref: "Item", required: true },

    // UoM used at time of transaction
    uomId:         { type: Schema.Types.ObjectId, ref: "ItemUoM" },
    uomLabel:      { type: String },                              // snapshot
    uomQty:        { type: Number, required: true },               // e.g., 2 crates

    // Actual base-unit impact
    baseUnitDelta: { type: Number, required: true },               // e.g., +24 or -24

    movementType:  {
      type: String,
      enum: ["PURCHASE","SALE","ADJUSTMENT","TRANSFER_IN","TRANSFER_OUT","RETURN","ISSUE","RECEIPT","WASTE","COUNT"],
      required: true,
    },

    referenceId:   { type: String },                              // PO id, adjustment id, task id, etc.
    note:          { type: String },

    operatorId:    { type: Schema.Types.ObjectId, ref: "User", required: true },
    siteId:        { type: Schema.Types.ObjectId, ref: "Site", required: true },

    // Construction-specific context (optional)
    taskId:        { type: Schema.Types.ObjectId, ref: "Task" },
    equipmentId:   { type: Schema.Types.ObjectId, ref: "Equipment" },
  },
  { timestamps: true }
);

StockMovementSchema.index({ itemId: 1, createdAt: -1 });
StockMovementSchema.index({ siteId: 1, movementType: 1, createdAt: -1 });
StockMovementSchema.index({ referenceId: 1 });

export const StockMovement = model("StockMovement", StockMovementSchema);




const ItemCategorySchema = new Schema(
  {
    name:        { type: String, required: true },
    description: { type: String },
    parentId:    { type: Schema.Types.ObjectId, ref: "ItemCategory", default: null },
  },
  { timestamps: true }
);

export const ItemCategory = model("ItemCategory", ItemCategorySchema);