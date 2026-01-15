import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Movie } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { linkPreviewApi } from '@/api/linkPreview';
import { STATUS_LABELS, STATUS_COLORS, getLinkPreview } from '@/utils/movieUtils';

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
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

          <div className='text-sm text-muted-foreground mb-0'>
            Selected by: <span className='font-medium'>{movie.selectedBy}</span>
          </div>

          <div className='flex items-center justify-between'>
            <p className='text-xs text-muted-foreground'>Added {new Date(movie.createdAt).toLocaleDateString()}</p>
            <Link to={`/movies/${movie.id}`} onClick={(e) => e.stopPropagation()}>
              <Button variant='outline' size='sm'>
                More
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
