const productTypes = /* GraphQL */ `

  # ─── Product ──────────────────────────────────────────────────────────────────

  type Product {
    _id: ID!
    name: String!
    description: String
    sku: String
    barcode: String
    isActive: Boolean!
    vatRate: Float!
    reorderLevel: Float!
    reorderQuantity: Float!
    siteId: ID!
    category: ID
    defaultSupplier: ID
    createdAt: String
    updatedAt: String
  }

  # ─── Queries ──────────────────────────────────────────────────────────────────

  type Query {
    # All products for a site — filter by category or active status
    getProducts(
      siteId: ID!
      categoryId: ID
      isActive: Boolean
    ): [Product!]!

    # Single product
    getProduct(id: ID!): Product

    # Search products by name or SKU within a site
    searchProducts(siteId: ID!, query: String!): [Product!]!
  }

  # ─── Mutations ────────────────────────────────────────────────────────────────

  type Mutation {
    addProduct(
      siteId: ID!
      name: String!
      description: String
      sku: String
      barcode: String
      vatRate: Float
      reorderLevel: Float
      reorderQuantity: Float
      categoryId: ID
      defaultSupplierId: ID
    ): Product!

    updateProduct(
      id: ID!
      name: String
      description: String
      sku: String
      barcode: String
      vatRate: Float
      reorderLevel: Float
      reorderQuantity: Float
      categoryId: ID
      defaultSupplierId: ID
    ): Product!

    # Soft delete — sets isActive: false
    deactivateProduct(id: ID!): Product!

    # Restore a deactivated product
    activateProduct(id: ID!): Product!

    # Hard delete — use with caution, prefer deactivate
    deleteProduct(id: ID!): Boolean!
  }
`;

export default productTypes;