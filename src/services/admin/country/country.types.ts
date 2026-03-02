const countryTypes = /* GraphQL */ `
    type Country {
        id: ID!
        name: String!
        flagUri: String!
        callingCode: String!
        currencyName: String!
        currencyCode: String!
    }

    type Query {
        countries: [Country]
        country(id: ID!): Country
    }

    type Mutation {
        createCountry(
            name: String!,
            flagUri: String!,
            callingCode: String!,
            currencyName: String!,
            currencyCode: String!
        ): Country
        deleteCountry(id: ID!): Boolean
    }
`;

export default countryTypes;
