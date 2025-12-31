import { Router, Request, Response } from 'express';
import { prisma } from '@db/client.js';
import { authenticateToken } from '@middleware/auth.js';
import { VALID_MOVIE_STATUSES, isValidMovieStatus } from '@constants/movies.js';
import { sendErrorResponse, HttpStatus } from '@utils/response.js';

const router = Router();

router.use(authenticateToken);

router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const movies = await prisma.movie.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(movies);
  } catch (error) {
    console.error('Error fetching movies:', error);
    return sendErrorResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch movies');
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const movieId = parseInt(req.params.id);

    if (isNaN(movieId)) {
      return sendErrorResponse(res, HttpStatus.BAD_REQUEST, 'Invalid movie ID');
    }

    const movie = await prisma.movie.findFirst({
      where: {
        id: movieId,
        userId,
      },
    });

    if (!movie) {
      return sendErrorResponse(res, HttpStatus.NOT_FOUND, 'Movie not found');
    }

    res.json(movie);
  } catch (error) {
    console.error('Error fetching movie:', error);
    return sendErrorResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch movie');
  }
});

// Create a new movie
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { name, link, comments, rating, status } = req.body;

    if (!name || name.trim() === '') {
      return sendErrorResponse(res, HttpStatus.BAD_REQUEST, 'Movie name is required');
    }

    if (!link || link.trim() === '') {
      return sendErrorResponse(res, HttpStatus.BAD_REQUEST, 'Movie link is required');
    }

    if (rating !== undefined && rating !== null) {
      const ratingNum = parseInt(rating);
      if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 10) {
        return sendErrorResponse(res, HttpStatus.BAD_REQUEST, 'Rating must be a number between 0 and 10');
      }
    }

    if (!status || !isValidMovieStatus(status)) {
      return sendErrorResponse(res, HttpStatus.BAD_REQUEST, 
        `Status is required and must be one of: ${VALID_MOVIE_STATUSES.join(', ')}`);
    }

    const movie = await prisma.movie.create({
      data: {
        name: name.trim(),
        link: link.trim(),
        comments: comments?.trim() || null,
        rating: rating !== undefined && rating !== null ? parseInt(rating) : null,
        status,
        userId,
      },
    });

    res.status(201).json(movie);
  } catch (error) {
    console.error('Error creating movie:', error);
    return sendErrorResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to create movie');
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const movieId = parseInt(req.params.id);
    const { name, link, comments, rating, status } = req.body;

    if (isNaN(movieId)) {
      return sendErrorResponse(res, HttpStatus.BAD_REQUEST, 'Invalid movie ID');
    }

    const existingMovie = await prisma.movie.findFirst({
      where: {
        id: movieId,
        userId,
      },
    });

    if (!existingMovie) {
      return sendErrorResponse(res, HttpStatus.NOT_FOUND, 'Movie not found');
    }

    // Validate rating if provided
    if (rating !== undefined && rating !== null) {
      const ratingNum = parseInt(rating);
      if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 10) {
        return sendErrorResponse(res, HttpStatus.BAD_REQUEST, 'Rating must be a number between 0 and 10');
      }
    }

    // Validate status if provided
    if (status !== undefined && status !== null && !isValidMovieStatus(status)) {
      return sendErrorResponse(res, HttpStatus.BAD_REQUEST, 
        `Invalid status. Must be one of: ${VALID_MOVIE_STATUSES.join(', ')}`);
    }

    const movie = await prisma.movie.update({
      where: { id: movieId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(link !== undefined && { link: link.trim() }),
        ...(comments !== undefined && { comments: comments?.trim() || null }),
        ...(rating !== undefined && { rating: rating !== null ? parseInt(rating) : null }),
        ...(status !== undefined && status !== null && { status }),
      },
    });

    res.json(movie);
  } catch (error) {
    console.error('Error updating movie:', error);
    return sendErrorResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to update movie');
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const movieId = parseInt(req.params.id);

    if (isNaN(movieId)) {
      return sendErrorResponse(res, HttpStatus.BAD_REQUEST, 'Invalid movie ID');
    }

    const existingMovie = await prisma.movie.findFirst({
      where: {
        id: movieId,
        userId,
      },
    });

    if (!existingMovie) {
      return sendErrorResponse(res, HttpStatus.NOT_FOUND, 'Movie not found');
    }

    await prisma.movie.delete({
      where: { id: movieId },
    });

    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    console.error('Error deleting movie:', error);
    return sendErrorResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete movie');
  }
});

export default router;
