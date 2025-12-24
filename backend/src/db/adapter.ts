import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

export function createPrismaAdapter(): PrismaPg {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  return new PrismaPg(pool);
}
