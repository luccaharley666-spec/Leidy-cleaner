import { Response } from 'express';
import { AuthRequest } from '../middleware/errorHandler';
export declare class CompanyController {
    static getInfo: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    static upsert: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
}
export default CompanyController;
//# sourceMappingURL=CompanyController.d.ts.map