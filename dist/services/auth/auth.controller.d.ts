import { Request, Response } from "express";
declare class AuthController {
    static registeruser(req: Request, res: Response): Promise<void>;
    static loginuser(req: Request, res: Response): Promise<void>;
}
export default AuthController;
//# sourceMappingURL=auth.controller.d.ts.map