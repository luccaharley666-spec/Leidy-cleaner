import { Response, Request } from 'express';
import { AuthRequest } from '../middleware/errorHandler';
export declare class PaymentController {
    static payBooking: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    static checkoutSession: (req: AuthRequest, res: Response, next: import("express").NextFunction) => void;
    static webhook: (req: Request, res: Response) => Promise<any>;
}
export default PaymentController;
//# sourceMappingURL=PaymentController.d.ts.map