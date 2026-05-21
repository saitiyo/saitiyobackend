import mongoose from "mongoose";
import dotenv from "dotenv";
import { UnitOfMeasure } from "../models/units.schema";

dotenv.config();

// ─── Seed Data ────────────────────────────────────────────────────────────────
// Covers all unit categories typically found on construction sites:
// Length, Area, Volume, Mass/Weight, Count, Time, Liquid, Electrical, Misc

const units = [

  // ── Length / Distance ───────────────────────────────────────────────────────
  { name: "millimeter",   label: "mm",   description: "Millimeter — fine measurements, rebar spacing" },
  { name: "centimeter",   label: "cm",   description: "Centimeter — tile dimensions, small fittings" },
  { name: "meter",        label: "m",    description: "Meter — general structural measurements" },
  { name: "kilometer",    label: "km",   description: "Kilometer — road works, pipeline runs" },
  { name: "inch",         label: "in",   description: "Inch — pipe diameters, imperial fittings" },
  { name: "foot",         label: "ft",   description: "Foot — imperial structural measurements" },
  { name: "yard",         label: "yd",   description: "Yard — earthworks, road base" },
  { name: "linear meter", label: "lm",   description: "Linear meter — gutters, skirting, cables" },
  { name: "linear foot",  label: "lf",   description: "Linear foot — timber, conduit runs" },

  // ── Area ────────────────────────────────────────────────────────────────────
  { name: "square millimeter", label: "mm²",  description: "Square millimeter — cross-section specs" },
  { name: "square centimeter", label: "cm²",  description: "Square centimeter — small surface areas" },
  { name: "square meter",      label: "m²",   description: "Square meter — flooring, roofing, painting" },
  { name: "square kilometer",  label: "km²",  description: "Square kilometer — large site surveys" },
  { name: "square foot",       label: "ft²",  description: "Square foot — imperial area measurement" },
  { name: "square yard",       label: "yd²",  description: "Square yard — carpeting, earthworks" },
  { name: "acre",              label: "ac",   description: "Acre — large land parcels" },
  { name: "hectare",           label: "ha",   description: "Hectare — site area planning" },

  // ── Volume ──────────────────────────────────────────────────────────────────
  { name: "cubic millimeter",  label: "mm³",  description: "Cubic millimeter — precision components" },
  { name: "cubic centimeter",  label: "cm³",  description: "Cubic centimeter — small volumes" },
  { name: "cubic meter",       label: "m³",   description: "Cubic meter — concrete, excavation, fill" },
  { name: "cubic foot",        label: "ft³",  description: "Cubic foot — imperial volume measurement" },
  { name: "cubic yard",        label: "yd³",  description: "Cubic yard — concrete ordering, earthworks" },

  // ── Mass / Weight ───────────────────────────────────────────────────────────
  { name: "milligram",   label: "mg",   description: "Milligram — chemical additives, sealants" },
  { name: "gram",        label: "g",    description: "Gram — small material quantities, adhesives" },
  { name: "kilogram",    label: "kg",   description: "Kilogram — cement bags, rebar, general materials" },
  { name: "tonne",       label: "t",    description: "Metric tonne (1,000 kg) — bulk aggregates, steel" },
  { name: "pound",       label: "lb",   description: "Pound — imperial weight, US material specs" },
  { name: "ounce",       label: "oz",   description: "Ounce — sealants, chemical compounds" },
  { name: "ton",         label: "ton",  description: "Short ton (2,000 lb) — US bulk materials" },
  { name: "long ton",    label: "LT",   description: "Long ton (2,240 lb) — UK bulk materials" },

  // ── Liquid / Fluid ──────────────────────────────────────────────────────────
  { name: "milliliter",  label: "ml",   description: "Milliliter — chemical additives, paint tints" },
  { name: "liter",       label: "L",    description: "Liter — paint, solvents, water, fuel" },
  { name: "gallon",      label: "gal",  description: "Gallon (US) — paint, fuel, water supply" },
  { name: "imperial gallon", label: "imp gal", description: "Imperial gallon (UK) — fuel, liquids" },
  { name: "fluid ounce", label: "fl oz", description: "Fluid ounce — small liquid measures" },
  { name: "barrel",      label: "bbl",  description: "Barrel — bitumen, fuel, bulk liquids" },

  // ── Count / Discrete Units ──────────────────────────────────────────────────
  { name: "piece",       label: "pc",   description: "Piece — individual items: bricks, blocks, fittings" },
  { name: "unit",        label: "unit", description: "Generic unit — fixtures, appliances, fittings" },
  { name: "number",      label: "no.",  description: "Number — numbered items in a schedule" },
  { name: "each",        label: "ea",   description: "Each — individual items billed per item" },
  { name: "pair",        label: "pr",   description: "Pair — hinges, brackets, handles" },
  { name: "set",         label: "set",  description: "Set — grouped components: door set, window set" },
  { name: "lot",         label: "lot",  description: "Lot — miscellaneous grouped items" },
  { name: "item",        label: "item", description: "Item — general line item in a bill of quantities" },

  // ── Packaging ───────────────────────────────────────────────────────────────
  { name: "bag",         label: "bag",  description: "Bag — cement, sand, gravel (50 kg paper sack)" },
  { name: "sack",        label: "sck",  description: "Sack — bulk powder materials" },
  { name: "box",         label: "bx",   description: "Box — nails, screws, tiles, electrical fittings" },
  { name: "carton",      label: "ctn",  description: "Carton — tiles, paint cans, packaged goods" },
  { name: "pallet",      label: "plt",  description: "Pallet — bulk bricks, blocks, bagged materials" },
  { name: "roll",        label: "rl",   description: "Roll — wire mesh, felt, waterproof membrane" },
  { name: "coil",        label: "coil", description: "Coil — electrical wire, hose pipe, rebar tie wire" },
  { name: "drum",        label: "drm",  description: "Drum — bitumen, oil, chemical compounds" },
  { name: "bundle",      label: "bdl",  description: "Bundle — timber lengths, rebar, conduit" },
  { name: "strip",       label: "str",  description: "Strip — roofing tiles, shingles, flooring planks" },
  { name: "sheet",       label: "sht",  description: "Sheet — plywood, plasterboard, glass, metal" },
  { name: "panel",       label: "pnl",  description: "Panel — cladding, formwork, structural panels" },
  { name: "slab",        label: "slb",  description: "Slab — stone, marble, granite, concrete precast" },
  { name: "tile",        label: "tile", description: "Tile — ceramic, porcelain, roof tile (individual)" },
  { name: "block",       label: "blk",  description: "Block — concrete block, masonry block" },
  { name: "brick",       label: "brk",  description: "Brick — clay or concrete brick (individual)" },
  { name: "plank",       label: "plk",  description: "Plank — timber floor or decking plank" },
  { name: "board",       label: "brd",  description: "Board — timber, MDF, gypsum board (individual)" },
  { name: "length",      label: "lgth", description: "Length — pipe, conduit, angle iron, cut to length" },
  { name: "pack",        label: "pk",   description: "Pack — insulation, fasteners, prepackaged goods" },
  { name: "tube",        label: "tube", description: "Tube — sealant, adhesive, caulk cartridge" },
  { name: "can",         label: "can",  description: "Can — paint, varnish, spray paint" },
  { name: "bucket",      label: "bkt",  description: "Bucket — paint, plaster, adhesive (5–20L)" },
  { name: "container",   label: "cont", description: "Container — bulk imported materials, modular units" },
  { name: "jar",         label: "jar",  description: "Jar — sealants, putty, small chemical compounds" },

  // ── Time ────────────────────────────────────────────────────────────────────
  { name: "hour",        label: "hr",   description: "Hour — labour billing, equipment hire" },
  { name: "day",         label: "day",  description: "Day — daily labour rate, equipment rental" },
  { name: "week",        label: "wk",   description: "Week — weekly subcontractor engagement" },
  { name: "month",       label: "mo",   description: "Month — long-term hire, service contracts" },
  { name: "shift",       label: "shft", description: "Shift — 8/10/12-hr work shift for labour costing" },
  { name: "man-hour",    label: "mh",   description: "Man-hour — combined labour productivity unit" },
  { name: "man-day",     label: "md",   description: "Man-day — daily labour resource unit" },

  // ── Electrical ──────────────────────────────────────────────────────────────
  { name: "kilowatt",         label: "kW",   description: "Kilowatt — power rating of equipment" },
  { name: "kilowatt-hour",    label: "kWh",  description: "Kilowatt-hour — electricity consumption" },
  { name: "ampere",           label: "A",    description: "Ampere — current rating, circuit sizing" },
  { name: "volt",             label: "V",    description: "Volt — voltage specification" },
  { name: "kilovolt-ampere",  label: "kVA",  description: "Kilovolt-ampere — generator/transformer rating" },

  // ── Pressure / Force ────────────────────────────────────────────────────────
  { name: "pascal",           label: "Pa",   description: "Pascal — pressure measurement" },
  { name: "megapascal",       label: "MPa",  description: "Megapascal — concrete compressive strength" },
  { name: "bar",              label: "bar",  description: "Bar — hydraulic pressure, pipe pressure rating" },
  { name: "psi",              label: "psi",  description: "Pounds per square inch — imperial pressure" },
  { name: "newton",           label: "N",    description: "Newton — force measurement" },
  { name: "kilonewton",       label: "kN",   description: "Kilonewton — structural load specification" },

  // ── Rate / Ratio ────────────────────────────────────────────────────────────
  { name: "percent",          label: "%",    description: "Percentage — slopes, mixes, waste factors" },
  { name: "ratio",            label: "ratio", description: "Ratio — mix ratios e.g. 1:2:4 concrete" },
  { name: "parts per million", label: "ppm", description: "Parts per million — water quality, chemical dosing" },

  // ── Temperature ─────────────────────────────────────────────────────────────
  { name: "degree celsius",    label: "°C",  description: "Celsius — curing conditions, asphalt temps" },
  { name: "degree fahrenheit", label: "°F",  description: "Fahrenheit — imperial temperature spec" },

  // ── Trips / Loads ───────────────────────────────────────────────────────────
  { name: "trip",        label: "trip", description: "Trip — truck delivery run, skip hire removal" },
  { name: "load",        label: "load", description: "Load — truck load of aggregate, soil, concrete" },
  { name: "truckload",   label: "TL",   description: "Truckload — full truck of bulk material" },
  { name: "skip",        label: "skip", description: "Skip — waste skip bin hire unit" },

  // ── Miscellaneous Construction ───────────────────────────────────────────────
  { name: "point",       label: "pt",   description: "Point — electrical or plumbing outlet point" },
  { name: "run",         label: "run",  description: "Run — continuous installation: cable run, pipe run" },
  { name: "joint",       label: "jnt",  description: "Joint — pipe joint, expansion joint" },
  { name: "connection",  label: "conn", description: "Connection — service connection point" },
  { name: "storey",      label: "sty",  description: "Storey — floor level in multi-storey costing" },
  { name: "bay",         label: "bay",  description: "Bay — structural bay between columns" },
  { name: "span",        label: "span", description: "Span — beam or truss span" },
  { name: "lift",        label: "lift", description: "Lift — concrete pour lift height" },
  { name: "coat",        label: "coat", description: "Coat — paint or render application coat" },
  { name: "layer",       label: "lyr",  description: "Layer — compaction layer, screed layer" },
  { name: "pass",        label: "pass", description: "Pass — compaction pass, grading pass" },
  { name: "application", label: "app",  description: "Application — chemical treatment, sealant application" },
  { name: "test",        label: "test", description: "Test — soil test, concrete cube test, pressure test" },
  { name: "sample",      label: "spl",  description: "Sample — material sample for QA/QC" },
  { name: "allowance",   label: "alw",  description: "Provisional allowance — contingency or PC sum item" },
  { name: "sum",         label: "sum",  description: "Provisional/prime cost sum — lump cost allowance" },
  { name: "lump sum",    label: "LS",   description: "Lump sum — fixed price for a scope of work" },
];

// ─── Seed Function ────────────────────────────────────────────────────────────
const seed = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL as string);
    console.log("✅  Connected to MongoDB");

    let inserted = 0;
    let skipped  = 0;

    for (const unit of units) {
      const exists = await UnitOfMeasure.findOne({ name: unit.name });
      if (exists) {
        console.log(`   ⟳  Skipped  (already exists): ${unit.name}`);
        skipped++;
        continue;
      }
      await UnitOfMeasure.create(unit);
      console.log(`   ✓  Inserted: ${unit.name} (${unit.label})`);
      inserted++;
    }

    console.log(`\n📦  Seed complete — ${inserted} inserted, ${skipped} skipped`);
    process.exit(0);
  } catch (err) {
    console.error("❌  Seed failed:", err);
    process.exit(1);
  }
};

seed();