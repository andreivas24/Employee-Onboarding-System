import axios from 'axios';
import type { UserRole } from '../types/auth';
import type { NotificationItem } from '../types/notification';

const API_URL = 'http://localhost:8080/api/notifications';

const roleHeader = (role: UserRole) => ({
    headers: {
        'X-User-Role': role,
    },
});

export const notificationApi = {
    getAll: async (role: UserRole): Promise<NotificationItem[]> => {
        const response = await axios.get<NotificationItem[]>(API_URL, roleHeader(role));
        return response.data;
    },

    getUnreadCount: async (role: UserRole): Promise<number> => {
        const response = await axios.get<number>(
            `${API_URL}/unread-count`,
            roleHeader(role)
        );
        return response.data;
    },

    markAsRead: async (id: number): Promise<NotificationItem> => {
        const response = await axios.post<NotificationItem>(`${API_URL}/${id}/read`);
        return response.data;
    },

    markAllAsRead: async (role: UserRole): Promise<void> => {
        await axios.post(`${API_URL}/read-all`, null, roleHeader(role));
    },
};