import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '@db/client.js';
import { generateToken } from '@utils/jwt.js';
import { sendErrorResponse, HttpStatus } from '@utils/response.js';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, repeatPassword, nickname } = req.body;

    if (!email || !password || !repeatPassword || !nickname) {
      return sendErrorResponse(res, HttpStatus.BAD_REQUEST, 'All fields are required');
    }

    if (password !== repeatPassword) {
      return sendErrorResponse(res, HttpStatus.BAD_REQUEST, 'Passwords do not match');
    }

    // Password validation: at least 8 characters, one number, one special character
    const hasMinLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (!hasMinLength || !hasNumber || !hasSpecialChar) {
      return sendErrorResponse(res, HttpStatus.BAD_REQUEST,
        'Password must be at least 8 characters long, contain at least one number, and contain at least one special character');
    }

    // Email validation (basic)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendErrorResponse(res, HttpStatus.BAD_REQUEST, 'Invalid email format');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return sendErrorResponse(res, HttpStatus.BAD_REQUEST, 'User with this email already exists');
    }

    // Hash password
    const saltRounds = 16;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user with profile (profile is required for the app to work)
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        nickname,
        profile: {
          create: {
            members: [nickname], // Default member is the user's nickname
            additionalInfo: null,
          },
        },
      },
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      nickname: user.nickname,
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return sendErrorResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to register user');
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendErrorResponse(res, HttpStatus.BAD_REQUEST, 'Email and password are required');
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return sendErrorResponse(res, HttpStatus.UNAUTHORIZED, 'Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return sendErrorResponse(res, HttpStatus.UNAUTHORIZED, 'Invalid email or password');
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      nickname: user.nickname,
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return sendErrorResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to login');
  }
});

export default router;
