import { apiRequest } from './client.js';

export interface LinkPreviewResponse {
  image: string | null;
}

const imageCache = new Map<string, string | null>();

export const linkPreviewApi = {
  getImage: async (url: string): Promise<string | null> => {
    if (imageCache.has(url)) {
      return imageCache.get(url) ?? null;
    }

    try {
      const response = await apiRequest<LinkPreviewResponse>(`/link-preview?url=${encodeURIComponent(url)}`);
      const imageUrl = response.image || null;
      imageCache.set(url, imageUrl);
      return imageUrl;
    } catch {
      // Cache null to avoid retrying failed requests
      imageCache.set(url, null);
      return null;
    }
  },
};
