import { User, Availability } from '../types/auth';
export declare class StaffService {
    static listStaff(): Promise<User[]>;
    static getById(id: string): Promise<User | null>;
    static updateProfile(id: string, updates: Partial<User>): Promise<User | null>;
    static getAvailability(staffId: string): Promise<Availability[]>;
    static getReviewsForStaff(staffId: string): Promise<any[]>;
    static getAverageRating(staffId: string): Promise<number>;
    static setAvailability(staffId: string, slots: {
        day: string;
        startTime: string;
        endTime: string;
    }[]): Promise<Availability[]>;
}
export default StaffService;
//# sourceMappingURL=StaffService.d.ts.map