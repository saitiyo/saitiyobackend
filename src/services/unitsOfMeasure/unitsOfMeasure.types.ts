const unitOfMeasureTypes = /* GraphQL */ `

scalar DateTime
scalar JSON

enum ItemType {
  PRODUCT
  SERVICE
  MATERIAL
  EQUIPMENT
  TOOL
}

enum UoMCategory {
  WEIGHT
  VOLUME
  LENGTH
  QUANTITY
  AREA
  TIME
}

enum StockMovementType {
  PURCHASE
  SALE
  ADJUSTMENT
  TRANSFER_IN
  TRANSFER_OUT
  RETURN
  ISSUE
  RECEIPT
  WASTE
  COUNT
}

type SystemUoM {
  id: ID!
  label: String!
  symbol: String
  description: String
  category: UoMCategory!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type ItemCategory {
  id: ID!
  name: String!
  description: String
  parentId: ID
  parent: ItemCategory
  children: [ItemCategory!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type ItemUoM {
  id: ID!
  itemId: ID!
  item: Item!
  label: String!
  conversionFactor: Float!
  sellingPrice: Float!
  costPrice: Float!
  isBaseUnit: Boolean!
  isDefault: Boolean!
  systemUomId: ID
  systemUom: SystemUoM
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Item {
  id: ID!
  name: String!
  description: String
  sku: String
  barcode: String
  imageUri: String
  images: [String!]!
  stock: Float!
  isActive: Boolean!
  isArchived: Boolean!
  isMarketplaceVisible: Boolean!
  itemType: ItemType!
  vatRate: Float!
  reorderLevel: Float!
  reorderQuantity: Float!
  siteId: ID!
  site: Site
  categoryId: ID
  category: ItemCategory
  primaryCategory: String!
  subcategory: String
  categoryPath: [String!]!
  tags: [String!]!
  confidence: Float!
  searchQuery: String
  defaultSupplierId: ID
  defaultSupplier: Supplier
  uoms: [ItemUoM!]!
  stockMovements(
    limit: Int
    offset: Int
    movementType: StockMovementType
  ): [StockMovement!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type StockMovement {
  id: ID!
  itemId: ID!
  item: Item!
  uomId: ID
  uomLabel: String
  uomQty: Float!
  baseUnitDelta: Float!
  movementType: StockMovementType!
  referenceId: String
  note: String
  operatorId: ID!
  operator: User
  siteId: ID!
  site: Site
  taskId: ID
  task: Task
  equipmentId: ID
  equipment: Equipment
  createdAt: DateTime!
}

# ── Inputs ──────────────────────────────────────────────

input CreateSystemUoMInput {
  label: String!
  symbol: String
  description: String
  category: UoMCategory
}

input UpdateSystemUoMInput {
  label: String
  symbol: String
  description: String
  category: UoMCategory
}

input CreateItemInput {
  name: String!
  description: String
  sku: String
  barcode: String
  imageUri: String
  images: [String!]
  itemType: ItemType
  vatRate: Float
  reorderLevel: Float
  reorderQuantity: Float
  siteId: ID!
  categoryId: ID
  primaryCategory: String
  subcategory: String
  categoryPath: [String!]
  tags: [String!]
  defaultSupplierId: ID
}

input CreateItemUoMInput {
  itemId: ID!
  label: String!
  conversionFactor: Float!
  sellingPrice: Float
  costPrice: Float
  isBaseUnit: Boolean
  isDefault: Boolean
  systemUomId: ID
}

input RecordStockMovementInput {
  itemId: ID!
  uomId: ID
  uomQty: Float!
  baseUnitDelta: Float!
  movementType: StockMovementType!
  referenceId: String
  note: String
  operatorId: ID!
  siteId: ID!
  taskId: ID
  equipmentId: ID
}

# ── Operations ──────────────────────────────────────────

type Query {
  systemUoMs(category: UoMCategory): [SystemUoM!]!
  systemUoM(id: ID!): SystemUoM

  items(
    siteId: ID
    isArchived: Boolean
    primaryCategory: String
    search: String
    limit: Int
    offset: Int
  ): [Item!]!

  item(id: ID!): Item

  stockMovements(
    itemId: ID
    siteId: ID
    limit: Int
    offset: Int
  ): [StockMovement!]!
}

type Mutation {
  createSystemUoM(input: CreateSystemUoMInput!): SystemUoM!
  updateSystemUoM(id: ID!, input: UpdateSystemUoMInput!): SystemUoM!
  deleteSystemUoM(id: ID!): Boolean!

  createItem(input: CreateItemInput!): Item!
  createItemUoM(input: CreateItemUoMInput!): ItemUoM!
  recordStockMovement(input: RecordStockMovementInput!): StockMovement!
}

`;

export default unitOfMeasureTypes;