import { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { moviesApi } from '@/api';
import type { Movie, MovieStatus, CreateMovieData, UpdateMovieData } from '@/types';
import { MovieStatusValues } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import MovieForm from './MovieForm';
import MovieCard from './MovieCard';
import StatusColumn from './StatusColumn';

export default function MovieList() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | undefined>(undefined);
  const [activeMovie, setActiveMovie] = useState<Movie | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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
    setShowForm(false);
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

  const handleOverlayClick = () => {
    if (confirm('Are you sure you want to close? Any unsaved changes will be lost.')) {
      handleCancel();
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const movieId = parseInt(event.active.id as string);
    const movie = movies.find((m) => m.id === movieId);
    setActiveMovie(movie || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveMovie(null);

    if (!over) return;

    const movieId = parseInt(active.id as string);
    const newStatus = over.id as MovieStatus;

    const movie = movies.find((m) => m.id === movieId);
    if (!movie) return;

    if (movie.status === newStatus) return;

    setMovies((prevMovies) => prevMovies.map((m) => (m.id === movieId ? { ...m, status: newStatus } : m)));

    try {
      await moviesApi.update(movieId, { status: newStatus });
    } catch (err) {
      loadMovies();
      alert('Failed to update movie status');
    }
  };

  const filteredMovies = {
    needToWatch: movies.filter((m) => m.status === MovieStatusValues.NEED_TO_WATCH),
    completed: movies.filter((m) => m.status === MovieStatusValues.COMPLETED),
    rejected: movies.filter((m) => m.status === MovieStatusValues.REJECTED),
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <p className='text-muted-foreground'>Loading movies...</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-baseline'>
          <h2 className='text-xl font-bold'>My Movies</h2>
          <p className='text-muted-foreground text-sm ml-0.5'>(manage your movie watchlist)</p>
        </div>
        {!showForm && <Button onClick={() => setShowForm(true)}>Add Movie</Button>}
      </div>

      {error && <div className='p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md'>{error}</div>}

      {showForm && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <div className='fixed inset-0 bg-black/50 backdrop-blur-sm' onClick={handleOverlayClick} />
          <div className='relative z-50 w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-background rounded-lg shadow-lg border'>
            <MovieForm
              movie={editingMovie}
              onSubmit={editingMovie ? handleUpdate : handleCreate}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}

      {!showForm && movies.length === 0 && (
        <Card>
          <CardContent className='pt-6'>
            <p className='text-center text-muted-foreground'>No movies yet. Add your first movie to get started!</p>
          </CardContent>
        </Card>
      )}

      {!showForm && (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <StatusColumn
              status={MovieStatusValues.NEED_TO_WATCH}
              movies={filteredMovies.needToWatch}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            <StatusColumn
              status={MovieStatusValues.COMPLETED}
              movies={filteredMovies.completed}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            <StatusColumn
              status={MovieStatusValues.REJECTED}
              movies={filteredMovies.rejected}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
          <DragOverlay>
            {activeMovie ? (
              <div className='opacity-50'>
                <MovieCard movie={activeMovie} onEdit={handleEdit} onDelete={handleDelete} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
