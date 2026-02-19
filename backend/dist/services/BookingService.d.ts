export declare class BookingService {
    static createBooking(userId: string, serviceId: string, scheduledDate: string, totalPrice: number, address?: string, notes?: string, staffId?: string): Promise<any>;
    static getBookingsByUser(userId: string): Promise<any[]>;
    static getById(id: string): Promise<any>;
    static updateStatus(id: string, status: string): Promise<any>;
    static delete(id: string): Promise<boolean>;
    static assignStaff(bookingId: string, staffId: string): Promise<any>;
    static getBookingsByStaff(staffId: string): Promise<any[]>;
    static getAllBookings(): Promise<any[]>;
}
export default BookingService;
//# sourceMappingURL=BookingService.d.ts.map