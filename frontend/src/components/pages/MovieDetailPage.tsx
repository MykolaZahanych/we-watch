import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { moviesApi } from '@/api';
import { linkPreviewApi } from '@/api/linkPreview';
import type { Movie, CreateMovieData, UpdateMovieData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import MovieForm from '@/components/movies/MovieForm';
import Layout from '@/components/layout/Layout';
import { STATUS_LABELS, STATUS_COLORS, getLinkPreview } from '@/utils/movieUtils';

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    const loadMovie = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);
      try {
        const movieId = parseInt(id, 10);
        if (isNaN(movieId)) {
          throw new Error('Invalid movie ID');
        }
        const data = await moviesApi.getById(movieId);
        setMovie(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load movie');
      } finally {
        setIsLoading(false);
      }
    };

    loadMovie();
  }, [id]);

  useEffect(() => {
    const fetchPreview = async () => {
      if (!movie?.link) return;

      const imageUrl = await linkPreviewApi.getImage(movie.link);
      if (imageUrl) {
        setPreviewImage(imageUrl);
      }
    };

    fetchPreview();
  }, [movie?.link]);

  const handleDelete = async () => {
    if (!movie || !confirm('Are you sure you want to delete this movie?')) {
      return;
    }

    try {
      await moviesApi.delete(movie.id);
      navigate('/');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete movie');
    }
  };

  const handleUpdate = async (data: CreateMovieData | UpdateMovieData) => {
    if (!movie) return;

    try {
      await moviesApi.update(movie.id, data as UpdateMovieData);
      setShowEditForm(false);
      const updatedMovie = await moviesApi.getById(movie.id);
      setMovie(updatedMovie);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update movie');
    }
  };

  const handleCancelEdit = () => {
    setShowEditForm(false);
  };

  const handleOverlayClick = () => {
    if (confirm('Are you sure you want to close? Any unsaved changes will be lost.')) {
      handleCancelEdit();
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  if (isLoading) {
    return (
      <Layout onLogout={handleLogout}>
        <div className="flex items-center justify-center p-8">
          <p className="text-muted-foreground">Loading movie...</p>
        </div>
      </Layout>
    );
  }

  if (error || !movie) {
    return (
      <Layout onLogout={handleLogout}>
        <div className="space-y-4">
          <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error || 'Movie not found'}
          </div>
          <Link to="/">
            <Button>Back to Movies</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onLogout={handleLogout}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/">
            <Button variant="outline">← Back to Movies</Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowEditForm(true)}>
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>

        {showEditForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleOverlayClick} />
            <div className="relative z-50 w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-background rounded-lg shadow-lg border">
              <MovieForm
                movie={movie}
                onSubmit={handleUpdate}
                onCancel={handleCancelEdit}
              />
            </div>
          </div>
        )}

        {!showEditForm && (
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-4">{movie.name}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <span className={`px-3 py-1 text-sm font-medium rounded border ${STATUS_COLORS[movie.status]}`}>
                    {STATUS_LABELS[movie.status]}
                  </span>
                  {movie.rating !== null && (
                    <span className="text-lg text-muted-foreground">⭐ {movie.rating}/10</span>
                  )}
                </div>
              </div>

              {previewImage && !imageError && (
                <div className="rounded-md overflow-hidden border bg-muted flex items-center justify-center">
                  <img
                    src={previewImage}
                    alt={movie.name}
                    className="w-full h-auto max-h-96 object-contain"
                    onError={() => setImageError(true)}
                  />
                </div>
              )}

              <div>
                <h2 className="text-lg font-semibold mb-2">Link</h2>
                <a
                  href={movie.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  🔗 {getLinkPreview(movie.link) || movie.link}
                </a>
              </div>

              {movie.comments && (
                <div>
                  <h2 className="text-lg font-semibold mb-2">Comments</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">{movie.comments}</p>
                </div>
              )}

              <div className="pt-4 border-t text-sm text-muted-foreground">
                <p>Added: {new Date(movie.createdAt).toLocaleString()}</p>
                {movie.updatedAt !== movie.createdAt && (
                  <p>Updated: {new Date(movie.updatedAt).toLocaleString()}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

