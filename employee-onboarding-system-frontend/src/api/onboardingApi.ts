import axios from 'axios';
import { getAuthHeader } from './authHeader';
import type {
  CreateOnboardingRequest,
  DashboardStats,
  FinanceApprovalRequest,
  ITProvisioningRequest,
  OnboardingHistory,
  OnboardingRequest,
  RejectRequest,
  UpdateOnboardingRequest,
} from '../types/onboarding';

const API_URL = 'http://localhost:8080/api/onboarding';

export const onboardingApi = {
    getAll: async (): Promise<OnboardingRequest[]> => {
        const response = await axios.get<OnboardingRequest[]>(
            API_URL,
            getAuthHeader()
        );

        return response.data;
    },

    getById: async (id: number): Promise<OnboardingRequest> => {
        const response = await axios.get<OnboardingRequest>(
            `${API_URL}/${id}`,
            getAuthHeader()
        );

        return response.data;
    },

    create: async (
        data: CreateOnboardingRequest
    ): Promise<OnboardingRequest> => {
        const response = await axios.post<OnboardingRequest>(
            API_URL,
            data,
            getAuthHeader()
        );

        return response.data;
    },

    update: async (
        id: number,
        data: UpdateOnboardingRequest
    ): Promise<OnboardingRequest> => {
    const response = await axios.put<OnboardingRequest>(
        `${API_URL}/${id}`,
        data,
        getAuthHeader()
    );

    return response.data;
    },

    approve: async (
        id: number,
        data?: ITProvisioningRequest
    ): Promise<OnboardingRequest> => {
    const response = await axios.post<OnboardingRequest>(
        `${API_URL}/${id}/approve`,
        data ?? {},
        getAuthHeader()
    );

    return response.data;
    },

    reject: async (
        id: number,
        data: RejectRequest
    ): Promise<OnboardingRequest> => {
        const response = await axios.post<OnboardingRequest>(
            `${API_URL}/${id}/reject`,
            data,
            getAuthHeader()
        );

        return response.data;
    },

    resubmit: async (id: number): Promise<OnboardingRequest> => {
        const response = await axios.post<OnboardingRequest>(
            `${API_URL}/${id}/resubmit`,
            null,
            getAuthHeader()
        );

        return response.data;
    },

    financeApprove: async (
        id: number,
        data: FinanceApprovalRequest
        ): Promise<OnboardingRequest> => {
        const response = await axios.post<OnboardingRequest>(
            `${API_URL}/${id}/finance-approve`,
            data,
            getAuthHeader()
        );

        return response.data;
    },

    getHistory: async (id: number): Promise<OnboardingHistory[]> => {
        const response = await axios.get<OnboardingHistory[]>(
            `${API_URL}/${id}/history`,
            getAuthHeader()
        );

        return response.data;
    },

    getStats: async (): Promise<DashboardStats> => {
        const response = await axios.get<DashboardStats>(
            `${API_URL}/stats`,
            getAuthHeader()
        );

        return response.data;
    },

    deleteRequest: async (id: number): Promise<void> => {
        await axios.delete(
            `${API_URL}/${id}`,
            getAuthHeader()
        );
    },

    exportExcel: async (): Promise<void> => {
        const response = await axios.get(
            'http://localhost:8080/api/onboarding/export/excel',
            {
                ...getAuthHeader(),
                responseType: 'blob',
            }
        );

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');

        link.href = url;
        link.setAttribute('download', 'onboarding_requests.xlsx');
        document.body.appendChild(link);
        link.click();

        link.remove();
        window.URL.revokeObjectURL(url);
    },
};