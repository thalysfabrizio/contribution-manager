import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { exportAccountData } from '@/lib/account';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const data = await exportAccountData(prisma, session.user.id);
  if (!data) {
    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = JSON.stringify(data, null, 2);
  const filename = `contribution-manager-export-${new Date().toISOString().slice(0, 10)}.json`;

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
