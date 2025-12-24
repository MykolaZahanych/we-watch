import { defineConfig, env } from 'prisma/config';
import dotenv from 'dotenv';
import { createPrismaAdapter } from './src/db/adapter.js';

dotenv.config();

export default defineConfig({
  datasource: {
    url: env('DATABASE_URL'),
  },
  // @ts-expect-error - Prisma 7 config type definition
  // Known issue: https://github.com/prisma/prisma/issues/26841
  adapter: () => Promise.resolve(createPrismaAdapter()),
});
