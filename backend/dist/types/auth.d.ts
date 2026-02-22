export interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    role: 'customer' | 'staff' | 'admin' | 'provider';
    bio?: string | null;
    photoUrl?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface Availability {
    id: string;
    staffId: string;
    day: string;
    startTime: string;
    endTime: string;
}
export type UserResponse = Omit<User, 'createdAt' | 'updatedAt'>;
export interface AuthToken {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface JWTPayload {
    id: string;
    email: string;
    role: string;
}
//# sourceMappingURL=auth.d.ts.map