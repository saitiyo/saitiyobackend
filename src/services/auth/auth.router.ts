
import { Router } from "express";
import AuthController from "./auth.controller";

const authRouter = Router();
// const authController =  new AuthController();

authRouter.post("/login",AuthController.loginuser)
authRouter.post("/register",AuthController.registeruser)



export default authRouter;