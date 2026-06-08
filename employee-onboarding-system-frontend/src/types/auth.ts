export type UserRole = 'HR' | 'MANAGER' | 'FINANCE' | 'IT' | 'ADMIN' | 'VIEWER';

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}