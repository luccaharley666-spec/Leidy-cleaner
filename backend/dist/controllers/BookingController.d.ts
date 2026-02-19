import { Response } from 'express';
import { AuthRequest } from '../middleware/errorHandler';
export declare class BookingController {
    static create: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    static listByUser: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    static getById: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    static updateStatus: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    static remove: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    static listAll: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    static assignStaff: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    static listByStaff: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
}
export default BookingController;
//# sourceMappingURL=BookingController.d.ts.map