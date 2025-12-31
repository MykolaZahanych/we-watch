import { apiRequest } from './client.js';
import type { Movie, CreateMovieData, UpdateMovieData } from '../types/movies.js';

export const moviesApi = {
  getAll: async (): Promise<Movie[]> => {
    return apiRequest<Movie[]>('/movies');
  },

  getById: async (id: number): Promise<Movie> => {
    return apiRequest<Movie>(`/movies/${id}`);
  },

  create: async (data: CreateMovieData): Promise<Movie> => {
    return apiRequest<Movie>('/movies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: UpdateMovieData): Promise<Movie> => {
    return apiRequest<Movie>(`/movies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/movies/${id}`, {
      method: 'DELETE',
    });
  },
};

