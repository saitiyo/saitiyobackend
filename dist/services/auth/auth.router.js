"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = __importDefault(require("./auth.controller"));
const authRouter = (0, express_1.Router)();
// const authController =  new AuthController();
authRouter.post("/login", auth_controller_1.default.loginuser);
authRouter.post("/register", auth_controller_1.default.registeruser);
exports.default = authRouter;
//# sourceMappingURL=auth.router.js.map