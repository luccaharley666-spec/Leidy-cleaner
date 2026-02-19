export declare class ReviewService {
    static createReview(userId: string, bookingId: string, rating: number, comment?: string, images?: string[]): Promise<any>;
    static getByBooking(bookingId: string): Promise<any[]>;
    static getPublic(serviceId?: string): Promise<any[]>;
    static getAll(): Promise<any[]>;
    static approve(id: string): Promise<any>;
    static delete(id: string): Promise<boolean>;
    static getById(id: string): Promise<any>;
    static addImages(id: string, urls: string[]): Promise<any>;
}
export default ReviewService;
//# sourceMappingURL=ReviewService.d.ts.map