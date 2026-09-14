const inventoryTypes = /* GraphQL */ `

  scalar DateTime

  # ────────────────────────────────────────────
  # ENUMS
  # ────────────────────────────────────────────

  enum ItemType {
    PRODUCT
    SERVICE
  }

  # Lowercase to strictly match your Mongoose enum values
  enum UoMCategory {
    weight
    volume
    length
    quantity
  }

  # Added SALE and TRANSFER to match your Mongoose model
  enum StockMovementType {
    SALE
    RESTOCK
    ADJUSTMENT
    OPENING
    TRANSFER
    WRITE_OFF
  }

  # ────────────────────────────────────────────
  # SYSTEM UOM  (app-level, shared across all sites)
  # ────────────────────────────────────────────

  type SystemUoM {
    id: ID!
    label: String!   # "kilogram"
    symbol: String!   # "kg"
    category: UoMCategory!
  }

  # ────────────────────────────────────────────
  # ITEM UOM  (per-item unit configuration)
  # ────────────────────────────────────────────

  type ItemUoM {
    id: ID!
    itemId: ID!
    label: String!         # display label e.g. "Single loaf", "Crate of 12"
    conversionFactor: Float!          # how many base units this UoM represents
    sellingPrice: Float!
    costPrice: Float!
    isBaseUnit: Boolean!        # true for exactly one UoM per item
    isDefault: Boolean!        # shown first in selling UI
    systemUomId: ID              # null = fully custom UoM
    systemUom: SystemUoM       # the linked system unit if any
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type StockMovement {
    id: ID!
    itemId: ID!
    uomId: ID
    uomLabel: String       # snapshot
    uomQty: Float!         # e.g. 2 (crates)
    baseUnitDelta: Float!         # e.g. +24 or -24 applied to Item.stock
    movementType: StockMovementType!
    referenceId: ID        # Added to match Mongoose model
    note: String
    operatorId: ID!
    siteId: ID!            # Added to match Mongoose model
    createdAt: DateTime!
  }

  # ────────────────────────────────────────────
  # ITEM  (core product / service)
  # ────────────────────────────────────────────

  type InventoryItem {
    id:ID!
    name: String!
    imageUri: String
    images: [String!]!
    price: Float!          # Mapped from Mongoose 'price'
    costPrice: Float!
    stock: Float!
    description: String
    isArchived: Boolean!
    isMarketplaceVisible: Boolean! # Added to match Mongoose model
    itemType: ItemType!
    siteId: ID!            # Replaced businessId
    uoms: [ItemUoM!]!
    
    # Convenience field — the UoM where isDefault = true
    # Resolvers compute this so the frontend never has to filter client-side
    defaultUom: ItemUoM

    # AI Categorization Fields
    primaryCategory: String!
    subcategory: String
    categoryPath: [String!]!
    tags: [String!]!
    confidence: Float!
    searchQuery: String

    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # ────────────────────────────────────────────
  # INPUTS
  # ────────────────────────────────────────────

  input CreateItemInput {
    name: String!
    imageUri: String
    images: [String!]!
    description: String
    itemType: ItemType!
    siteId: ID!            # Replaced businessId
    # Pricing for the auto-created base "unit" UoM
    price: Float!          # Mapped from Mongoose 'price'
    costPrice: Float!
    # Opening stock count
    stock: Float!
    isMarketplaceVisible: Boolean
  }

  input UpdateItemInput {
    name: String
    imageUri: String
    images: [String!]      # Made optional for partial updates
    description: String
    isArchived: Boolean
    isMarketplaceVisible: Boolean
    price: Float
    costPrice: Float
  }

  input CreateItemUoMInput {
    itemId: ID!
    label: String!
    conversionFactor: Float!
    sellingPrice: Float!
    costPrice: Float!
    isDefault: Boolean!
    isBaseUnit: Boolean!
    systemUomId: ID       # optional — link to a system UoM
  }

  input UpdateItemUoMInput {
    label: String
    conversionFactor: Float
    sellingPrice: Float
    costPrice: Float
    isDefault: Boolean
    isBaseUnit: Boolean
  }

  input AdjustStockInput {
    itemId: ID!
    uomId: ID!           # which UoM the operator is thinking in
    qty: Float!          # how many of that UoM (always positive)
    movementType: StockMovementType!
    note: String
    operatorId: ID!
    siteId: ID!          # Required by Mongoose StockMovement model
    referenceId: ID      # Optional reference (e.g., to a Sale or PO)
  }

  # ────────────────────────────────────────────
  # QUERIES
  # ────────────────────────────────────────────

  extend type Query {

    # All items for a site (optionally filtered by type / archived state)
    getInventorySiteItems(
      siteId: ID!
      itemType: ItemType
      archived: Boolean
    ): [InventoryItem!]!

    # Single item with full UoM tree
    getInventoryItem(id: ID!): InventoryItem

    # All system-level units (used in UoM picker)
    getSystemUoMs(category: UoMCategory): [SystemUoM!]!

    # All UoMs for a specific item
    getItemUoMs(itemId: ID!): [ItemUoM!]!

    # stock movement (added siteId filter for site-level queries)
    getStockMovements(itemId: ID!, siteId: ID, limit: Int): [StockMovement!]!
  }

  # ────────────────────────────────────────────
  # MUTATIONS
  # ────────────────────────────────────────────

  extend type Mutation {

    # ── Items ──────────────────────────────────

    # Creates the item AND auto-creates a base "unit" UoM
    createInventoryItem(input: CreateItemInput!): InventoryItem!

    updateInventoryItem(id: ID!, input: UpdateItemInput!): InventoryItem!

    # Soft-delete toggle
    archiveItem(id: ID!): InventoryItem!
    unarchiveItem(id: ID!): InventoryItem!

    # Manual stock correction (not a sale — use for restocks / write-offs)
    adjustItemStock(input: AdjustStockInput!): InventoryItem!

    # ── UoMs ───────────────────────────────────

    createItemUoM(input: CreateItemUoMInput!): ItemUoM!

    updateItemUoM(id: ID!, input: UpdateItemUoMInput!): ItemUoM!

    deleteItemUoM(id: ID!): Boolean!

    # Promotes a UoM to default — automatically demotes the previous default
    setDefaultUoM(uomId: ID!, itemId: ID!): ItemUoM!

    # ── System UoMs (admin only) ───────────────

    createSystemUoM(
      label: String!
      symbol: String!
      category: UoMCategory!
    ): SystemUoM!
  }
`;


export default inventoryTypes;