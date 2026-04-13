import { prisma } from './prisma';

export interface RateLimitResult {
  allowed: boolean;
  retryAfter: number;
  remaining: number;
}

interface RateLimitPrisma {
  rateLimit: {
    findUnique: (args: {
      where: { key: string };
    }) => Promise<{ count: number; windowStart: Date } | null>;
    create: (args: {
      data: { key: string; count: number; windowStart: Date };
    }) => Promise<unknown>;
    update: (args: {
      where: { key: string };
      data:
        | { count: number; windowStart: Date }
        | { count: { increment: number } };
    }) => Promise<unknown>;
    deleteMany: (args: {
      where: { windowStart: { lt: Date } };
    }) => Promise<{ count: number }>;
  };
}

export async function checkRateLimit(
  key: string,
  max: number,
  windowMs: number,
  now: Date = new Date(),
  client: RateLimitPrisma = prisma,
): Promise<RateLimitResult> {
  const windowBoundary = new Date(now.getTime() - windowMs);
  const existing = await client.rateLimit.findUnique({ where: { key } });

  if (!existing) {
    await client.rateLimit.create({
      data: { key, count: 1, windowStart: now },
    });
    return { allowed: true, retryAfter: 0, remaining: max - 1 };
  }

  if (existing.windowStart <= windowBoundary) {
    await client.rateLimit.update({
      where: { key },
      data: { count: 1, windowStart: now },
    });
    return { allowed: true, retryAfter: 0, remaining: max - 1 };
  }

  if (existing.count >= max) {
    const elapsed = now.getTime() - existing.windowStart.getTime();
    const retryAfter = Math.max(1, Math.ceil((windowMs - elapsed) / 1000));
    return { allowed: false, retryAfter, remaining: 0 };
  }

  await client.rateLimit.update({
    where: { key },
    data: { count: { increment: 1 } },
  });
  return { allowed: true, retryAfter: 0, remaining: max - existing.count - 1 };
}

export async function cleanupExpiredRateLimits(
  olderThanMs: number = 24 * 60 * 60 * 1000,
  now: Date = new Date(),
  client: RateLimitPrisma = prisma,
): Promise<number> {
  const cutoff = new Date(now.getTime() - olderThanMs);
  const result = await client.rateLimit.deleteMany({
    where: { windowStart: { lt: cutoff } },
  });
  return result.count;
}
