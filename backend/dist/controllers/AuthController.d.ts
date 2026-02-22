import { Response } from 'express';
import { AuthRequest } from '../middleware/errorHandler';
export declare class AuthController {
    static register: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    static login: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    static refreshToken: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    static logout: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    static getProfile: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    static updateProfile: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    static listByRole: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=AuthController.d.ts.map