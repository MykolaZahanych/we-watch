import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Movie, MovieStatus } from '@/types';
import MovieCard from './MovieCard';
import { STATUS_LABELS } from '@/utils/movieUtils';

interface StatusColumnProps {
  status: MovieStatus;
  movies: Movie[];
}

export default function StatusColumn({ status, movies }: StatusColumnProps) {
  const movieIds = movies.map((m) => m.id.toString());
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div className='flex flex-col h-full bg-white rounded-lg border border-border shadow-sm p-4'>
      <div className='mb-4 pb-4 border-b'>
        <h3 className='text-xl font-semibold'>{STATUS_LABELS[status]}</h3>
        <p className='text-sm text-muted-foreground'>
          {movies.length} movie{movies.length !== 1 ? 's' : ''}
        </p>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[200px] rounded-lg border-2 border-dashed p-2 transition-colors ${
          isOver ? 'border-primary bg-primary/10' : 'border-muted bg-muted/20'
        }`}
      >
        <SortableContext items={movieIds} strategy={verticalListSortingStrategy}>
          <div className='space-y-3'>
            {movies.length === 0 ? (
              <div className='text-center text-muted-foreground text-sm py-8'>Drop movies here</div>
            ) : (
              movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
