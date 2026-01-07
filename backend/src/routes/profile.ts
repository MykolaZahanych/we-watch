import { Router, Request, Response } from 'express';
import { prisma } from '@db/client.js';
import { authenticateToken } from '@middleware/auth.js';
import { sendErrorResponse, HttpStatus } from '@utils/response.js';

const router = Router();

router.use(authenticateToken);

router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    let profile = await prisma.profile.findUnique({
      where: { userId },
    });

    // If profile doesn't exist, create one with default member (user's nickname)
    // This handles existing users who registered before profile was required
    if (!profile) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { nickname: true },
      });

      if (!user) {
        return sendErrorResponse(res, HttpStatus.NOT_FOUND, 'User not found');
      }

      profile = await prisma.profile.create({
        data: {
          userId,
          members: [user.nickname],
          additionalInfo: null,
        },
      });
    }

    res.json(profile);
  } catch (error) {
    return sendErrorResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch profile');
  }
});

router.put('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { additionalInfo, members } = req.body;

    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      return sendErrorResponse(res, HttpStatus.NOT_FOUND, 'Profile not found');
    }

    let trimmedMembers: string[] | undefined;
    if (members !== undefined) {
      if (!Array.isArray(members) || members.length === 0 || !members.every((member: any) => typeof member === 'string' && member.trim().length > 0)) {
        return sendErrorResponse(res, HttpStatus.BAD_REQUEST, 'Members array is required and must contain at least one non-empty string member');
      }

      trimmedMembers = members.map((member: string) => member.trim());
    }

    const profile = await prisma.profile.update({
      where: { userId },
      data: {
        ...(additionalInfo !== undefined && { additionalInfo: additionalInfo?.trim() || null }),
        ...(trimmedMembers !== undefined && { members: trimmedMembers }),
      },
    });

    res.json(profile);
  } catch (error) {
    return sendErrorResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to update profile');
  }
});

export default router;

