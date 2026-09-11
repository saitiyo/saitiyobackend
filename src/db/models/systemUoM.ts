import mongoose from "mongoose";

const { Schema, model } = mongoose;

const SystemUoMSchema = new Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },

    symbol: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: ["weight", "volume", "length", "quantity"],
      required: true,
    },
  },
  {
    timestamps: false,
  }
);

SystemUoMSchema.index({
  category: 1,
});

export const SystemUoM = model("SystemUoM", SystemUoMSchema);