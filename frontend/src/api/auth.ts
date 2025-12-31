import { apiRequest } from './client.js';
import type { RegisterData, LoginData, AuthResponse } from '../types/auth.js';

export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

