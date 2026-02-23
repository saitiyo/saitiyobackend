"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../../lib/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const managejwt_1 = require("../../utils/managejwt");
class AuthController {
    static async registeruser(req, res) {
        try {
            const { email, password, firstName, lastName } = req.body;
            let response = await prisma_1.prisma.user.findFirst({
                where: {
                    email: email,
                },
            });
            /**
             * account already exists
             */
            if (response) {
                res.json({
                    isError: true,
                    message: "Account already exists",
                    payload: null
                });
                return;
            }
            /**
             * hash password
             */
            let salt = await bcryptjs_1.default.genSaltSync(10);
            let hash = await bcryptjs_1.default.hashSync(password, salt);
            const newUser = await prisma_1.prisma.user.create({
                data: {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    password: hash
                }
            });
            res.json({
                isError: false,
                message: "account created successfully",
                token: newUser,
            });
        }
        catch (error) {
            //impliment logger later
            console.log("error", error);
            res.json({
                isError: true,
                message: "Something has gone wrong..." + error,
                token: null,
            });
        }
    }
    static async loginuser(req, res) {
        try {
            const { email, password } = req.body;
            let response = await prisma_1.prisma.user.findFirst({
                where: {
                    email: email,
                },
            });
            /**
             * account does not exist
             */
            if (!response) {
                res.status(400).json({
                    isError: true,
                    message: "Account does not exist",
                    payload: null
                });
                return;
            }
            /**
             * verify password
             */
            let isCorrect = bcryptjs_1.default.compareSync(password, response.password);
            if (!isCorrect) {
                res.status(400).json({
                    isError: true,
                    message: "Wrong password",
                    payload: null
                });
                return;
            }
            let _data = {
                id: response.id,
            };
            let token = await (0, managejwt_1.generateJWT)(_data);
            res.status(200).json({
                isError: false,
                message: "operation successfull",
                payload: token,
            });
        }
        catch (error) {
        }
    }
}
exports.default = AuthController;
//# sourceMappingURL=auth.controller.js.map