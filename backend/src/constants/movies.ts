import { MovieStatus } from '@prisma/client';

/**
 * Valid movie status values
 * Derived from the MovieStatus enum in schema.prisma
 */
export const VALID_MOVIE_STATUSES = Object.values(MovieStatus) as [MovieStatus, ...MovieStatus[]];

export type { MovieStatus };

export function isValidMovieStatus(status: string): status is MovieStatus {
  return VALID_MOVIE_STATUSES.includes(status as MovieStatus);
}

