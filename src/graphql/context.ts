import { decodeJWT } from "../utils/managejwt";
import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../db/models/models";

export const context = async ({ req, res }: { req: Request; res: Response }) => {
  const authHeader = req.headers.authorization;
  console.log("======================>>>>>>> authHeader", authHeader);

  let user = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    if (!token || token === "undefined" || token === "null") {
      // Treat as no token
      return { user };
    }

    try {
      const decoded = await decodeJWT(token);

      console.log("======================>>>>>>> decoded", decoded);

      if (decoded && typeof decoded === "object" && "id" in decoded) {
        const { id } = decoded as { id: string };
          user = await User.findOne({
            _id:id
            })
        
      }
    } catch (e) {
      // Ignore malformed / expired tokens for public endpoints
      console.warn("Context: invalid token", e);
    }
  }

  return { user };
};