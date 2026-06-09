import axios from 'axios';
import { getAuthHeader } from './authHeader';
import type { NotificationItem } from '../types/notification';

const API_URL = 'http://localhost:8080/api/notifications';

export const notificationApi = {
    getAll: async (): Promise<NotificationItem[]> => {
        const response = await axios.get<NotificationItem[]>(
            API_URL,
            getAuthHeader()
        );

        return response.data;
    },

    getUnreadCount: async (): Promise<number> => {
        const response = await axios.get<number>(
            `${API_URL}/unread-count`,
            getAuthHeader()
        );

        return response.data;
    },

    markAsRead: async (
        id: number
    ): Promise<NotificationItem> => {
        const response = await axios.post<NotificationItem>(
            `${API_URL}/${id}/read`,
            null,
            getAuthHeader()
        );

        return response.data;
    },

    markAllAsRead: async (): Promise<void> => {
        await axios.post(
            `${API_URL}/read-all`,
            null,
            getAuthHeader()
        );
    },
};