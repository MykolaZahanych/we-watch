import { apiRequest } from './client.js';

export interface LinkPreviewResponse {
  image: string | null;
}

export const linkPreviewApi = {
  getImage: async (url: string): Promise<string | null> => {
    try {
      const response = await apiRequest<LinkPreviewResponse>(`/link-preview?url=${encodeURIComponent(url)}`);
      return response.image || null;
    } catch {
      return null;
    }
  },
};
