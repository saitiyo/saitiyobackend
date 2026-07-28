import mongoose from "mongoose";
const { Schema, model } = mongoose;

const SystemUoMSchema = new Schema(
  {
    label:       { type: String, required: true, unique: true }, // "kilogram", "bag"
    symbol:      { type: String },                               // "kg", "bg"
    description: { type: String },                               // "50kg paper sack"
    category:    { type: String, enum: ["weight","volume","length","quantity","area","time"], default: "quantity" },
  },
  { timestamps: true }
);

export const SystemUoM = model("SystemUoM", SystemUoMSchema);