"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_auth_controller_1 = __importDefault(require("./admin.auth.controller"));
const adminAuthRouter = (0, express_1.Router)();
// const authController =  new AuthController();
adminAuthRouter.post("/login", admin_auth_controller_1.default.loginadmin);
adminAuthRouter.post("/register", admin_auth_controller_1.default.registeradmin);
exports.default = adminAuthRouter;
//# sourceMappingURL=admin.auth.router.js.map