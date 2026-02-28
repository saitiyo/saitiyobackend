import { ApolloServer } from "@apollo/server"
import { expressMiddleware } from '@as-integrations/express5';
import { context } from "./graphql/context";

import express  from "express"
import http from "http"
import cors from "cors"
import bodyParser from "body-parser"


import "dotenv/config"

import { allResolvers } from "./graphql/resolvers";
import {typeDefs} from "./graphql/typeDefs";

import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";

import { useServer } from 'graphql-ws/use/ws';

import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";

import adminAuthRouter from "./services/admin/admin.auth.router";
import authRouter from "./services/auth/auth.router";


//load enviroment variables

/***
 * this server has the ability to serve both REST and GRAPHQL end points
 */

const apiPrefix = "/api"
const app = express()
const httpServer = http.createServer(app)



//schema
const schema = makeExecutableSchema({ typeDefs, resolvers:allResolvers });

/**
 * Instance of GraphQL websocket server
 */
const wsServer = new WebSocketServer<any>({
  server:httpServer,
  path: '/gql',
});

const wsServerCleanup = useServer({schema},wsServer)

// Set up Apollo Server
//ApolloServerPluginLandingPageDisabled() TODO apply this plugin to disable gql in prod
const _introspection = process.env.GRAPHQL_INTROSPECTION === "show" ? true : false
const server = new ApolloServer({
  schema,
  introspection:_introspection,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart(){
        return {
             async drainServer(){
                await wsServerCleanup.dispose()
             }
        }
      }
    }
  ],
});



app.use(cors(), bodyParser.json());


/**
 * This are the REST end points
 */
app.use(`${apiPrefix}/admin`,adminAuthRouter);
app.use(`${apiPrefix}/auth`, authRouter);


(
  async()=>{
   await server.start()


      
   /**
 * This is the main GRAPHQL end point
 */
  //  app.use("/gql/", expressMiddleware(server))
   app.use("/gql/", expressMiddleware(server,{context:context}))

  }
 )();



export default httpServer








