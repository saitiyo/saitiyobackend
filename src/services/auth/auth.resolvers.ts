import { GraphQLError } from "graphql"

import { PubSub } from "graphql-subscriptions"
import { generateJWT } from "../../utils/managejwt";


const pubsub = new PubSub()

export const AuthResolvers = {

  Mutation: {
    scanQRCode: async (
      _:any,
      { session_id, userId }: { session_id: string; userId: string }
    ) => {
      try {

        //TODO:confirm the session id is valid and not expired
       
        //generate jwt token for the user
          const userInfo = {
                id:userId
          }

          const token = await generateJWT(userInfo)
        
                    if(!token){
                        throw new GraphQLError("Failed to generate token")
                        return
                    }

        const result = {
          session_id: session_id,
          token: token
        }
        /**
         * PUBLISH THE WEBSOCKET EVENT
         *
         */
        console.log("📤 Publishing QR code scan event");
        pubsub.publish("NEW_QR_CODE_SCANNED", {
          newQRCodeScanned: result
        })
  

        return result

      } catch (error) {
        throw new Error("Failed to process QR code scan")
      }
    },
   
  },
  Subscription: {
    newQRCodeScanned: {
      subscribe: () => pubsub.asyncIterableIterator(["NEW_QR_CODE_SCANNED"])
    },
  }
}