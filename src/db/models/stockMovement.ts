import mongoose from "mongoose";

const { Schema, model } = mongoose;

const StockMovementSchema = new Schema(
  {
    itemId: {
      type: Schema.Types.ObjectId,
      ref: "Item",
      required: true,
      index: true,
    },

    // UoM used for this movement
    uomId: {
      type: Schema.Types.ObjectId,
      ref: "ItemUoM",
      default: null,
    },

    // Snapshot of UoM label
    // Preserved even if the UoM is later deleted
    uomLabel: {
      type: String,
      default: null,
    },

    // How many of that UoM moved
    // Example: 2 crates
    uomQty: {
      type: Number,
      required: true,
    },

    // Actual change applied to Item.stock
    // Always stored in base units
    //
    // Example:
    // 2 crates × 12 = +24
    // 2 crates × 12 = -24
    baseUnitDelta: {
      type: Number,
      required: true,
    },

    movementType: {
      type: String,
      enum: [
        "SALE",
        "RESTOCK",
        "ADJUSTMENT",
        "OPENING",
        "TRANSFER",
        "WRITE_OFF",
      ],
      required: true,
    },

    referenceId: {
      type: Schema.Types.ObjectId,
      default: null,
    },

    note: {
      type: String,
      default: null,
      trim: true,
    },

    operatorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Important: keep the site on the movement too.
    // This makes site-level inventory queries and authorization easier.
    siteId: {
      type: Schema.Types.ObjectId,
      ref: "Site",
      required: true,
      index: true,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);

StockMovementSchema.index({
  itemId: 1,
  createdAt: -1,
});

StockMovementSchema.index({
  siteId: 1,
  createdAt: -1,
});

StockMovementSchema.index({
  movementType: 1,
});

export const StockMovement = model(
  "StockMovement",
  StockMovementSchema
);