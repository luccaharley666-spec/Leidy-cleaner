"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const database_1 = require("../utils/database");
class PaymentService {
    // mark booking as paid/confirmed
    static async markBookingPaid(bookingId) {
        const result = await (0, database_1.query)(`UPDATE bookings SET status = 'confirmed', payment_status = 'paid', updated_at = NOW() WHERE id = $1 RETURNING *`, [bookingId]);
        return result.length > 0 ? result[0] : null;
    }
}
exports.PaymentService = PaymentService;
exports.default = PaymentService;
//# sourceMappingURL=PaymentService.js.map