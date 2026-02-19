"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const database_1 = require("../utils/database");
class ReviewService {
    static async createReview(userId, bookingId, rating, comment, images) {
        const result = await (0, database_1.query)(`INSERT INTO reviews (user_id, booking_id, rating, comment, images, is_approved, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *`, [userId, bookingId, rating, comment || null, images || null, false]);
        return result[0];
    }
    static async getByBooking(bookingId) {
        const result = await (0, database_1.query)(`SELECT r.*, s.name as service_name FROM reviews r
       JOIN bookings b ON b.id = r.booking_id
       JOIN services s ON s.id = b.service_id
       WHERE r.booking_id = $1`, [bookingId]);
        return result;
    }
    static async getPublic(serviceId) {
        let sql = `SELECT r.*, s.name as service_name, s.id as service_id FROM reviews r
      JOIN bookings b ON b.id = r.booking_id
      JOIN services s ON s.id = b.service_id
      WHERE r.is_approved = TRUE`;
        const params = [];
        if (serviceId) {
            sql += ` AND s.id = $${params.length + 1}`;
            params.push(serviceId);
        }
        sql += ` ORDER BY r.created_at DESC`;
        const result = await (0, database_1.query)(sql, params);
        return result;
    }
    // admin helper
    static async getAll() {
        const result = await (0, database_1.query)(`SELECT r.*, s.name as service_name FROM reviews r
       JOIN bookings b ON b.id = r.booking_id
       JOIN services s ON s.id = b.service_id
       ORDER BY r.created_at DESC`);
        return result;
    }
    static async approve(id) {
        const result = await (0, database_1.query)(`UPDATE reviews SET is_approved = TRUE, updated_at = NOW() WHERE id = $1 RETURNING *`, [id]);
        return result.length > 0 ? result[0] : null;
    }
    static async delete(id) {
        await (0, database_1.query)(`DELETE FROM reviews WHERE id = $1`, [id]);
        return true;
    }
    static async getById(id) {
        const result = await (0, database_1.query)(`SELECT * FROM reviews WHERE id = $1`, [id]);
        return result.length > 0 ? result[0] : null;
    }
    static async addImages(id, urls) {
        // append to images array
        const result = await (0, database_1.query)(`UPDATE reviews SET images = COALESCE(images, ARRAY[]::TEXT[]) || $2, updated_at = NOW() WHERE id = $1 RETURNING *`, [id, urls]);
        return result.length > 0 ? result[0] : null;
    }
}
exports.ReviewService = ReviewService;
exports.default = ReviewService;
//# sourceMappingURL=ReviewService.js.map