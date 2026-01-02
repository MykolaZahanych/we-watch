import { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Movie, MovieStatus } from '@/types';
import { MovieStatusValues } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { moviesApi } from '@/api';
import { linkPreviewApi } from '@/api/linkPreview';

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

export default function MovieCard({ movie, onEdit, onDelete }: MovieCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchPreview = async () => {
      if (!movie.link) return;

      const imageUrl = await linkPreviewApi.getImage(movie.link);
      if (imageUrl) {
        setPreviewImage(imageUrl);
      }
    };

    fetchPreview();
  }, [movie.link]);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: movie.id.toString(),
    data: {
      type: 'movie',
      movie,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

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

  const getLinkPreview = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return null;
    }
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className='cursor-grab active:cursor-grabbing'>
        <CardContent className='p-4 space-y-3'>
          <div className='font-semibold text-base'>{movie.name}</div>

          <div className='flex items-center justify-between'>
            <span className={`px-2 py-1 text-xs font-medium rounded border ${STATUS_COLORS[movie.status]}`}>
              {STATUS_LABELS[movie.status]}
            </span>
            {movie.rating !== null && <span className='text-sm text-muted-foreground'>⭐ {movie.rating}/10</span>}
          </div>

          <a
            href={movie.link}
            target='_blank'
            rel='noopener noreferrer'
            className='block'
            onClick={(e) => e.stopPropagation()}
          >
            {previewImage && !imageError && (
              <div className='mt-2 rounded-md overflow-hidden border bg-muted flex items-center justify-center'>
                <img
                  src={previewImage}
                  alt={movie.name}
                  className='w-full h-auto max-h-52 object-contain'
                  onError={() => setImageError(true)}
                />
              </div>
            )}
            <div className='text-sm text-blue-600 hover:underline mt-2'>🔗 {getLinkPreview(movie.link)}</div>
          </a>

          <p className='text-xs text-muted-foreground'>Added {new Date(movie.createdAt).toLocaleDateString()}</p>

          <div className='flex items-center justify-between pt-2 border-t' onClick={(e) => e.stopPropagation()}>
            <Button
              variant='outline'
              size='sm'
              onClick={(e) => {
                e.stopPropagation();
                onEdit(movie);
              }}
            >
              Edit
            </Button>
            <Button variant='destructive' size='sm' onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
