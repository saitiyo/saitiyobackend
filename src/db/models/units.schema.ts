// Defines unit NAMES once, globally. No conversion logic here.

import mongoose from "mongoose";
const { Schema, model } = mongoose;

const UnitOfMeasureSchema = new Schema(
  {
    name:        { type: String, required: true, unique: true }, // "bag", "strip", "box"
    label:       { type: String },                               // "bg", "str", "bx"
    description: { type: String },                               // "50kg paper sack"
  },
  { timestamps: true }
);
 
export const UnitOfMeasure = model("UnitOfMeasure", UnitOfMeasureSchema);