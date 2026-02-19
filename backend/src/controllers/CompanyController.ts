import { Response } from 'express';
import { asyncHandler, ApiError, AuthRequest } from '../middleware/errorHandler';
import CompanyService from '../services/CompanyService';

export class CompanyController {
  static getInfo = asyncHandler(async (_req: AuthRequest, res: Response) => {
    const company = await CompanyService.getLatest();
    if (!company) throw ApiError('Company info not found', 404);
    res.status(200).json({ message: 'Company info retrieved', data: { company } });
  });

  static upsert = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user || req.user.role !== 'admin') throw ApiError('Only admins can update company info', 403);
    const info = req.body;
    const updated = await CompanyService.upsert(info);
    res.status(200).json({ message: 'Company info updated', data: { company: updated } });
  });
}

export default CompanyController;
