import { useState, useEffect } from 'react';
import { linkPreviewApi } from '@/api/linkPreview';

const CACHE_KEY = 'movie-image-cache';
const CACHE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CacheEntry {
  url: string | null;
  timestamp: number;
}

// In-memory cache for fast access (synced with localStorage)
const imageUrlCache = new Map<string, string | null>();

function loadCacheFromStorage(): Map<string, string | null> {
  const cache = new Map<string, string | null>();
  
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (!stored) return cache;
    
    const data: Record<string, CacheEntry> = JSON.parse(stored);
    const now = Date.now();
    
    Object.entries(data).forEach(([key, entry]) => {
      if (now - entry.timestamp < CACHE_EXPIRY_MS) {
        cache.set(key, entry.url);
        imageUrlCache.set(key, entry.url);
      }
    });
  } catch (error) {
    console.warn('Failed to load image cache from localStorage:', error);
  }
  
  return cache;
}

function saveCacheToStorage(url: string, imageUrl: string | null) {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    const data: Record<string, CacheEntry> = stored ? JSON.parse(stored) : {};
    
    data[url] = {
      url: imageUrl,
      timestamp: Date.now(),
    };
    
    // Clean up expired entries periodically (keep cache size manageable)
    const now = Date.now();
    Object.keys(data).forEach((key) => {
      if (now - data[key].timestamp >= CACHE_EXPIRY_MS) {
        delete data[key];
      }
    });
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      // Try to clear old entries and retry
      try {
        const stored = localStorage.getItem(CACHE_KEY);
        if (stored) {
          const data: Record<string, CacheEntry> = JSON.parse(stored);
          // Keep only the most recent 100 entries
          const entries = Object.entries(data).sort((a, b) => b[1].timestamp - a[1].timestamp);
          const recent = Object.fromEntries(entries.slice(0, 100));
          localStorage.setItem(CACHE_KEY, JSON.stringify(recent));
          recent[url] = { url: imageUrl, timestamp: Date.now() };
          localStorage.setItem(CACHE_KEY, JSON.stringify(recent));
        }
      } catch {
        console.warn('localStorage quota exceeded, using in-memory cache only');
      }
    }
  }
}

// Initialize cache from localStorage
loadCacheFromStorage();

export function useMovieImage(movieLink: string | null, previewImageUrlFromDb: string | null = null) {
  const [previewImage, setPreviewImage] = useState<string | null>(() => {
    if (!movieLink) return null;
    
    if (previewImageUrlFromDb) {
      return previewImageUrlFromDb;
    }
    
    if (imageUrlCache.has(movieLink)) {
      return imageUrlCache.get(movieLink) ?? null;
    }
    
    return null;
  });
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!movieLink) {
      setPreviewImage(null);
      return;
    }

    if (previewImageUrlFromDb) {
      imageUrlCache.set(movieLink, previewImageUrlFromDb);
      saveCacheToStorage(movieLink, previewImageUrlFromDb);
      setPreviewImage(previewImageUrlFromDb);
      return;
    }

    if (imageUrlCache.has(movieLink)) {
      const cached = imageUrlCache.get(movieLink);
      setPreviewImage(cached ?? null);
      return;
    }

    const fetchPreview = async () => {
      const imageUrl = await linkPreviewApi.getImage(movieLink);
      imageUrlCache.set(movieLink, imageUrl);
      saveCacheToStorage(movieLink, imageUrl);
      setPreviewImage(imageUrl);
    };

    fetchPreview();
  }, [movieLink, previewImageUrlFromDb]);

  return { previewImage, imageError, setImageError };
}

