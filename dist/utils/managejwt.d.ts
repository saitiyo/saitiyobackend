import jwt from "jsonwebtoken";
export declare const generateJWT: (userInfo: object) => Promise<string | undefined>;
export declare const decodeJWT: (token: string | any) => Promise<string | jwt.JwtPayload | undefined>;
//# sourceMappingURL=managejwt.d.ts.map