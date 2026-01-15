export const MovieStatusValues = {
  NEED_TO_WATCH: 'NEED_TO_WATCH',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED',
} as const;

export type MovieStatus = (typeof MovieStatusValues)[keyof typeof MovieStatusValues];

export interface Movie {
  id: number;
  name: string;
  link: string;
  previewImageUrl: string | null;
  comments: string | null;
  rating: number | null;
  status: MovieStatus;
  selectedBy: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMovieData {
  name: string;
  link: string;
  comments?: string;
  rating?: number;
  status: MovieStatus;
  selectedBy: string;
}

export type UpdateMovieData = Partial<CreateMovieData>;
