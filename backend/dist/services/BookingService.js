"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
const database_1 = require("../utils/database");
class BookingService {
    static async createBooking(userId, serviceId, scheduledDate, totalPrice, address, notes, staffId) {
        const result = await (0, database_1.query)(`INSERT INTO bookings (user_id, service_id, scheduled_date, total_price, address, notes, staff_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *`, [userId, serviceId, scheduledDate, totalPrice, address || null, notes || null, staffId || null]);
        return result[0];
    }
    static async getBookingsByUser(userId) {
        const result = await (0, database_1.query)(`SELECT b.*, s.name as service_name FROM bookings b JOIN services s ON s.id = b.service_id WHERE b.user_id = $1 ORDER BY b.scheduled_date DESC`, [userId]);
        return result;
    }
    static async getById(id) {
        const result = await (0, database_1.query)('SELECT * FROM bookings WHERE id = $1', [id]);
        return result.length > 0 ? result[0] : null;
    }
    static async updateStatus(id, status) {
        const result = await (0, database_1.query)(`UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`, [status, id]);
        return result.length > 0 ? result[0] : null;
    }
    static async delete(id) {
        await (0, database_1.query)('DELETE FROM bookings WHERE id = $1', [id]);
        return true;
    }
    // assign staff to booking
    static async assignStaff(bookingId, staffId) {
        const result = await (0, database_1.query)(`UPDATE bookings SET staff_id = $1, updated_at = NOW() WHERE id = $2 RETURNING *`, [staffId, bookingId]);
        return result.length > 0 ? result[0] : null;
    }
    // get bookings assigned to a staff member
    static async getBookingsByStaff(staffId) {
        const result = await (0, database_1.query)(`SELECT b.*, s.name as service_name FROM bookings b JOIN services s ON s.id = b.service_id WHERE b.staff_id = $1 ORDER BY b.scheduled_date DESC`, [staffId]);
        return result;
    }
    // admin helper: list all bookings (with service name)
    static async getAllBookings() {
        const result = await (0, database_1.query)(`SELECT b.*, s.name as service_name 
       FROM bookings b
       JOIN services s ON s.id = b.service_id
       ORDER BY b.scheduled_date DESC`);
        return result;
    }
}
exports.BookingService = BookingService;
exports.default = BookingService;
//# sourceMappingURL=BookingService.js.map