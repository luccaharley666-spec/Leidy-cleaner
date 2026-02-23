import { Response } from 'express';
import { AuthRequest, asyncHandler, ApiError } from '../middleware/errorHandler';
import { ServiceService } from '../services/ServiceService';
import { serviceSchema, serviceUpdateSchema } from '../utils/schemas';
import { cache } from '../utils/cache';
import { camelize } from '../utils/transformers';
import { UserRole } from '../utils/constants';

export class ServiceController {
  static getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { limit, offset, category, search } = req.query;

    // Criar chave de cache baseada nos parâmetros
    const cacheKey = `services:${limit || 10}:${offset || 0}:${category || ''}:${search || ''}`;

    // Tentar obter do cache
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      return res.status(200).json({
        message: 'Services retrieved (cached)',
        data: cachedResult,
        cached: true
      });
    }

    const result = await ServiceService.getAll({
      limit: limit ? parseInt(limit as string) : 10,
      offset: offset ? parseInt(offset as string) : 0,
      category: category as string,
      search: search as string,
    });

    const responseData = {
      services: camelize(result.services),
      pagination: {
        total: result.total,
        limit: limit ? parseInt(limit as string) : 10,
        offset: offset ? parseInt(offset as string) : 0,
      },
    };

    // Cache por 5 minutos
    cache.set(cacheKey, responseData, 300000);

    return res.status(200).json({
      message: 'Services retrieved',
      data: responseData,
    });
  });

  static getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };

    const service = await ServiceService.getById(id);

    if (!service) {
      throw ApiError('Service not found', 404);
    }

    res.status(200).json({
      message: 'Service retrieved',
      data: { service: camelize(service) },
    });
  });

  static create = asyncHandler(async (req: AuthRequest, res: Response) => {
    // Validate payload first
    const { error, value } = serviceSchema.validate(req.body);

    if (error) {
      throw ApiError(error.details[0].message, 400);
    }

    // Then check admin role
    if (req.user?.role !== UserRole.ADMIN) {
      throw ApiError('Only admins can create services', 403);
    }

    const service = await ServiceService.create({
      name: value.name,
      description: value.description,
      basePrice: value.basePrice,
      durationMinutes: value.durationMinutes,
      category: value.category,
    });

    // Invalidar cache de serviços
    cache.clear();

    res.status(201).json({
      message: 'Service created successfully',
      data: { service: camelize(service) },
    });
  });

  static update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };

    // Validate payload first (partial updates allowed)
    const { error, value } = serviceUpdateSchema.validate(req.body, {
      allowUnknown: true,
    });

    if (error) {
      throw ApiError(error.details[0].message, 400);
    }

    // Then check admin role
    if (req.user?.role !== UserRole.ADMIN) {
      throw ApiError('Only admins can update services', 403);
    }

    const service = await ServiceService.update(id, value);

    if (!service) {
      throw ApiError('Service not found', 404);
    }

    res.status(200).json({
      message: 'Service updated successfully',
      data: { service: camelize(service) },
    });
  });

  static delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    // Check admin role
    if (req.user?.role !== UserRole.ADMIN) {
      throw ApiError('Only admins can delete services', 403);
    }

    const { id } = req.params as { id: string };

    const service = await ServiceService.getById(id);

    if (!service) {
      throw ApiError('Service not found', 404);
    }

    await ServiceService.delete(id);

    res.status(200).json({
      message: 'Service deleted successfully',
    });
  });

  static getCategories = asyncHandler(async (_req: AuthRequest, res: Response) => {
    const categories = await ServiceService.getCategories();

    res.status(200).json({
      message: 'Categories retrieved',
      data: { categories },
    });
  });
}
