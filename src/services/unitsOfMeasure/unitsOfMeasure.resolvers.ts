import { GraphQLError } from "graphql";
import mongoose from "mongoose";
import {
  Item,
  ItemCategory,
  ItemUoM,
  StockMovement,
} from "../../db/models/item.schema";

import { SystemUoM } from "../../db/models/units.schema";


/* ─── helpers ───────────────────────────────────────────── */

const notFound = (entity: string) =>
  new GraphQLError(`${entity} not found`, { extensions: { code: "NOT_FOUND" } });

const badInput = (msg: string) =>
  new GraphQLError(msg, { extensions: { code: "BAD_USER_INPUT" } });

/* ─── field resolvers ───────────────────────────────────── */

const InventoryResolvers = {
  SystemUoM: {
    id: (parent: any) => parent._id.toString(),
  },

  ItemCategory: {
    id: (parent: any) => parent._id.toString(),
    parent: async (parent: any) => {
      if (!parent.parentId) return null;
      return ItemCategory.findById(parent.parentId).lean();
    },
    children: async (parent: any) => {
      return ItemCategory.find({ parentId: parent._id }).lean();
    },
  },

  ItemUoM: {
    id: (parent: any) => parent._id.toString(),
    item: async (parent: any) => Item.findById(parent.itemId).lean(),
    systemUom: async (parent: any) => {
      if (!parent.systemUomId) return null;
      return SystemUoM.findById(parent.systemUomId).lean();
    },
  },

  Item: {
    id: (parent: any) => parent._id.toString(),
    category: async (parent: any) => {
      if (!parent.category) return null;
      return ItemCategory.findById(parent.category).lean();
    },
    site: async (parent: any) => {
      // Resolve locally if Site model is available in this service,
      // otherwise return null and let a gateway/federation handle it.
      return mongoose.models.Site?.findById(parent.siteId).lean() ?? null;
    },
    defaultSupplier: async (parent: any) => {
      return (
        mongoose.models.Supplier?.findById(parent.defaultSupplier).lean() ??
        null
      );
    },
    uoms: async (parent: any) =>
      ItemUoM.find({ itemId: parent._id }).lean(),
    stockMovements: async (
      parent: any,
      { limit = 50, offset = 0, movementType }: any
    ) => {
      const q: any = { itemId: parent._id };
      if (movementType) q.movementType = movementType;
      return StockMovement.find(q)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean();
    },
  },

  StockMovement: {
    id: (parent: any) => parent._id.toString(),
    item: async (parent: any) => Item.findById(parent.itemId).lean(),
    operator: async (parent: any) => {
      return mongoose.models.User?.findById(parent.operatorId).lean() ?? null;
    },
    site: async (parent: any) => {
      return mongoose.models.Site?.findById(parent.siteId).lean() ?? null;
    },
    task: async (parent: any) => {
      if (!parent.taskId) return null;
      return mongoose.models.Task?.findById(parent.taskId).lean() ?? null;
    },
    equipment: async (parent: any) => {
      if (!parent.equipmentId) return null;
      return (
        mongoose.models.Equipment?.findById(parent.equipmentId).lean() ?? null
      );
    },
  },

  /* ─── queries ─────────────────────────────────────────── */

  Query: {
    systemUoMs: async (_: any, { category }: { category?: string }) => {
      const filter: any = {};
      if (category) filter.category = category;
      return SystemUoM.find(filter).sort({ label: 1 }).lean();
    },

    systemUoM: async (_: any, { id }: { id: string }) => {
      const unit = await SystemUoM.findById(id).lean();
      if (!unit) throw notFound("SystemUoM");
      return unit;
    },

    items: async (
      _: any,
      {
        siteId,
        isArchived,
        primaryCategory,
        search,
        limit = 20,
        offset = 0,
      }: any
    ) => {
      const filter: any = {};
      if (siteId) filter.siteId = new mongoose.Types.ObjectId(siteId);
      if (typeof isArchived === "boolean") filter.isArchived = isArchived;
      if (primaryCategory) filter.primaryCategory = primaryCategory;

      if (search) {
        const rx = new RegExp(search, "i");
        filter.$or = [
          { name: rx },
          { sku: rx },
          { barcode: rx },
          { tags: { $in: [rx] } },
        ];
      }

      return Item.find(filter).sort({ name: 1 }).skip(offset).limit(limit).lean();
    },

    item: async (_: any, { id }: { id: string }) => {
      const item = await Item.findById(id).lean();
      if (!item) throw notFound("Item");
      return item;
    },

    stockMovements: async (
      _: any,
      { itemId, siteId, limit = 50, offset = 0 }: any
    ) => {
      const filter: any = {};
      if (itemId) filter.itemId = new mongoose.Types.ObjectId(itemId);
      if (siteId) filter.siteId = new mongoose.Types.ObjectId(siteId);
      return StockMovement.find(filter)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean();
    },
  },

  /* ─── mutations ───────────────────────────────────────── */

  Mutation: {
    /* ── SystemUoM ───────────────────────────────────── */
    createSystemUoM: async (
      _: any,
      { input }: { input: any }
    ) => {
      const label = input.label.trim();
      const existing = await SystemUoM.findOne({ label });
      if (existing) throw badInput(`A unit labeled "${label}" already exists`);

      const unit = new SystemUoM({
        label,
        symbol: input.symbol?.trim() ?? null,
        description: input.description?.trim() ?? null,
        category: input.category ?? "QUANTITY",
      });
      await unit.save();
      return unit.toObject();
    },

    updateSystemUoM: async (
      _: any,
      { id, input }: { id: string; input: any }
    ) => {
      const unit = await SystemUoM.findById(id);
      if (!unit) throw notFound("SystemUoM");

      if (input.label && input.label.trim() !== unit.label) {
        const dup = await SystemUoM.findOne({
          label: input.label.trim(),
          _id: { $ne: id },
        });
        if (dup) throw badInput(`A unit labeled "${input.label.trim()}" already exists`);
        unit.label = input.label.trim();
      }

      if (input.symbol !== undefined) unit.symbol = input.symbol?.trim() ?? null;
      if (input.description !== undefined)
        unit.description = input.description?.trim() ?? null;
      if (input.category !== undefined) unit.category = input.category;

      await unit.save();
      return unit.toObject();
    },

    deleteSystemUoM: async (_: any, { id }: { id: string }) => {
      const unit = await SystemUoM.findById(id);
      if (!unit) throw notFound("SystemUoM");

      const inUse = await ItemUoM.findOne({ systemUomId: id });
      if (inUse) throw badInput("Cannot delete: this unit is linked to items");

      await SystemUoM.findByIdAndDelete(id);
      return true;
    },

    /* ── Item ──────────────────────────────────────────── */
    createItem: async (_: any, { input }: { input: any }) => {
      const item = new Item({
        ...input,
        images: input.images ?? [],
        categoryPath: input.categoryPath ?? [],
        tags: input.tags ?? [],
      });
      await item.save();
      return item.toObject();
    },

    /* ── ItemUoM ─────────────────────────────────────── */
    createItemUoM: async (_: any, { input }: { input: any }) => {
      const {
        itemId,
        label,
        conversionFactor,
        isBaseUnit,
        isDefault,
        sellingPrice,
        costPrice,
        systemUomId,
      } = input;

      const item = await Item.findById(itemId);
      if (!item) throw notFound("Item");

      if (isBaseUnit) {
        const existingBase = await ItemUoM.findOne({ itemId, isBaseUnit: true });
        if (existingBase) throw badInput("Item already has a base unit");
      }

      if (isDefault) {
        await ItemUoM.updateMany({ itemId }, { $set: { isDefault: false } });
      }

      const uom = new ItemUoM({
        itemId,
        label: label.trim(),
        conversionFactor,
        sellingPrice: sellingPrice ?? 0,
        costPrice: costPrice ?? 0,
        isBaseUnit: isBaseUnit ?? false,
        isDefault: isDefault ?? false,
        systemUomId: systemUomId ?? null,
      });

      try {
        await uom.save();
      } catch (err: any) {
        if (err.code === 11000) {
          throw badInput(`UoM "${label}" already exists for this item`);
        }
        throw err;
      }

      return uom.toObject();
    },

    /* ── Stock Movement (atomic) ─────────────────────── */
    recordStockMovement: async (
      _: any,
      { input }: { input: any }
    ) => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const {
          itemId,
          uomId,
          uomQty,
          baseUnitDelta,
          movementType,
          referenceId,
          note,
          operatorId,
          siteId,
          taskId,
          equipmentId,
        } = input;

        // Snapshot the UoM label so history stays readable even if the UoM is edited later
        let uomLabel: string | null = null;
        if (uomId) {
          const uom = await ItemUoM.findById(uomId).session(session).lean();
          if (!uom) throw notFound("ItemUoM");
          uomLabel = uom.label;
        }

        const [movement] = await StockMovement.create(
          [
            {
              itemId,
              uomId: uomId ?? null,
              uomLabel,
              uomQty,
              baseUnitDelta,
              movementType,
              referenceId: referenceId ?? null,
              note: note ?? null,
              operatorId,
              siteId,
              taskId: taskId ?? null,
              equipmentId: equipmentId ?? null,
            },
          ],
          { session }
        );

        const updatedItem = await Item.findByIdAndUpdate(
          itemId,
          { $inc: { stock: baseUnitDelta } },
          { session, new: true }
        );
        if (!updatedItem) throw notFound("Item");

        // Uncomment if you want to enforce non-negative stock:
        // if (updatedItem.stock < 0) {
        //   throw badInput("Insufficient stock for this movement");
        // }

        await session.commitTransaction();
        return movement ? movement.toObject() : {};

      } catch (err) {
        await session.abortTransaction();
        throw err;
      } finally {
        session.endSession();
      }
    },
  },
};

export default InventoryResolvers;