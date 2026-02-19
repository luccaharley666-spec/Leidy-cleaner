"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const database_1 = require("../utils/database");
class NotificationService {
    static async sendEmail(to, subject, text) {
        // placeholder implementation: log to console or integrate with real provider
        if (process.env.DISABLE_EMAIL === 'true') {
            console.log('[Notification] (disabled) email', to, subject, text);
            return;
        }
        console.log('[Notification] email to', to, 'subject', subject);
        // TODO: hook up to SendGrid/SES/etc using API key from env
    }
    static async sendSMS(to, text) {
        // placeholder - just console log
        console.log('[Notification] sms to', to, text);
        // TODO: integrate with Twilio or similar
    }
    /**
     * Convenience helper called whenever a new booking is created.
     * Sends a confirmation to the customer and (optional) a notice to
     * the assigned staff member.
     */
    static async notifyBookingCreated(booking) {
        try {
            // user notification
            const users = await (0, database_1.query)('SELECT email, name FROM users WHERE id = $1', [booking.user_id]);
            if (users.length > 0) {
                const user = users[0];
                await this.sendEmail(user.email, 'Seu agendamento foi criado', `Olá ${user.name}, seu agendamento (#${booking.id}) foi criado para ${booking.scheduled_date}.`);
            }
            // staff notification if assigned
            if (booking.staff_id) {
                const staffRows = await (0, database_1.query)('SELECT email, name FROM users WHERE id = $1', [booking.staff_id]);
                if (staffRows.length > 0) {
                    const staff = staffRows[0];
                    await this.sendEmail(staff.email, 'Novo agendamento atribuído', `Olá ${staff.name}, você foi atribuído ao agendamento #${booking.id}.`);
                }
            }
        }
        catch (err) {
            console.error('[Notification] error in notifyBookingCreated', err);
        }
    }
}
exports.NotificationService = NotificationService;
exports.default = NotificationService;
//# sourceMappingURL=NotificationService.js.map