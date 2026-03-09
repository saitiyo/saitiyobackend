const authTypes = /* GraphQL */ `
    

   type QrcodeData {
        session_id: String!
        token: String!
    }

    type Mutation {
        scanQRCode(session_id: String!, userId: String!): QrcodeData!
    }   
   
    type Subscription {
        newQRCodeScanned: QrcodeData
    }
`;

export default authTypes;
