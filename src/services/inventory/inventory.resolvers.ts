import mongoose from "mongoose";

import { Item } from "../../db/models/item";
import { ItemUoM } from "../../db/models/itemUoM";
import { SystemUoM } from "../../db/models/systemUoM";
import { StockMovement } from "../../db/models/stockMovement";

const toId = (value: any) => {
  if (!value) return null;
  return value._id ? value._id.toString() : value.toString();
};

/**
 * Load an item together with its UoMs.
 */
const buildInventoryItem = async (item: any) => {
  if (!item) return null;

  const itemId = toId(item);

  const [uoms] = await Promise.all([
    ItemUoM.find({ itemId })
      .populate("systemUomId")
      .sort({ isDefault: -1, createdAt: 1 }),
  ]);

  const defaultUom = uoms.find((uom: any) => uom.isDefault) || null;

  return {
    id: item._id.toString(),
    name: item.name,
    imageUri: item.imageUri || null,
    images: item.images || [],
    price: item.price ?? 0,
    costPrice: item.costPrice ?? 0,
    stock: item.stock ?? 0,
    description: item.description || null,
    isArchived: item.isArchived ?? false,
    isMarketplaceVisible: item.isMarketplaceVisible ?? true,
    itemType: item.itemType,
    siteId: item.siteId ? item.siteId.toString() : null,
    uoms,
    defaultUom,
    primaryCategory: item.primaryCategory || "Other",
    subcategory: item.subcategory || null,
    categoryPath: item.categoryPath || [],
    tags: item.tags || [],
    confidence: item.confidence ?? 0.5,
    searchQuery: item.searchQuery || null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

const inventoryResolvers = {
  // ─────────────────────────────────────────────
  // QUERY RESOLVERS
  // ─────────────────────────────────────────────

  Query: {
    /**
     * Get all inventory items belonging to a site.
     */
    getInventorySiteItems: async (
      _: any,
      {
        siteId,
        itemType,
        archived,
      }: {
        siteId: string;
        itemType?: string;
        archived?: boolean;
      }
    ) => {
      const filter: any = {
        siteId: new mongoose.Types.ObjectId(siteId),
      };

      if (itemType) {
        filter.itemType = itemType;
      }

      if (typeof archived === "boolean") {
        filter.isArchived = archived;
      }

      const items = await Item.find(filter).sort({
        createdAt: -1,
      });

      return Promise.all(items.map((item) => buildInventoryItem(item)));
    },

    /**
     * Get one inventory item.
     */
    getInventoryItem: async (_: any, { id }: { id: string }) => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      const item = await Item.findById(id);

      if (!item) {
        return null;
      }

      return buildInventoryItem(item);
    },

    /**
     * Get global/system UoMs.
     */
    getSystemUoMs: async (_: any, { category }: { category?: string }) => {
      const filter: any = {};

      if (category) {
        filter.category = category.toLowerCase();
      }

      return SystemUoM.find(filter).sort({
        category: 1,
        label: 1,
      });
    },

    /**
     * Get UoMs belonging to an item.
     */
    getItemUoMs: async (_: any, { itemId }: { itemId: string }) => {
      return ItemUoM.find({
        itemId: new mongoose.Types.ObjectId(itemId),
      })
        .populate("systemUomId")
        .sort({
          isDefault: -1,
          createdAt: 1,
        });
    },

    /**
     * Get stock movement history.
     */
    getStockMovements: async (
      _: any,
      {
        itemId,
        siteId,
        limit = 50,
      }: {
        itemId: string;
        siteId?: string;
        limit?: number;
      }
    ) => {
      const safeLimit = Math.min(Math.max(limit || 50, 1), 200);

      const filter: any = {
        itemId: new mongoose.Types.ObjectId(itemId),
      };

      if (siteId) {
        filter.siteId = new mongoose.Types.ObjectId(siteId);
      }

      return StockMovement.find(filter)
        .sort({
          createdAt: -1,
        })
        .limit(safeLimit);
    },
  },

  // ─────────────────────────────────────────────
  // MUTATION RESOLVERS
  // ─────────────────────────────────────────────

  Mutation: {
    // ───────────────────────────────────────────
    // ITEMS
    // ───────────────────────────────────────────

    /**
     * Create inventory item.
     *
     * Automatically creates a base "unit" UoM.
     *
     * If opening stock > 0, an OPENING movement
     * is also recorded.
     */
    createInventoryItem: async (
      _: any,
      {
        input,
      }: {
        input: {
          name: string;
          imageUri?: string;
          images: string[];
          description?: string;
          itemType: string;
          siteId: string;
          price: number;
          costPrice: number;
          stock: number;
          isMarketplaceVisible?: boolean;
        };
      }
    ) => {
      const session = await mongoose.startSession();

      try {
        session.startTransaction();

        const {
          name,
          imageUri,
          images = [],
          description,
          itemType,
          siteId,
          price,
          costPrice,
          stock,
          isMarketplaceVisible = true,
        } = input;

        if (!mongoose.Types.ObjectId.isValid(siteId)) {
          throw new Error("Invalid siteId");
        }

        if (stock < 0) {
          throw new Error("Opening stock cannot be negative");
        }

        if (price < 0 || costPrice < 0) {
          throw new Error("Prices cannot be negative");
        }

        // Create item
        const [createdItem] = await Item.create(
          [
            {
              name,
              imageUri: imageUri || null,
              images,
              description: description || null,
              itemType,
              siteId,
              price,
              costPrice,
              stock,
              isArchived: false,
              isMarketplaceVisible,
              primaryCategory: "Other",
              categoryPath: [],
              tags: [],
              confidence: 0.5,
            },
          ],
          { session }
        );

        if (!createdItem) {
          throw new Error("Failed to create inventory item");
        }

        // Create base UoM
        // The base unit has a conversion factor of 1.
        const [baseUom] = await ItemUoM.create(
          [
            {
              itemId: createdItem._id,
              label: "unit",
              conversionFactor: 1,
              sellingPrice: price,
              costPrice: costPrice,
              isBaseUnit: true,
              isDefault: true,
              systemUomId: null,
            },
          ],
          { session }
        );

        // Record opening stock
        if (stock > 0 && baseUom) {
          await StockMovement.create(
            [
              {
                itemId: createdItem._id,
                uomId: baseUom._id,
                uomLabel: baseUom.label,
                uomQty: stock,
                baseUnitDelta: stock,
                movementType: "OPENING",
                // TODO: Replace with actual authenticated user ID from context (e.g., context.user.id)
                operatorId: new mongoose.Types.ObjectId("000000000000000000000000"),
                siteId: new mongoose.Types.ObjectId(siteId),
                note: "Opening stock",
              },
            ],
            { session }
          );
        }

        await session.commitTransaction();

        return buildInventoryItem(createdItem);
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        await session.endSession();
      }
    },

    /**
     * Update item information.
     */
    updateInventoryItem: async (
      _: any,
      {
        id,
        input,
      }: {
        id: string;
        input: {
          name?: string;
          imageUri?: string;
          images?: string[];
          description?: string;
          isArchived?: boolean;
          isMarketplaceVisible?: boolean;
          price?: number;
          costPrice?: number;
        };
      }
    ) => {
      const update: any = {};

      if (input.name !== undefined) update.name = input.name.trim();
      if (input.imageUri !== undefined) update.imageUri = input.imageUri;
      if (input.images !== undefined) update.images = input.images;
      if (input.description !== undefined) update.description = input.description;
      if (input.isArchived !== undefined) update.isArchived = input.isArchived;
      if (input.isMarketplaceVisible !== undefined) update.isMarketplaceVisible = input.isMarketplaceVisible;
      if (input.price !== undefined) update.price = input.price;
      if (input.costPrice !== undefined) update.costPrice = input.costPrice;

      const item = await Item.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });

      if (!item) {
        throw new Error("Inventory item not found");
      }

      return buildInventoryItem(item);
    },

    /**
     * Archive item.
     */
    archiveItem: async (_: any, { id }: { id: string }) => {
      const item = await Item.findByIdAndUpdate(id, { $set: { isArchived: true } }, { new: true });

      if (!item) {
        throw new Error("Inventory item not found");
      }

      return buildInventoryItem(item);
    },

    /**
     * Unarchive item.
     */
    unarchiveItem: async (_: any, { id }: { id: string }) => {
      const item = await Item.findByIdAndUpdate(id, { $set: { isArchived: false } }, { new: true });

      if (!item) {
        throw new Error("Inventory item not found");
      }

      return buildInventoryItem(item);
    },

    // ───────────────────────────────────────────
    // STOCK
    // ───────────────────────────────────────────

    /**
     * Adjust stock.
     *
     * qty is always positive.
     *
     * RESTOCK / OPENING / ADJUSTMENT (positive):
     *     stock += convertedQty
     *
     * WRITE_OFF / SALE / TRANSFER:
     *     stock -= convertedQty
     */
    adjustItemStock: async (
      _: any,
      {
        input,
      }: {
        input: {
          itemId: string;
          uomId: string;
          qty: number;
          movementType: string;
          note?: string;
          operatorId: string;
          siteId: string;
          referenceId?: string;
        };
      }
    ) => {
      const session = await mongoose.startSession();

      try {
        session.startTransaction();

        const { itemId, uomId, qty, movementType, note, operatorId, siteId, referenceId } = input;

        if (qty <= 0) {
          throw new Error("Quantity must be greater than zero");
        }

        const item = await Item.findById(itemId).session(session);

        if (!item) {
          throw new Error("Inventory item not found");
        }

        const uom = await ItemUoM.findOne({
          _id: uomId,
          itemId: item._id,
        }).session(session);

        if (!uom) {
          throw new Error("UoM does not belong to this item");
        }

        const conversionFactor = uom.conversionFactor;
        const baseUnitQty = qty * conversionFactor;

        let baseUnitDelta = baseUnitQty;

        // These movement types reduce stock
        if (movementType === "WRITE_OFF" || movementType === "SALE" || movementType === "TRANSFER") {
          baseUnitDelta = -baseUnitQty;
        }

        const newStock = item.stock + baseUnitDelta;

        if (newStock < 0) {
          throw new Error(`Insufficient stock. Available: ${item.stock}`);
        }

        item.stock = newStock;
        await item.save({ session });

        await StockMovement.create(
          [
            {
              itemId: item._id,
              uomId: uom._id,
              uomLabel: uom.label,
              uomQty: qty,
              baseUnitDelta,
              movementType,
              note: note || null,
              operatorId: new mongoose.Types.ObjectId(operatorId),
              siteId: new mongoose.Types.ObjectId(siteId),
              referenceId: referenceId ? new mongoose.Types.ObjectId(referenceId) : null,
            },
          ],
          { session }
        );

        await session.commitTransaction();

        return buildInventoryItem(item);
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        await session.endSession();
      }
    },

    // ───────────────────────────────────────────
    // ITEM UOM
    // ───────────────────────────────────────────

    /**
     * Create an Item UoM.
     */
    createItemUoM: async (
      _: any,
      {
        input,
      }: {
        input: {
          itemId: string;
          label: string;
          conversionFactor: number;
          sellingPrice: number;
          costPrice: number;
          isDefault: boolean;
          isBaseUnit: boolean;
          systemUomId?: string;
        };
      }
    ) => {
      const item = await Item.findById(input.itemId);

      if (!item) {
        throw new Error("Inventory item not found");
      }

      if (input.conversionFactor <= 0) {
        throw new Error("Conversion factor must be greater than zero");
      }

      if (input.sellingPrice < 0 || input.costPrice < 0) {
        throw new Error("Prices cannot be negative");
      }

      if (input.systemUomId) {
        const systemUom = await SystemUoM.findById(input.systemUomId);
        if (!systemUom) {
          throw new Error("System UoM not found");
        }
      }

      // Only one base unit
      if (input.isBaseUnit) {
        await ItemUoM.updateMany({ itemId: item._id }, { $set: { isBaseUnit: false } });
      }

      // Only one default UoM
      if (input.isDefault) {
        await ItemUoM.updateMany({ itemId: item._id }, { $set: { isDefault: false } });
      }

      const uom = await ItemUoM.create({
        itemId: item._id,
        label: input.label.trim(),
        conversionFactor: input.conversionFactor,
        sellingPrice: input.sellingPrice,
        costPrice: input.costPrice,
        isBaseUnit: input.isBaseUnit,
        isDefault: input.isDefault,
        systemUomId: input.systemUomId || null,
      });

      await uom.populate("systemUomId");

      return uom;
    },

    /**
     * Update Item UoM.
     */
    updateItemUoM: async (
      _: any,
      {
        id,
        input,
      }: {
        id: string;
        input: {
          label?: string;
          conversionFactor?: number;
          sellingPrice?: number;
          costPrice?: number;
          isDefault?: boolean;
          isBaseUnit?: boolean;
        };
      }
    ) => {
      const uom = await ItemUoM.findById(id);

      if (!uom) {
        throw new Error("Item UoM not found");
      }

      if (input.conversionFactor !== undefined && input.conversionFactor <= 0) {
        throw new Error("Conversion factor must be greater than zero");
      }

      if (input.sellingPrice !== undefined && input.sellingPrice < 0) {
        throw new Error("Selling price cannot be negative");
      }

      if (input.costPrice !== undefined && input.costPrice < 0) {
        throw new Error("Cost price cannot be negative");
      }

      if (input.label !== undefined) {
        uom.label = input.label.trim();
      }

      if (input.conversionFactor !== undefined) {
        uom.conversionFactor = input.conversionFactor;
      }

      if (input.sellingPrice !== undefined) {
        uom.sellingPrice = input.sellingPrice;
      }

      if (input.costPrice !== undefined) {
        uom.costPrice = input.costPrice;
      }

      if (input.isDefault === true) {
        await ItemUoM.updateMany(
          { itemId: uom.itemId, _id: { $ne: uom._id } },
          { $set: { isDefault: false } }
        );
        uom.isDefault = true;
      } else if (input.isDefault === false) {
        uom.isDefault = false;
      }

      if (input.isBaseUnit === true) {
        await ItemUoM.updateMany(
          { itemId: uom.itemId, _id: { $ne: uom._id } },
          { $set: { isBaseUnit: false } }
        );
        uom.isBaseUnit = true;
      } else if (input.isBaseUnit === false) {
        uom.isBaseUnit = false;
      }

      await uom.save();
      await uom.populate("systemUomId");

      return uom;
    },

    /**
     * Delete an Item UoM.
     */
    deleteItemUoM: async (_: any, { id }: { id: string }) => {
      const uom = await ItemUoM.findById(id);

      if (!uom) {
        return false;
      }

      // Do not allow deletion if it is the item's base UoM.
      if (uom.isBaseUnit) {
        throw new Error("The base UoM cannot be deleted");
      }

      await ItemUoM.deleteOne({ _id: uom._id });

      return true;
    },

    /**
     * Make a UoM the default UoM.
     */
    setDefaultUoM: async (_: any, { uomId, itemId }: { uomId: string; itemId: string }) => {
      const uom = await ItemUoM.findOne({ _id: uomId, itemId });

      if (!uom) {
        throw new Error("UoM does not belong to this item");
      }

      await ItemUoM.updateMany(
        { itemId, _id: { $ne: uom._id } },
        { $set: { isDefault: false } }
      );

      uom.isDefault = true;
      await uom.save();
      await uom.populate("systemUomId");

      return uom;
    },

    // ───────────────────────────────────────────
    // SYSTEM UOM
    // ───────────────────────────────────────────

    /**
     * Create a global/system UoM.
     *
     * Admin only should be enforced by your
     * authentication/authorization middleware.
     */
    createSystemUoM: async (
      _: any,
      { label, symbol, category }: { label: string; symbol: string; category: string }
    ) => {
      const cleanLabel = label.trim();
      const cleanSymbol = symbol.trim();

      if (!cleanLabel) {
        throw new Error("UoM label is required");
      }

      if (!cleanSymbol) {
        throw new Error("UoM symbol is required");
      }

      const normalizedCategory = category.toLowerCase();

      const existing = await SystemUoM.findOne({
        $or: [
          { label: { $regex: `^${cleanLabel}$`, $options: "i" } },
          { symbol: { $regex: `^${cleanSymbol}$`, $options: "i" } },
        ],
      });

      if (existing) {
        throw new Error("A system UoM with this label or symbol already exists");
      }

      const systemUom = await SystemUoM.create({
        label: cleanLabel,
        symbol: cleanSymbol,
        category: normalizedCategory,
      });

      return systemUom;
    },
  },

  // ─────────────────────────────────────────────
  // FIELD RESOLVERS
  // ─────────────────────────────────────────────

  SystemUoM: {
    id: (parent: any) => toId(parent),
    label: (parent: any) => parent.label,
    symbol: (parent: any) => parent.symbol,
    category: (parent: any) => parent.category,
  },

  ItemUoM: {
    id: (parent: any) => toId(parent),
    itemId: (parent: any) => toId(parent.itemId),
    systemUomId: (parent: any) => toId(parent.systemUomId),
    systemUom: async (parent: any) => {
      if (!parent.systemUomId) return null;
      if (parent.systemUomId && typeof parent.systemUomId === "object" && parent.systemUomId._id) {
        return parent.systemUomId;
      }
      return SystemUoM.findById(parent.systemUomId);
    },
    createdAt: (parent: any) => parent.createdAt,
    updatedAt: (parent: any) => parent.updatedAt,
  },

  StockMovement: {
    id: (parent: any) => toId(parent),
    itemId: (parent: any) => toId(parent.itemId),
    uomId: (parent: any) => toId(parent.uomId),
    operatorId: (parent: any) => toId(parent.operatorId),
    siteId: (parent: any) => toId(parent.siteId),
    referenceId: (parent: any) => toId(parent.referenceId),
    uomLabel: (parent: any) => parent.uomLabel || null,
    uomQty: (parent: any) => parent.uomQty ?? 0,
    baseUnitDelta: (parent: any) => parent.baseUnitDelta ?? 0,
    movementType: (parent: any) => parent.movementType,
    note: (parent: any) => parent.note || null,
    createdAt: (parent: any) => parent.createdAt,
  },

  InventoryItem: {
    id: (parent: any) => toId(parent),
    siteId: (parent: any) => toId(parent.siteId),
    images: (parent: any) => parent.images || [],
    stock: (parent: any) => parent.stock ?? 0,
    isArchived: (parent: any) => parent.isArchived ?? false,
    uoms: async (parent: any) => {
      if (parent.uoms) return parent.uoms;
      return ItemUoM.find({ itemId: parent._id })
        .populate("systemUomId")
        .sort({ isDefault: -1, createdAt: 1 });
    },
    defaultUom: async (parent: any) => {
      if (parent.defaultUom) return parent.defaultUom;
      return ItemUoM.findOne({ itemId: parent._id, isDefault: true }).populate("systemUomId");
    },
    primaryCategory: (parent: any) => parent.primaryCategory || "Other",
    categoryPath: (parent: any) => parent.categoryPath || [],
    tags: (parent: any) => parent.tags || [],
    confidence: (parent: any) => parent.confidence ?? 0.5,
    createdAt: (parent: any) => parent.createdAt,
    updatedAt: (parent: any) => parent.updatedAt,
  },
};

export default inventoryResolvers;