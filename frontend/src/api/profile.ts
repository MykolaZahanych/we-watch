import { apiRequest } from './client.js';
import type { Profile, UpdateProfileData } from '../types/profile.js';

export const profileApi = {
  get: async (): Promise<Profile> => {
    return apiRequest<Profile>('/profile');
  },

  update: async (data: UpdateProfileData): Promise<Profile> => {
    return apiRequest<Profile>('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

