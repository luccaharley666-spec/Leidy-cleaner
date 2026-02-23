import { Response } from 'express';
import { AuthRequest, asyncHandler, ApiError } from '../middleware/errorHandler';
import { StaffService } from '../services/StaffService';
import { profileUpdateSchema, availabilityArraySchema } from '../utils/schemas';
import { camelize } from '../utils/transformers';

export class StaffController {
  static list = asyncHandler(async (_req: AuthRequest, res: Response) => {
    const staff = await StaffService.listStaff();
    res.status(200).json({ message: 'Staff retrieved', data: { staff: camelize(staff) } });
  });

  static getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const staff = await StaffService.getById(id);
    if (!staff) {
      throw ApiError('Staff not found', 404);
    }
    res.status(200).json({ message: 'Staff retrieved', data: { staff: camelize(staff) } });
  });

  static updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    // only the staff themselves or admin may update
    if (req.user?.role !== 'admin' && req.user?.id !== id) {
      throw ApiError('Not authorized to update this profile', 403);
    }
    const { error, value } = profileUpdateSchema.validate(req.body, { allowUnknown: true });
    if (error) {
      throw ApiError(error.details[0].message, 400);
    }
    const updated = await StaffService.updateProfile(id, value);
    if (!updated) {
      throw ApiError('Staff not found', 404);
    }
    res.status(200).json({ message: 'Profile updated', data: { staff: camelize(updated) } });
  });

  static getAvailability = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const slots = await StaffService.getAvailability(id);
    res.status(200).json({ message: 'Availability fetched', data: { availability: camelize(slots) } });
  });

  static setAvailability = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    if (req.user?.role !== 'admin' && req.user?.id !== id) {
      throw ApiError('Not authorized', 403);
    }
    const { error, value } = availabilityArraySchema.validate(req.body);
    if (error) {
      throw ApiError(error.details[0].message, 400);
    }
    const slots = await StaffService.setAvailability(id, value);
    res.status(200).json({ message: 'Availability updated', data: { availability: camelize(slots) } });
  });

  static getReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const reviews = await StaffService.getReviewsForStaff(id);
    res.status(200).json({ message: 'Reviews retrieved', data: { reviews: camelize(reviews) } });
  });

  static getRating = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const avg = await StaffService.getAverageRating(id);
    res.status(200).json({ message: 'Rating retrieved', data: { rating: avg } });
  });
}
