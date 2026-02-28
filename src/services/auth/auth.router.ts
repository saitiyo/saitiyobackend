
import { Router } from "express";
import AuthController from "./auth.controller";

const authRouter = Router();

authRouter.post("/get-otp",AuthController.getOTP)
authRouter.post("/verify-otp",AuthController.verifyOTP)

export default authRouter;