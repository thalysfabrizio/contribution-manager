import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from './env';
import { logger } from './logger';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const SLOW_QUERY_MS = 100;

function createPrismaClient() {
  const adapter = new PrismaPg(env.DATABASE_URL);
  const client = new PrismaClient({
    adapter,
    log: [{ level: 'query', emit: 'event' }],
  });
  client.$on('query', (e) => {
    if (e.duration >= SLOW_QUERY_MS) {
      logger.warn('Slow Prisma query', { duration: e.duration, query: e.query });
    }
  });
  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
