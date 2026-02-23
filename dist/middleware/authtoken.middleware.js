"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authenticateToken = (req, res, next) => {
    //get the authorization header
    const authHeader = req.headers['authorization'];
    //get the bearer token
    //token formart is "Bearer <token>"
    //so we split the string by space and get the second element
    //if the header is not present, authHeader will be undefined
    //if the header is present but does not contain a token, token will be undefined
    //if the header is present and contains a token, token will be the token string
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    else {
        //verify token
        console.log("Token received:", token);
        next();
    }
};
exports.default = authenticateToken;
//# sourceMappingURL=authtoken.middleware.js.map