
import { Router } from "express";
import AuthController from "./auth.controller";

const authRouter = Router();

authRouter.post("/get-otp",AuthController.getOTP)
authRouter.post("/verify-otp",AuthController.verifyOTP)
authRouter.post("/authenticate",AuthController.getUserByToken)
// web
authRouter.get("/web/get-qrcode", AuthController.getQRcodeData)    

export default authRouter;