"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_router_1 = __importDefault(require("./services/auth/auth.router"));
const admin_auth_router_1 = __importDefault(require("./services/admin/admin.auth.router"));
const app = (0, express_1.default)();
const apiPrefix = "/api";
// cors middleware
app.use((0, cors_1.default)());
//middleware to parse json body
app.use(express_1.default.json());
//url encoding
app.use(`${apiPrefix}/admin`, admin_auth_router_1.default);
app.use(`${apiPrefix}/auth`, auth_router_1.default);
exports.default = app;
//# sourceMappingURL=server.js.map