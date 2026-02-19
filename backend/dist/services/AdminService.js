"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const database_1 = require("../utils/database");
class AdminService {
    static async getStats() {
        const [usersRes, servicesRes, bookingsRes, reviewsRes] = await Promise.all([
            (0, database_1.query)('SELECT COUNT(*) as count FROM users'),
            (0, database_1.query)('SELECT COUNT(*) as count FROM services'),
            (0, database_1.query)('SELECT COUNT(*) as count FROM bookings'),
            (0, database_1.query)('SELECT COUNT(*) as count FROM reviews WHERE is_approved = FALSE'),
        ]);
        return {
            users: Number(usersRes[0].count || 0),
            services: Number(servicesRes[0].count || 0),
            bookings: Number(bookingsRes[0].count || 0),
            pendingReviews: Number(reviewsRes[0].count || 0),
        };
    }
}
exports.AdminService = AdminService;
exports.default = AdminService;
//# sourceMappingURL=AdminService.js.map