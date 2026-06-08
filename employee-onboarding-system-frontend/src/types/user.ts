import type { UserRole } from './auth';

export interface User {
    id: number;
    fullName: string;
    email: string;
    role: UserRole;
    createdAt: string;
}

export interface UpdateUserRoleRequest {
    role: UserRole;
}