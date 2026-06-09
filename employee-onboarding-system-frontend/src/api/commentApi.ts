import axios from 'axios';
import { getAuthHeader } from './authHeader';
import type { CreateCommentRequest, OnboardingComment } from '../types/comment';

const API_URL = 'http://localhost:8080/api/onboarding';

export const commentApi = {
    getComments: async (requestId: number): Promise<OnboardingComment[]> => {
        const response = await axios.get<OnboardingComment[]>(
            `${API_URL}/${requestId}/comments`,
            getAuthHeader()
        );

        return response.data;
    },

    addComment: async (
        requestId: number,
        data: CreateCommentRequest
    ): Promise<OnboardingComment> => {
        const response = await axios.post<OnboardingComment>(
            `${API_URL}/${requestId}/comments`,
            data,
            getAuthHeader()
        );

        return response.data;
    },
};