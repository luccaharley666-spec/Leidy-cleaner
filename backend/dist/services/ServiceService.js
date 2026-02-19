"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceService = void 0;
const database_1 = require("../utils/database");
const logger_1 = require("../utils/logger");
const mockData_1 = require("../utils/mockData");
class ServiceService {
    static async getAll(filters) {
        try {
            let whereClause = 'WHERE is_active = true';
            const params = [];
            if (filters?.category) {
                whereClause += ` AND category = $${params.length + 1}`;
                params.push(filters.category);
            }
            if (filters?.search) {
                whereClause += ` AND (name ILIKE $${params.length + 1} OR description ILIKE $${params.length + 2})`;
                params.push(`%${filters.search}%`);
                params.push(`%${filters.search}%`);
            }
            // Get total count
            const countResult = await (0, database_1.query)(`SELECT COUNT(*) as total FROM services ${whereClause}`, params);
            // Get paginated results
            const limit = filters?.limit || 10;
            const offset = filters?.offset || 0;
            const services = await (0, database_1.query)(`SELECT id, name, description, base_price, duration_minutes, category, is_active, created_at
         FROM services ${whereClause}
         ORDER BY created_at DESC
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]);
            return {
                services,
                total: parseInt(countResult[0].total),
            };
        }
        catch (err) {
            // If database fails, use mock data for development
            logger_1.logger.warn('Using mock data for services (database unavailable)');
            let filtered = [...mockData_1.MOCK_SERVICES];
            if (filters?.category) {
                filtered = filtered.filter(s => s.category === filters.category);
            }
            if (filters?.search) {
                const search = filters.search.toLowerCase();
                filtered = filtered.filter(s => s.name.toLowerCase().includes(search) ||
                    s.description.toLowerCase().includes(search));
            }
            const limit = filters?.limit || 10;
            const offset = filters?.offset || 0;
            const paginated = filtered.slice(offset, offset + limit);
            return {
                services: paginated,
                total: filtered.length,
            };
        }
    }
    static async getById(id) {
        try {
            const result = await (0, database_1.query)(`SELECT id, name, description, base_price, duration_minutes, category, is_active, created_at
         FROM services WHERE id = $1 AND is_active = true`, [id]);
            return result.length > 0 ? result[0] : null;
        }
        catch (err) {
            // Use mock data if database fails
            logger_1.logger.warn('Using mock data for service (database unavailable)');
            return mockData_1.MOCK_SERVICES.find(s => s.id === id) || null;
        }
    }
    static async create(serviceData) {
        const result = await (0, database_1.query)(`INSERT INTO services (name, description, base_price, duration_minutes, category, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
       RETURNING id, name, description, base_price, duration_minutes, category, is_active, created_at`, [
            serviceData.name,
            serviceData.description || null,
            serviceData.basePrice,
            serviceData.durationMinutes,
            serviceData.category,
        ]);
        logger_1.logger.info(`✅ Service created: ${serviceData.name}`);
        return result[0];
    }
    static async update(id, serviceData) {
        const fields = [];
        const values = [];
        let paramCount = 1;
        if (serviceData.name) {
            fields.push(`name = $${paramCount++}`);
            values.push(serviceData.name);
        }
        if (serviceData.description) {
            fields.push(`description = $${paramCount++}`);
            values.push(serviceData.description);
        }
        if (serviceData.basePrice !== undefined) {
            fields.push(`base_price = $${paramCount++}`);
            values.push(serviceData.basePrice);
        }
        if (serviceData.durationMinutes !== undefined) {
            fields.push(`duration_minutes = $${paramCount++}`);
            values.push(serviceData.durationMinutes);
        }
        if (serviceData.category) {
            fields.push(`category = $${paramCount++}`);
            values.push(serviceData.category);
        }
        if (fields.length === 0) {
            return this.getById(id);
        }
        fields.push(`updated_at = NOW()`);
        values.push(id);
        const queryStr = `UPDATE services SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
        const result = await (0, database_1.query)(queryStr, values);
        return result.length > 0 ? result[0] : null;
    }
    static async delete(id) {
        await (0, database_1.query)('UPDATE services SET is_active = false WHERE id = $1', [id]);
        logger_1.logger.info(`✅ Service deleted: ${id}`);
    }
    static async getCategories() {
        try {
            const result = await (0, database_1.query)('SELECT DISTINCT category FROM services WHERE is_active = true ORDER BY category');
            return result.map((row) => row.category);
        }
        catch (err) {
            // Use mock data if database fails
            logger_1.logger.warn('Using mock data for categories (database unavailable)');
            const categories = [...new Set(mockData_1.MOCK_SERVICES.map(s => s.category))].sort();
            return categories;
        }
    }
}
exports.ServiceService = ServiceService;
//# sourceMappingURL=ServiceService.js.map