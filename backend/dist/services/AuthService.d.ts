import { User, UserResponse } from '../types/auth';
export declare class AuthService {
    static register(email: string, password: string, name: string, phone?: string): Promise<{
        user: UserResponse;
        accessToken: string;
        refreshToken: string;
    }>;
    static login(email: string, password: string): Promise<{
        user: UserResponse;
        accessToken: string;
        refreshToken: string;
    }>;
    static refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    static getUserById(id: string): Promise<User | null>;
    static updateUser(id: string, updates: Partial<User>): Promise<User | null>;
    static getUsersByRole(role: string): Promise<User[]>;
}
//# sourceMappingURL=AuthService.d.ts.map