import { Router, Request, Response } from 'express';
import { prisma } from '@db/client.js';
import { fetchLinkPreviewImage } from '@utils/linkPreview.js';
import { sendErrorResponse, HttpStatus } from '@utils/response.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      return sendErrorResponse(res, HttpStatus.BAD_REQUEST, 'URL parameter is required');
    }

    try {
      new URL(url);
    } catch {
      return sendErrorResponse(res, HttpStatus.BAD_REQUEST, 'Invalid URL format');
    }

    const movieWithPreview = await prisma.movie.findFirst({
      where: {
        link: url,
        previewImageUrl: { not: null },
      },
      select: {
        previewImageUrl: true,
      },
    });

    if (movieWithPreview?.previewImageUrl) {
      return res.json({ image: movieWithPreview.previewImageUrl });
    }

    const imageUrl = await fetchLinkPreviewImage(url);

    if (!imageUrl) {
      return res.json({ image: null });
    }

    // Optionally update all movies with this link to store the preview image
    // This helps populate the cache for existing movies
    await prisma.movie.updateMany({
      where: {
        link: url,
        previewImageUrl: null,
      },
      data: {
        previewImageUrl: imageUrl,
      },
    });

    res.json({ image: imageUrl });
  } catch (error) {
    return sendErrorResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch link preview');
  }
});

export default router;
