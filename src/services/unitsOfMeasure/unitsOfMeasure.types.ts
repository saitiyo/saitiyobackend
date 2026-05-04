const unitOfMeasureTypes = /* GraphQL */ `


  type UnitOfMeasure {
    _id: ID!
    name: String!          # "bag", "strip", "box"
    label: String          # short form: "bg", "str", "bx"
    description: String    # human note: "50kg paper sack"
    createdAt: String
    updatedAt: String
  }

  # ─── Queries ─────────────────────────────────────────────────────────────────

  type Query {

    getUnitsOfMeasure: [UnitOfMeasure!]!
    getUnitOfMeasure(id: ID!): UnitOfMeasure
  }

  # ─── Mutations ───────────────────────────────────────────────────────────────

  type Mutation {
    addUnitOfMeasure(
      name: String!
      label: String
      description: String
    ): UnitOfMeasure!

    updateUnitOfMeasure(
      id: ID!
      name: String
      label: String
      description: String
    ): UnitOfMeasure!

    deleteUnitOfMeasure(id: ID!): Boolean!
  }
`;

export default unitOfMeasureTypes;