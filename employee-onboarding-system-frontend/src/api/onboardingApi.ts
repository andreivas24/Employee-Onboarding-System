import axios from 'axios';
import type {
  CreateOnboardingRequest,
  ITProvisioningRequest,
  OnboardingRequest,
  RejectRequest,
  UpdateOnboardingRequest,
  FinanceApprovalRequest,
} from '../types/onboarding';
import type { UserRole } from '../types/auth';

const API_URL = 'http://localhost:8080/api/onboarding';

const roleHeader = (role: UserRole) => ({
  headers: {
    'X-User-Role': role,
    'Content-Type': 'application/json',
  },
});

export const onboardingApi = {
  getAll: async (): Promise<OnboardingRequest[]> => {
    const response = await axios.get<OnboardingRequest[]>(API_URL);
    return response.data;
  },

  getById: async (id: number): Promise<OnboardingRequest> => {
    const response = await axios.get<OnboardingRequest>(`${API_URL}/${id}`);
    return response.data;
  },

  create: async (
    role: UserRole,
    data: CreateOnboardingRequest
  ): Promise<OnboardingRequest> => {
    const response = await axios.post<OnboardingRequest>(
      API_URL,
      data,
      roleHeader(role)
    );
    return response.data;
  },

  update: async (
    role: UserRole,
    id: number,
    data: UpdateOnboardingRequest
  ): Promise<OnboardingRequest> => {
    const response = await axios.put<OnboardingRequest>(
      `${API_URL}/${id}`,
      data,
      roleHeader(role)
    );
    return response.data;
  },

  approve: async (
    role: UserRole,
    id: number,
    data?: ITProvisioningRequest
    ): Promise<OnboardingRequest> => {
    const response = await axios.post<OnboardingRequest>(
        `${API_URL}/${id}/approve`,
        data ?? {},
        roleHeader(role)
    );

    return response.data;
    },

  reject: async (
    role: UserRole,
    id: number,
    data: RejectRequest
  ): Promise<OnboardingRequest> => {
    const response = await axios.post<OnboardingRequest>(
      `${API_URL}/${id}/reject`,
      data,
      roleHeader(role)
    );
    return response.data;
  },

  resubmit: async (
    role: UserRole,
    id: number
  ): Promise<OnboardingRequest> => {
    const response = await axios.post<OnboardingRequest>(
      `${API_URL}/${id}/resubmit`,
      null,
      roleHeader(role)
    );
    return response.data;
  },

  financeApprove: async (
    role: UserRole,
    id: number,
    data: FinanceApprovalRequest
  ): Promise<OnboardingRequest> => {
    const response = await axios.post<OnboardingRequest>(
        `${API_URL}/${id}/finance-approve`,
        data,
        roleHeader(role)
    );

    return response.data;
  },
};