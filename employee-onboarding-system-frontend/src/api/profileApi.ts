import axios from 'axios';
import type { UserProfile, UpdateProfileRequest } from '../types/profile';

const API_URL = 'http://localhost:8080/api/profile';

const emailHeader = (email: string) => ({
    headers: {
        'X-User-Email': email,
    },
});

export const profileApi = {
    getProfile: async (email: string): Promise<UserProfile> => {
        const response = await axios.get<UserProfile>(API_URL, emailHeader(email));
        return response.data;
    },

    updateProfile: async (
        email: string,
        data: UpdateProfileRequest
        ): Promise<UserProfile> => {
            const response = await axios.put<UserProfile>(
                API_URL,
                data,
                emailHeader(email)
            );

        return response.data;
    },

  updateAvatar: async (
    email: string,
    file: File
    ): Promise<UserProfile> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post<UserProfile>(
            `${API_URL}/avatar`,
            formData,
            {
                headers: {
                    'X-User-Email': email,
                },
            }
        );

        return response.data;
    },
};