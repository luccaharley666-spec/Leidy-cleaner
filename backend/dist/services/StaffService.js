"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffService = void 0;
const database_1 = require("../utils/database");
class StaffService {
    static async listStaff() {
        const result = await (0, database_1.query)(`SELECT id, email, full_name as name, phone, role, bio, photo_url as "photoUrl"
       FROM users WHERE role = 'staff'`);
        return result;
    }
    static async getById(id) {
        const result = await (0, database_1.query)(`SELECT id, email, full_name as name, phone, role, bio, photo_url as "photoUrl"
       FROM users WHERE id = $1 AND role = 'staff'`, [id]);
        return result.length > 0 ? result[0] : null;
    }
    static async updateProfile(id, updates) {
        // reuse AuthService.updateUser since it already handles bio/photoUrl
        const { AuthService } = require('./AuthService');
        return AuthService.updateUser(id, updates);
    }
    static async getAvailability(staffId) {
        const result = await (0, database_1.query)(`SELECT id, staff_id as "staffId", day, start_time as "startTime", end_time as "endTime"
       FROM staff_availability WHERE staff_id = $1 ORDER BY day, start_time`, [staffId]);
        return result;
    }
    static async getReviewsForStaff(staffId) {
        const result = await (0, database_1.query)(`SELECT r.*
       FROM reviews r
       JOIN bookings b ON b.id = r.booking_id
       WHERE b.staff_id = $1 AND r.is_approved = TRUE
       ORDER BY r.created_at DESC`, [staffId]);
        return result;
    }
    static async getAverageRating(staffId) {
        const result = await (0, database_1.query)(`SELECT AVG(r.rating) as avg
       FROM reviews r
       JOIN bookings b ON b.id = r.booking_id
       WHERE b.staff_id = $1 AND r.is_approved = TRUE`, [staffId]);
        const avg = result[0]?.avg;
        return avg !== null && avg !== undefined ? parseFloat(avg) : 0;
    }
    static async setAvailability(staffId, slots) {
        // remove existing
        await (0, database_1.query)('DELETE FROM staff_availability WHERE staff_id = $1', [staffId]);
        if (slots.length === 0)
            return [];
        const values = [];
        const placeholders = [];
        let idx = 1;
        for (const slot of slots) {
            values.push(staffId, slot.day, slot.startTime, slot.endTime);
            placeholders.push(`($${idx++}, $${idx++}, $${idx++}, $${idx++})`);
        }
        const insertSQL = `INSERT INTO staff_availability (staff_id, day, start_time, end_time) VALUES ${placeholders.join(', ')} RETURNING id, staff_id as "staffId", day, start_time as "startTime", end_time as "endTime"`;
        const res = await (0, database_1.query)(insertSQL, values);
        return res;
    }
}
exports.StaffService = StaffService;
exports.default = StaffService;
//# sourceMappingURL=StaffService.js.map