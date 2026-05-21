import { GraphQLError } from "graphql";
import { Product } from "../../db/models/product.schema";
import { ProductCategory } from "../../db/models/product.schema";
import { Site } from "../../db/models/site.schema";

const ProductResolvers = {
  Query: {
    // ── getProducts ───────────────────────────────────────────────────────────
    getProducts: async (
      _: any,
      {
        siteId,
        categoryId,
        isActive,
      }: { siteId: string; categoryId?: string; isActive?: boolean }
    ) => {
      const filter: Record<string, any> = { siteId };

      if (categoryId !== undefined) filter.category = categoryId;

      // Default to showing only active products unless caller explicitly
      // passes isActive: false to see deactivated ones
      if (isActive !== undefined) filter.isActive = isActive;
      else filter.isActive = true;

      const products = await Product.find(filter).sort({ name: 1 });
      return products.map((p) => p.toObject());
    },

    // ── getProduct ────────────────────────────────────────────────────────────
    getProduct: async (_: any, { id }: { id: string }) => {
      const product = await Product.findById(id);
      if (!product)
        throw new GraphQLError("Product not found", {
          extensions: { code: "NOT_FOUND" },
        });
      return product.toObject();
    },

    // ── searchProducts ────────────────────────────────────────────────────────
    // Case-insensitive search across name and SKU — powers the product picker
    // dropdown when adding inventory transactions.
    searchProducts: async (
      _: any,
      { siteId, query }: { siteId: string; query: string }
    ) => {
      if (!query.trim())
        throw new GraphQLError("Search query cannot be empty", {
          extensions: { code: "BAD_USER_INPUT" },
        });

      const products = await Product.find({
        siteId,
        isActive: true,
        $or: [
          { name: { $regex: query.trim(), $options: "i" } },
          { sku:  { $regex: query.trim(), $options: "i" } },
        ],
      })
        .sort({ name: 1 })
        .limit(20); // cap results for dropdown performance

      return products.map((p) => p.toObject());
    },
  },

  Mutation: {
    // ── addProduct ────────────────────────────────────────────────────────────
    addProduct: async (
      _: any,
      {
        siteId,
        name,
        description,
        sku,
        barcode,
        vatRate,
        reorderLevel,
        reorderQuantity,
        categoryId,
        defaultSupplierId,
      }: {
        siteId: string;
        name: string;
        description?: string;
        sku?: string;
        barcode?: string;
        vatRate?: number;
        reorderLevel?: number;
        reorderQuantity?: number;
        categoryId?: string;
        defaultSupplierId?: string;
      }
    ) => {
      // Confirm site exists
      const site = await Site.findById(siteId);
      if (!site)
        throw new GraphQLError("Site not found", {
          extensions: { code: "NOT_FOUND" },
        });

      // Confirm category exists if provided
      if (categoryId) {
        const category = await ProductCategory.findById(categoryId);
        if (!category)
          throw new GraphQLError("Product category not found", {
            extensions: { code: "NOT_FOUND" },
          });
      }

      // Prevent duplicate names within the same site
      const duplicate = await Product.findOne({
        siteId,
        name: { $regex: `^${name.trim()}$`, $options: "i" },
      });
      if (duplicate)
        throw new GraphQLError(
          `A product named "${name.trim()}" already exists on this site`,
          { extensions: { code: "BAD_USER_INPUT" } }
        );

      // Prevent duplicate SKU within the same site if provided
      if (sku) {
        const skuDuplicate = await Product.findOne({
          siteId,
          sku: sku.trim().toUpperCase(),
        });
        if (skuDuplicate)
          throw new GraphQLError(
            `A product with SKU "${sku.trim().toUpperCase()}" already exists on this site`,
            { extensions: { code: "BAD_USER_INPUT" } }
          );
      }

      const product = new Product({
        siteId,
        name: name.trim(),
        description:      description?.trim()          ?? null,
        sku:              sku?.trim().toUpperCase()     ?? null,
        barcode:          barcode?.trim()               ?? null,
        vatRate:          vatRate                       ?? 0,
        reorderLevel:     reorderLevel                  ?? 0,
        reorderQuantity:  reorderQuantity               ?? 0,
        category:         categoryId                    ?? null,
        defaultSupplier:  defaultSupplierId             ?? null,
        isActive: true,
      });

      await product.save();
      return product.toObject();
    },

    // ── updateProduct ─────────────────────────────────────────────────────────
    updateProduct: async (
      _: any,
      {
        id,
        name,
        description,
        sku,
        barcode,
        vatRate,
        reorderLevel,
        reorderQuantity,
        categoryId,
        defaultSupplierId,
      }: {
        id: string;
        name?: string;
        description?: string;
        sku?: string;
        barcode?: string;
        vatRate?: number;
        reorderLevel?: number;
        reorderQuantity?: number;
        categoryId?: string;
        defaultSupplierId?: string;
      }
    ) => {
      const product = await Product.findById(id);
      if (!product)
        throw new GraphQLError("Product not found", {
          extensions: { code: "NOT_FOUND" },
        });

      // If renaming, check the new name isn't taken by another product on the same site
      if (name && name.trim().toLowerCase() !== product.name.toLowerCase()) {
        const duplicate = await Product.findOne({
          siteId: product.siteId,
          name: { $regex: `^${name.trim()}$`, $options: "i" },
          _id: { $ne: id },
        });
        if (duplicate)
          throw new GraphQLError(
            `A product named "${name.trim()}" already exists on this site`,
            { extensions: { code: "BAD_USER_INPUT" } }
          );
        product.name = name.trim();
      }

      // If changing SKU, confirm uniqueness on this site
      if (sku !== undefined && sku.trim().toUpperCase() !== product.sku) {
        if (sku.trim()) {
          const skuDuplicate = await Product.findOne({
            siteId: product.siteId,
            sku: sku.trim().toUpperCase(),
            _id: { $ne: id },
          });
          if (skuDuplicate)
            throw new GraphQLError(
              `A product with SKU "${sku.trim().toUpperCase()}" already exists on this site`,
              { extensions: { code: "BAD_USER_INPUT" } }
            );
        }
        product.sku = sku.trim().toUpperCase() || null;
      }

      // Validate new category if provided
     
        if (!categoryId) {
            return new GraphQLError("Category ID cannot be empty", {
              extensions: { code: "BAD_USER_INPUT" },
            });
          }


        if (categoryId !== undefined) {
          if (!categoryId) {
            return new GraphQLError("Category ID cannot be empty", {
              extensions: { code: "BAD_USER_INPUT" },
            });
          }
          product.category = categoryId as any;
        }

      if (description       !== undefined) product.description      = description?.trim()      ?? null;
      if (barcode           !== undefined) product.barcode          = barcode?.trim()          ?? null;
      if (vatRate           !== undefined) product.vatRate          = vatRate;
      if (reorderLevel      !== undefined) product.reorderLevel     = reorderLevel;
      if (reorderQuantity   !== undefined) product.reorderQuantity  = reorderQuantity;

      //add default supplier update logic here if needed
      

      await product.save();
      return product.toObject();
    },

    // ── deactivateProduct ─────────────────────────────────────────────────────
    // Soft delete — product stays in DB for historical transaction records.
    deactivateProduct: async (_: any, { id }: { id: string }) => {
      const product = await Product.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );
      if (!product)
        throw new GraphQLError("Product not found", {
          extensions: { code: "NOT_FOUND" },
        });
      return product.toObject();
    },

    // ── activateProduct ───────────────────────────────────────────────────────
    activateProduct: async (_: any, { id }: { id: string }) => {
      const product = await Product.findByIdAndUpdate(
        id,
        { isActive: true },
        { new: true }
      );
      if (!product)
        throw new GraphQLError("Product not found", {
          extensions: { code: "NOT_FOUND" },
        });
      return product.toObject();
    },

    // ── deleteProduct ─────────────────────────────────────────────────────────
    // Hard delete — only use if the product has no transaction history.
    // Prefer deactivateProduct in most cases.
    deleteProduct: async (_: any, { id }: { id: string }) => {
      const product = await Product.findById(id);
      if (!product)
        throw new GraphQLError("Product not found", {
          extensions: { code: "NOT_FOUND" },
        });

      await Product.findByIdAndDelete(id);
      return true;
    },
  },
};

export default ProductResolvers;