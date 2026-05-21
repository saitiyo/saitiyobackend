import mongoose from "mongoose";
import dotenv from "dotenv";
import { ProductCategory } from "../models/product.schema";

dotenv.config();

const categories = [
  {
    name: "Structural Materials",
    description:
      "Core structural materials including concrete, steel, timber, masonry, roofing, and waterproofing used in the construction of the building frame and envelope.",
    parentId: null,
  },
  {
    name: "Finishing Materials",
    description:
      "Materials applied to surfaces to complete the interior and exterior appearance — paint, tiles, plaster, flooring, doors, windows, and decorative finishes.",
    parentId: null,
  },
  {
    name: "MEP",
    description:
      "Mechanical, Electrical, and Plumbing materials — cables, conduits, pipes, fittings, sanitary ware, lighting, HVAC, fire systems, and all building services.",
    parentId: null,
  },
  {
    name: "Miscellaneous Materials",
    description:
      "Consumables, tools, safety equipment, site supplies, adhesives, fasteners, and all other materials that do not fall under structural, finishing, or MEP.",
    parentId: null,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL as string);
    console.log("✅  Connected to MongoDB\n");

    let inserted = 0;
    let skipped  = 0;

    for (const category of categories) {
      const exists = await ProductCategory.findOne({ name: category.name });
      if (exists) {
        console.log(`   ⟳  Skipped  (already exists): ${category.name}`);
        skipped++;
        continue;
      }
      const created = await ProductCategory.create(category);
      console.log(`   ✓  Inserted: ${created.name} (${created._id})`);
      inserted++;
    }

    console.log(
      `\nSeed complete — ${inserted} inserted, ${skipped} skipped`
    );
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
};

seed();