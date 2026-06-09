import axios from 'axios';
import { getAuthHeader } from './authHeader';
import type { UpdateUserRoleRequest, User } from '../types/user';

const API_URL = 'http://localhost:8080/api/admin';

export const adminApi = {
    getUsers: async (): Promise<User[]> => {
        const response = await axios.get<User[]>(
            `${API_URL}/users`,
            getAuthHeader()
        );

        return response.data;
    },

    updateUserRole: async (
        userId: number,
        data: UpdateUserRoleRequest
    ): Promise<User> => {
        const response = await axios.put<User>(
            `${API_URL}/users/${userId}/role`,
            data,
            getAuthHeader()
        );

        return response.data;
    },
};