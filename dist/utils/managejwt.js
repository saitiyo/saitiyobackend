"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeJWT = exports.generateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateJWT = async (userInfo) => {
    const secrete = process.env.ACCESS_TOKEN_SECRET;
    if (!secrete) {
        //send email to dev team
        return;
    }
    const token = await jsonwebtoken_1.default.sign(userInfo, secrete);
    return token;
};
exports.generateJWT = generateJWT;
const decodeJWT = async (token) => {
    const secrete = process.env.ACCESS_TOKEN_SECRET;
    if (!secrete) {
        return;
    }
    return await jsonwebtoken_1.default.verify(token, secrete);
};
exports.decodeJWT = decodeJWT;
//# sourceMappingURL=managejwt.js.map