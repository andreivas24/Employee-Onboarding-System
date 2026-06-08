import axios from 'axios';
import type { AuthUser, LoginRequest, RegisterRequest } from '../types/auth';

const API_URL = 'http://localhost:8080/api/auth';

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthUser> => {
    const response = await axios.post<AuthUser>(`${API_URL}/login`, data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthUser> => {
    const response = await axios.post<AuthUser>(`${API_URL}/register`, data);
    return response.data;
  },
};