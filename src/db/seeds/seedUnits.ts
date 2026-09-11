
import mongoose from "mongoose";
import dotenv from "dotenv";
import { SystemUoM } from "../models/systemUoM";

dotenv.config();

/**
 * System Units of Measurement
 *
 * These are global/system-level UoMs.
 * They are not tied to a specific site.
 *
 * ItemUoM can reference these using:
 * systemUomId -> SystemUoM._id
 */

const units = [
  // ─────────────────────────────────────────────────────────────
  // LENGTH
  // ─────────────────────────────────────────────────────────────
  { label: "millimeter", symbol: "mm", category: "length" },
  { label: "centimeter", symbol: "cm", category: "length" },
  { label: "meter", symbol: "m", category: "length" },
  { label: "kilometer", symbol: "km", category: "length" },
  { label: "inch", symbol: "in", category: "length" },
  { label: "foot", symbol: "ft", category: "length" },
  { label: "yard", symbol: "yd", category: "length" },
  { label: "linear meter", symbol: "lm", category: "length" },
  { label: "linear foot", symbol: "lf", category: "length" },

  // ─────────────────────────────────────────────────────────────
  // AREA
  // ─────────────────────────────────────────────────────────────
  { label: "square millimeter", symbol: "mm²", category: "area" },
  { label: "square centimeter", symbol: "cm²", category: "area" },
  { label: "square meter", symbol: "m²", category: "area" },
  { label: "square kilometer", symbol: "km²", category: "area" },
  { label: "square foot", symbol: "ft²", category: "area" },
  { label: "square yard", symbol: "yd²", category: "area" },
  { label: "acre", symbol: "ac", category: "area" },
  { label: "hectare", symbol: "ha", category: "area" },

  // ─────────────────────────────────────────────────────────────
  // VOLUME
  // ─────────────────────────────────────────────────────────────
  { label: "cubic millimeter", symbol: "mm³", category: "volume" },
  { label: "cubic centimeter", symbol: "cm³", category: "volume" },
  { label: "cubic meter", symbol: "m³", category: "volume" },
  { label: "cubic foot", symbol: "ft³", category: "volume" },
  { label: "cubic yard", symbol: "yd³", category: "volume" },

  // ─────────────────────────────────────────────────────────────
  // WEIGHT / MASS
  // ─────────────────────────────────────────────────────────────
  { label: "milligram", symbol: "mg", category: "weight" },
  { label: "gram", symbol: "g", category: "weight" },
  { label: "kilogram", symbol: "kg", category: "weight" },
  { label: "tonne", symbol: "t", category: "weight" },
  { label: "pound", symbol: "lb", category: "weight" },
  { label: "ounce", symbol: "oz", category: "weight" },
  { label: "ton", symbol: "ton", category: "weight" },
  { label: "long ton", symbol: "LT", category: "weight" },

  // ─────────────────────────────────────────────────────────────
  // LIQUID / VOLUME
  // ─────────────────────────────────────────────────────────────
  { label: "milliliter", symbol: "ml", category: "volume" },
  { label: "liter", symbol: "L", category: "volume" },
  { label: "gallon", symbol: "gal", category: "volume" },
  { label: "imperial gallon", symbol: "imp gal", category: "volume" },
  { label: "fluid ounce", symbol: "fl oz", category: "volume" },
  { label: "barrel", symbol: "bbl", category: "volume" },

  // ─────────────────────────────────────────────────────────────
  // QUANTITY / COUNT
  // ─────────────────────────────────────────────────────────────
  { label: "piece", symbol: "pc", category: "quantity" },
  { label: "unit", symbol: "unit", category: "quantity" },
  { label: "number", symbol: "no.", category: "quantity" },
  { label: "each", symbol: "ea", category: "quantity" },
  { label: "pair", symbol: "pr", category: "quantity" },
  { label: "set", symbol: "set", category: "quantity" },
  { label: "lot", symbol: "lot", category: "quantity" },
  { label: "item", symbol: "item", category: "quantity" },

  // ─────────────────────────────────────────────────────────────
  // PACKAGING
  // ─────────────────────────────────────────────────────────────
  { label: "bag", symbol: "bag", category: "quantity" },
  { label: "sack", symbol: "sck", category: "quantity" },
  { label: "box", symbol: "bx", category: "quantity" },
  { label: "carton", symbol: "ctn", category: "quantity" },
  { label: "pallet", symbol: "plt", category: "quantity" },
  { label: "roll", symbol: "rl", category: "quantity" },
  { label: "coil", symbol: "coil", category: "quantity" },
  { label: "drum", symbol: "drm", category: "quantity" },
  { label: "bundle", symbol: "bdl", category: "quantity" },
  { label: "strip", symbol: "str", category: "quantity" },
  { label: "sheet", symbol: "sht", category: "quantity" },
  { label: "panel", symbol: "pnl", category: "quantity" },
  { label: "slab", symbol: "slb", category: "quantity" },
  { label: "tile", symbol: "tile", category: "quantity" },
  { label: "block", symbol: "blk", category: "quantity" },
  { label: "brick", symbol: "brk", category: "quantity" },
  { label: "plank", symbol: "plk", category: "quantity" },
  { label: "board", symbol: "brd", category: "quantity" },
  { label: "length", symbol: "lgth", category: "quantity" },
  { label: "pack", symbol: "pk", category: "quantity" },
  { label: "tube", symbol: "tube", category: "quantity" },
  { label: "can", symbol: "can", category: "quantity" },
  { label: "bucket", symbol: "bkt", category: "quantity" },
  { label: "container", symbol: "cont", category: "quantity" },
  { label: "jar", symbol: "jar", category: "quantity" },

  // ─────────────────────────────────────────────────────────────
  // TIME
  // ─────────────────────────────────────────────────────────────
  { label: "hour", symbol: "hr", category: "quantity" },
  { label: "day", symbol: "day", category: "quantity" },
  { label: "week", symbol: "wk", category: "quantity" },
  { label: "month", symbol: "mo", category: "quantity" },
  { label: "shift", symbol: "shft", category: "quantity" },
  { label: "man-hour", symbol: "mh", category: "quantity" },
  { label: "man-day", symbol: "md", category: "quantity" },

  // ─────────────────────────────────────────────────────────────
  // ELECTRICAL
  // ─────────────────────────────────────────────────────────────
  { label: "kilowatt", symbol: "kW", category: "quantity" },
  { label: "kilowatt-hour", symbol: "kWh", category: "quantity" },
  { label: "ampere", symbol: "A", category: "quantity" },
  { label: "volt", symbol: "V", category: "quantity" },
  { label: "kilovolt-ampere", symbol: "kVA", category: "quantity" },

  // ─────────────────────────────────────────────────────────────
  // PRESSURE / FORCE
  // ─────────────────────────────────────────────────────────────
  { label: "pascal", symbol: "Pa", category: "quantity" },
  { label: "megapascal", symbol: "MPa", category: "quantity" },
  { label: "bar", symbol: "bar", category: "quantity" },
  { label: "psi", symbol: "psi", category: "quantity" },
  { label: "newton", symbol: "N", category: "quantity" },
  { label: "kilonewton", symbol: "kN", category: "quantity" },

  // ─────────────────────────────────────────────────────────────
  // RATE / RATIO
  // ─────────────────────────────────────────────────────────────
  { label: "percent", symbol: "%", category: "quantity" },
  { label: "ratio", symbol: "ratio", category: "quantity" },
  { label: "parts per million", symbol: "ppm", category: "quantity" },

  // ─────────────────────────────────────────────────────────────
  // TEMPERATURE
  // ─────────────────────────────────────────────────────────────
  { label: "degree celsius", symbol: "°C", category: "quantity" },
  { label: "degree fahrenheit", symbol: "°F", category: "quantity" },

  // ─────────────────────────────────────────────────────────────
  // TRIPS / LOADS
  // ─────────────────────────────────────────────────────────────
  { label: "trip", symbol: "trip", category: "quantity" },
  { label: "load", symbol: "load", category: "quantity" },
  { label: "truckload", symbol: "TL", category: "quantity" },
  { label: "skip", symbol: "skip", category: "quantity" },

  // ─────────────────────────────────────────────────────────────
  // MISCELLANEOUS CONSTRUCTION
  // ─────────────────────────────────────────────────────────────
  { label: "point", symbol: "pt", category: "quantity" },
  { label: "run", symbol: "run", category: "quantity" },
  { label: "joint", symbol: "jnt", category: "quantity" },
  { label: "connection", symbol: "conn", category: "quantity" },
  { label: "storey", symbol: "sty", category: "quantity" },
  { label: "bay", symbol: "bay", category: "quantity" },
  { label: "span", symbol: "span", category: "quantity" },
  { label: "lift", symbol: "lift", category: "quantity" },
  { label: "coat", symbol: "coat", category: "quantity" },
  { label: "layer", symbol: "lyr", category: "quantity" },
  { label: "pass", symbol: "pass", category: "quantity" },
  { label: "application", symbol: "app", category: "quantity" },
  { label: "test", symbol: "test", category: "quantity" },
  { label: "sample", symbol: "spl", category: "quantity" },
  { label: "allowance", symbol: "alw", category: "quantity" },
  { label: "sum", symbol: "sum", category: "quantity" },
  { label: "lump sum", symbol: "LS", category: "quantity" },
];

/**
 * Seed SystemUoM
 */
const seed = async () => {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not defined");
    }

    await mongoose.connect(process.env.DATABASE_URL);

    console.log("✅ Connected to MongoDB");

    let inserted = 0;
    let skipped = 0;

    for (const unit of units) {
      const existingUnit = await SystemUoM.findOne({
        $or: [
          { label: unit.label },
          { symbol: unit.symbol },
        ],
      });

      if (existingUnit) {
        console.log(`⏭️  Skipped: ${unit.label} (${unit.symbol})`);
        skipped++;
        continue;
      }

      await SystemUoM.create(unit);

      console.log(`✅ Inserted: ${unit.label} (${unit.symbol})`);
      inserted++;
    }

    console.log("\n────────────────────────────────────");
    console.log("📦 SystemUoM seed complete");
    console.log(`✅ Inserted: ${inserted}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`📊 Total units: ${units.length}`);
    console.log("────────────────────────────────────\n");

  } catch (error) {
    console.error("❌ SystemUoM seed failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB connection closed");
  }
};

seed();
