import axios from 'axios';
import type { UserRole } from '../types/auth';
import type { UpdateUserRoleRequest, User } from '../types/user';

const API_URL = 'http://localhost:8080/api/admin';

const roleHeader = (role: UserRole) => ({
    headers: {
        'X-User-Role': role,
    },
});

export const adminApi = {
    getUsers: async (role: UserRole): Promise<User[]> => {
        const response = await axios.get<User[]>(`${API_URL}/users`, roleHeader(role));
        return response.data;
    },

    updateUserRole: async (
        adminRole: UserRole,
        userId: number,
        data: UpdateUserRoleRequest
    ): Promise<User> => {
        const response = await axios.put<User>(
            `${API_URL}/users/${userId}/role`,
            data,
            roleHeader(adminRole)
        );

    return response.data;
    },
};