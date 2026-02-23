
import { Router } from "express";
import AdminAuthController from "./admin.auth.controller";

const adminAuthRouter = Router();
// const authController =  new AuthController();

adminAuthRouter.post("/login",AdminAuthController.loginadmin)
adminAuthRouter.post("/register",AdminAuthController.registeradmin)



export default adminAuthRouter;