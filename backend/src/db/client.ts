import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { createPrismaAdapter } from './adapter.js';

dotenv.config();

const adapter = createPrismaAdapter();

export const prisma = new PrismaClient({
  adapter: adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  prisma.$connect()
    .then(() => {
      console.log('✅ Prisma Client connected to database');
    })
    .catch((err: Error) => {
      console.error('❌ Prisma Client connection error:', err);
    });
}

