import { useState, FormEvent, useEffect } from 'react';
import type { Movie, CreateMovieData, UpdateMovieData, MovieStatus } from '@/types';
import { MovieStatusValues } from '@/types';
import { profileApi } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface MovieFormProps {
  movie?: Movie;
  onSubmit: (data: CreateMovieData | UpdateMovieData) => Promise<void>;
  onCancel: () => void;
}

const STATUS_OPTIONS: { value: MovieStatus; label: string }[] = [
  { value: MovieStatusValues.NEED_TO_WATCH, label: 'Need to Watch' },
  { value: MovieStatusValues.COMPLETED, label: 'Already Watched' },
  { value: MovieStatusValues.REJECTED, label: 'Rejected' },
];

export default function MovieForm({ movie, onSubmit, onCancel }: MovieFormProps) {
  const [name, setName] = useState(movie?.name || '');
  const [link, setLink] = useState(movie?.link || '');
  const [comments, setComments] = useState(movie?.comments || '');
  const [rating, setRating] = useState(movie?.rating?.toString() || '');
  const [status, setStatus] = useState<MovieStatus>(movie?.status || MovieStatusValues.NEED_TO_WATCH);
  const [selectedBy, setSelectedBy] = useState(movie?.selectedBy || '');
  const [members, setMembers] = useState<string[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await profileApi.get();
        setMembers(profile.members);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [movie?.selectedBy]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Movie name is required');
      return;
    }

    if (!link.trim()) {
      setError('Movie link is required');
      return;
    }

    if (!status) {
      setError('Status is required');
      return;
    }

    if (!selectedBy || !selectedBy.trim()) {
      setError('Selected by is required');
      return;
    }

    const ratingNum = rating ? parseInt(rating) : undefined;
    if (rating && (isNaN(ratingNum!) || ratingNum! < 0 || ratingNum! > 10)) {
      setError('Rating must be a number between 0 and 10');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        link: link.trim(),
        comments: comments.trim() || undefined,
        rating: ratingNum,
        status,
        selectedBy: selectedBy.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save movie');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{movie ? 'Edit Movie' : 'Add New Movie'}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {movie ? 'Update movie information' : 'Add a new movie to your watchlist'}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Movie Name *</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter movie name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">Link (External Movie Site) *</Label>
            <Input
              id="link"
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://example.com/movie"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as MovieStatus)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {!isLoadingProfile && members.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="selectedBy">Selected By *</Label>
              <select
                id="selectedBy"
                value={selectedBy}
                onChange={(e) => setSelectedBy(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">-- Select member --</option>
                {members.map((member) => (
                  <option key={member} value={member}>
                    {member}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="rating">Rating (0-10)</Label>
            <Input
              id="rating"
              type="number"
              min="0"
              max="10"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              placeholder="Enter rating (0-10)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">Comments</Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add your comments about this movie..."
              rows={4}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Saving...' : movie ? 'Update Movie' : 'Add Movie'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </form>
    </div>
  );
}

