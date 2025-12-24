import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from '@routes/auth.js';
import { validateEnv } from '@utils/env.js';

dotenv.config();

// Validate all required environment variables at startup
validateEnv();

const app = express();
const PORT = parseInt(process.env.PORT!, 10);

// Middleware
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'We Watch API is running' });
});

app.use('/api/auth', authRouter);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

