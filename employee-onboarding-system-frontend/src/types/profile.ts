import type { UserRole } from './auth';

export interface UserProfile {
    id: number;
    fullName: string;
    email: string;
    role: UserRole;
    profileImageUrl?: string | null;
    createdAt: string;
    }

export interface UpdateProfileRequest {
    fullName: string;
}