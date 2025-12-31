import { useState, useEffect } from 'react';
import { moviesApi } from '@/api';
import type { Movie, MovieStatus, CreateMovieData, UpdateMovieData } from '@/types';
import { MovieStatusValues } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MovieForm from './MovieForm';

const STATUS_LABELS: Record<MovieStatus, string> = {
  [MovieStatusValues.NEED_TO_WATCH]: 'Need to Watch',
  [MovieStatusValues.COMPLETED]: 'Already Watched',
  [MovieStatusValues.REJECTED]: 'Rejected',
};

const STATUS_COLORS: Record<MovieStatus, string> = {
  [MovieStatusValues.NEED_TO_WATCH]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [MovieStatusValues.COMPLETED]: 'bg-green-100 text-green-800 border-green-200',
  [MovieStatusValues.REJECTED]: 'bg-red-100 text-red-800 border-red-200',
};

interface MovieCardProps {
  movie: Movie;
  onEdit: (movie: Movie) => void;
  onDelete: (id: number) => void;
}

function MovieCard({ movie, onEdit, onDelete }: MovieCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this movie?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await moviesApi.delete(movie.id);
      onDelete(movie.id);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete movie');
    } finally {
      setIsDeleting(false);
    }
  };

  // Try to extract preview from link (basic implementation)
  const getLinkPreview = (url: string) => {
    try {
      const urlObj = new URL(url);
      // For now, just return the domain. In a real app, you might use oEmbed or similar
      return urlObj.hostname;
    } catch {
      return null;
    }
  };

  const linkPreview = getLinkPreview(movie.link);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl">{movie.name}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`px-2 py-1 text-xs font-medium rounded border ${STATUS_COLORS[movie.status]}`}
              >
                {STATUS_LABELS[movie.status]}
              </span>
              {movie.rating !== null && (
                <span className="text-sm text-muted-foreground">
                  ⭐ {movie.rating}/10
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(movie)}>
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3">
          <a
            href={movie.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline"
          >
            {linkPreview ? `🔗 ${linkPreview}` : '🔗 View Link'}
          </a>
        </div>
        {movie.comments && (
          <div className="mb-3">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {movie.comments}
            </p>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Added {new Date(movie.createdAt).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}

export default function MovieList() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | undefined>(undefined);

  const loadMovies = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await moviesApi.getAll();
      setMovies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load movies');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMovies();
  }, []);

  const handleCreate = async (data: CreateMovieData | UpdateMovieData) => {
    await moviesApi.create(data as CreateMovieData);
    setShowForm(false);
    loadMovies();
  };

  const handleUpdate = async (data: CreateMovieData | UpdateMovieData) => {
    if (!editingMovie) return;
    await moviesApi.update(editingMovie.id, data as UpdateMovieData);
    setEditingMovie(undefined);
    loadMovies();
  };

  const handleEdit = (movie: Movie) => {
    setEditingMovie(movie);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setMovies(movies.filter((m) => m.id !== id));
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMovie(undefined);
  };

  const filteredMovies = {
    needToWatch: movies.filter((m) => m.status === MovieStatusValues.NEED_TO_WATCH),
    completed: movies.filter((m) => m.status === MovieStatusValues.COMPLETED),
    rejected: movies.filter((m) => m.status === MovieStatusValues.REJECTED),
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading movies...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">My Movies</h2>
          <p className="text-muted-foreground">Manage your movie watchlist</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>Add Movie</Button>
        )}
      </div>

      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {showForm && (
        <MovieForm
          movie={editingMovie}
          onSubmit={editingMovie ? handleUpdate : handleCreate}
          onCancel={handleCancel}
        />
      )}

      {!showForm && movies.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No movies yet. Add your first movie to get started!
            </p>
          </CardContent>
        </Card>
      )}

      {!showForm && (
        <div className="space-y-6">
          {filteredMovies.needToWatch.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Need to Watch</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredMovies.needToWatch.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredMovies.completed.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Already Watched</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredMovies.completed.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredMovies.rejected.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Rejected</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredMovies.rejected.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

