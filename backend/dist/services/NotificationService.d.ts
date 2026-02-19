export declare class NotificationService {
    static sendEmail(to: string, subject: string, text: string): Promise<void>;
    static sendSMS(to: string, text: string): Promise<void>;
    /**
     * Convenience helper called whenever a new booking is created.
     * Sends a confirmation to the customer and (optional) a notice to
     * the assigned staff member.
     */
    static notifyBookingCreated(booking: any): Promise<void>;
}
export default NotificationService;
//# sourceMappingURL=NotificationService.d.ts.map