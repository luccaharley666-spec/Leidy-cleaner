import { Response } from 'express';
import { AuthRequest } from '../middleware/errorHandler';
export declare class StaffController {
    static list: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    static getById: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    static updateProfile: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    static getAvailability: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    static setAvailability: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    static getReviews: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    static getRating: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=StaffController.d.ts.map