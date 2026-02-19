import { Response } from 'express';
import { AuthRequest } from '../middleware/errorHandler';
export declare class ReviewController {
    static create: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    static getByBooking: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    static getPublic: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    static listAll: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    static approve: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    static uploadImages: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    static delete: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=ReviewController.d.ts.map