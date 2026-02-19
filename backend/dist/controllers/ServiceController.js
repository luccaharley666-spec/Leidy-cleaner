"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceController = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const ServiceService_1 = require("../services/ServiceService");
const schemas_1 = require("../utils/schemas");
// helper to convert snake_case keys to camelCase recursively
function camelize(obj) {
    if (Array.isArray(obj))
        return obj.map(camelize);
    if (obj && typeof obj === 'object') {
        return Object.fromEntries(Object.entries(obj).map(([k, v]) => {
            const camelKey = k.replace(/_([a-z])/g, (_m, c) => c.toUpperCase());
            return [camelKey, camelize(v)];
        }));
    }
    return obj;
}
class ServiceController {
}
exports.ServiceController = ServiceController;
_a = ServiceController;
ServiceController.getAll = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { limit, offset, category, search } = req.query;
    const result = await ServiceService_1.ServiceService.getAll({
        limit: limit ? parseInt(limit) : 10,
        offset: offset ? parseInt(offset) : 0,
        category: category,
        search: search,
    });
    res.status(200).json({
        message: 'Services retrieved',
        data: {
            services: camelize(result.services),
            pagination: {
                total: result.total,
                limit: limit ? parseInt(limit) : 10,
                offset: offset ? parseInt(offset) : 0,
            },
        },
    });
});
ServiceController.getById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const service = await ServiceService_1.ServiceService.getById(id);
    if (!service) {
        throw (0, errorHandler_1.ApiError)('Service not found', 404);
    }
    res.status(200).json({
        message: 'Service retrieved',
        data: { service: camelize(service) },
    });
});
ServiceController.create = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    // Validate payload first
    const { error, value } = schemas_1.serviceSchema.validate(req.body);
    if (error) {
        throw (0, errorHandler_1.ApiError)(error.details[0].message, 400);
    }
    // Then check admin role
    if (req.user?.role !== 'admin') {
        throw (0, errorHandler_1.ApiError)('Only admins can create services', 403);
    }
    const service = await ServiceService_1.ServiceService.create({
        name: value.name,
        description: value.description,
        basePrice: value.basePrice,
        durationMinutes: value.durationMinutes,
        category: value.category,
    });
    res.status(201).json({
        message: 'Service created successfully',
        data: { service: camelize(service) },
    });
});
ServiceController.update = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    // Validate payload first (partial updates allowed)
    const { error, value } = schemas_1.serviceUpdateSchema.validate(req.body, {
        allowUnknown: true,
    });
    if (error) {
        throw (0, errorHandler_1.ApiError)(error.details[0].message, 400);
    }
    // Then check admin role
    if (req.user?.role !== 'admin') {
        throw (0, errorHandler_1.ApiError)('Only admins can update services', 403);
    }
    const service = await ServiceService_1.ServiceService.update(id, value);
    if (!service) {
        throw (0, errorHandler_1.ApiError)('Service not found', 404);
    }
    res.status(200).json({
        message: 'Service updated successfully',
        data: { service: camelize(service) },
    });
});
ServiceController.delete = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    // Check admin role
    if (req.user?.role !== 'admin') {
        throw (0, errorHandler_1.ApiError)('Only admins can delete services', 403);
    }
    const { id } = req.params;
    const service = await ServiceService_1.ServiceService.getById(id);
    if (!service) {
        throw (0, errorHandler_1.ApiError)('Service not found', 404);
    }
    await ServiceService_1.ServiceService.delete(id);
    res.status(200).json({
        message: 'Service deleted successfully',
    });
});
ServiceController.getCategories = (0, errorHandler_1.asyncHandler)(async (_req, res) => {
    const categories = await ServiceService_1.ServiceService.getCategories();
    res.status(200).json({
        message: 'Categories retrieved',
        data: { categories },
    });
});
//# sourceMappingURL=ServiceController.js.map