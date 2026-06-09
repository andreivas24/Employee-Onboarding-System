import axios from 'axios';
import type { UserProfile, UpdateProfileRequest } from '../types/profile';
import { getAuthHeader } from './authHeader';

const API_URL = 'http://localhost:8080/api/profile';

export const profileApi = {
    getProfile: async (): Promise<UserProfile> => {
        const response = await axios.get<UserProfile>(
            API_URL,
            getAuthHeader()
        );

        return response.data;
    },

    updateProfile: async (
        data: UpdateProfileRequest
    ): Promise<UserProfile> => {
        const response = await axios.put<UserProfile>(
            API_URL,
            data,
            getAuthHeader()
        );

        return response.data;
    },

    updateAvatar: async (
        file: File
    ): Promise<UserProfile> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post<UserProfile>(
            `${API_URL}/avatar`,
            formData,
            getAuthHeader()
        );

        return response.data;
    },
};