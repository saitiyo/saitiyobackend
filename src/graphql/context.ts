
import { decodeJWT } from "../utils/managejwt";

import { Request,Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../db/models/models";

export const context = async ({req,res}:{req:Request,res:Response}) => {
  const bearer = req.header("Authorization");
  let user = null;
  
  if (bearer && bearer.startsWith("Bearer ")) {
    const token = bearer.split(' ')[1];
    if (token && token !== "undefined" && token !== "null") {
      try {
        const decoded: JwtPayload | string | undefined = await decodeJWT(token);
        if (decoded) {
          const _decoded = decoded as {id:string};
          user = await User.findOne({ where:{id:_decoded.id} });
        }
      } catch (e) {
        // Ignore malformed token for public endpoints
      }
    }
  }
  // user will be null if no token or invalid token
  // Only throw if a resolver requires authentication
  return { user};
}
