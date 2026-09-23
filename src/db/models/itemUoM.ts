import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ItemUoMSchema = new Schema(
  {
    itemId: {
      type: Schema.Types.ObjectId,
      ref: "Item",
      required: true,
      index: true,
    },

    label: {
      type: String,
      required: true,
      trim: true,
    },

    conversionFactor: {
      type: Number,
      required: true,
      min: 0,
    },

    sellingPrice: {
      type: Number,
      default: 0,
    },

    costPrice: {
      type: Number,
      default: 0,
    },

    // Exactly one UoM should normally be the base unit
    isBaseUnit: {
      type: Boolean,
      default: false,
    },

    // UoM displayed first in the selling UI
    isDefault: {
      type: Boolean,
      default: false,
    },

    systemUomId: {
      type: Schema.Types.ObjectId,
      ref: "SystemUoM",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ItemUoMSchema.index({
//   itemId: 1,
// });

export const ItemUoM = model("ItemUoM", ItemUoMSchema);