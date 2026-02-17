import { Response } from 'express';
import { AuthRequest, asyncHandler, ApiError } from '../middleware/errorHandler';
import { ServiceService } from '../services/ServiceService';
import { serviceSchema } from '../utils/schemas';
import { authorizeRole } from '../middleware/auth';

export class ServiceController {
  static getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { limit, offset, category, search } = req.query;

    const result = await ServiceService.getAll({
      limit: limit ? parseInt(limit as string) : 10,
      offset: offset ? parseInt(offset as string) : 0,
      category: category as string,
      search: search as string,
    });

    res.status(200).json({
      message: 'Services retrieved',
      data: {
        services: result.services,
        pagination: {
          total: result.total,
          limit: limit ? parseInt(limit as string) : 10,
          offset: offset ? parseInt(offset as string) : 0,
        },
      },
    });
  });

  static getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const service = await ServiceService.getById(id);

    if (!service) {
      throw ApiError('Service not found', 404);
    }

    res.status(200).json({
      message: 'Service retrieved',
      data: { service },
    });
  });

  static create = asyncHandler(async (req: AuthRequest, res: Response) => {
    // Check admin role
    if (req.user?.role !== 'admin') {
      throw ApiError('Only admins can create services', 403);
    }

    const { error, value } = serviceSchema.validate(req.body);

    if (error) {
      throw ApiError(error.details[0].message, 400);
    }

    const service = await ServiceService.create({
      name: value.name,
      description: value.description,
      basePrice: value.basePrice,
      durationMinutes: value.durationMinutes,
      category: value.category,
    });

    res.status(201).json({
      message: 'Service created successfully',
      data: { service },
    });
  });

  static update = asyncHandler(async (req: AuthRequest, res: Response) => {
    // Check admin role
    if (req.user?.role !== 'admin') {
      throw ApiError('Only admins can update services', 403);
    }

    const { id } = req.params;

    // Validate schema
    const { error, value } = serviceSchema.validate(req.body, {
      allowUnknown: true,
    });

    if (error) {
      throw ApiError(error.details[0].message, 400);
    }

    const service = await ServiceService.update(id, value);

    if (!service) {
      throw ApiError('Service not found', 404);
    }

    res.status(200).json({
      message: 'Service updated successfully',
      data: { service },
    });
  });

  static delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    // Check admin role
    if (req.user?.role !== 'admin') {
      throw ApiError('Only admins can delete services', 403);
    }

    const { id } = req.params;

    const service = await ServiceService.getById(id);

    if (!service) {
      throw ApiError('Service not found', 404);
    }

    await ServiceService.delete(id);

    res.status(200).json({
      message: 'Service deleted successfully',
    });
  });

  static getCategories = asyncHandler(async (req: AuthRequest, res: Response) => {
    const categories = await ServiceService.getCategories();

    res.status(200).json({
      message: 'Categories retrieved',
      data: { categories },
    });
  });
}
