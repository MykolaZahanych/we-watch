import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import authRouter from '@routes/auth.js';
import moviesRouter from '@routes/movies.js';
import linkPreviewRouter from '@routes/linkPreview.js';
import profileRouter from '@routes/profile.js';
import { validateEnv } from '@utils/env.js';

dotenv.config();

// Validate all required environment variables at startup
validateEnv();

const app = express();
const PORT = parseInt(process.env.PORT || '5001', 10);

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(generalLimiter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'We Watch API is running' });
});

app.use('/api/auth', authLimiter, authRouter);
app.use('/api/movies', moviesRouter);
app.use('/api/link-preview', linkPreviewRouter);
app.use('/api/profile', profileRouter);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

