import { PrismaClient } from '@/generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import { env } from './env';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const LOCAL_NEON_PROXY_PORT = 4444;

function createPrismaClient(): PrismaClient {
  const url = env.DATABASE_URL;
  const parsed = new URL(url);

  // Dev local: DATABASE_URL aponta pro Postgres TCP (localhost:5432), mas
  // adapter-neon precisa de HTTP. Roteia através do proxy docker em :4444.
  // CLI scripts (seed, migrate, cleanup) usam pg direto e seguem no :5432.
  if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
    const proxyHost = `${parsed.hostname}:${LOCAL_NEON_PROXY_PORT}`;
    neonConfig.fetchEndpoint = `http://${proxyHost}/sql`;
    neonConfig.useSecureWebSocket = false;
    neonConfig.wsProxy = proxyHost;
  }

  return new PrismaClient({
    adapter: new PrismaNeon({ connectionString: url }),
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
