import { prisma } from '@/lib/prisma';
import pkg from '../../../../package.json' with { type: 'json' };

export const dynamic = 'force-dynamic';

export async function GET() {
  const startedAt = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json(
      {
        status: 'ok',
        db: 'up',
        uptime: process.uptime(),
        version: pkg.version,
        checkedAt: new Date().toISOString(),
        latencyMs: Date.now() - startedAt,
      },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return Response.json(
      {
        status: 'error',
        db: 'down',
        uptime: process.uptime(),
        version: pkg.version,
        checkedAt: new Date().toISOString(),
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
