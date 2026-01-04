import type { MovieStatus } from '@/types';
import { MovieStatusValues } from '@/types';

export const STATUS_LABELS: Record<MovieStatus, string> = {
  [MovieStatusValues.NEED_TO_WATCH]: 'Need to Watch',
  [MovieStatusValues.COMPLETED]: 'Already Watched',
  [MovieStatusValues.REJECTED]: 'Rejected',
};

export const STATUS_COLORS: Record<MovieStatus, string> = {
  [MovieStatusValues.NEED_TO_WATCH]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [MovieStatusValues.COMPLETED]: 'bg-green-100 text-green-800 border-green-200',
  [MovieStatusValues.REJECTED]: 'bg-red-100 text-red-800 border-red-200',
};

export const getLinkPreview = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
};

