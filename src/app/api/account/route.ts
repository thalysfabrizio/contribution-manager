import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deleteAccount } from '@/lib/account';
import { checkRateLimit } from '@/lib/rate-limit';
import { env } from '@/lib/env';

function jsonError(status: number, error: string, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return jsonError(401, 'Unauthorized');
  }

  const limit = await checkRateLimit(`account-delete:${session.user.id}`, 3, 60 * 60_000);
  if (!limit.allowed) {
    return jsonError(429, 'Too Many Requests', { 'Retry-After': String(limit.retryAfter) });
  }

  let body: { confirmEmail?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return jsonError(400, 'Corpo da requisição inválido');
  }

  const confirmEmail =
    typeof body.confirmEmail === 'string' ? body.confirmEmail.trim().toLowerCase() : null;
  const sessionEmail = session.user.email.toLowerCase();
  if (confirmEmail !== sessionEmail) {
    return jsonError(400, 'O email de confirmação não corresponde ao email da conta.');
  }

  await deleteAccount(prisma, session.user.id, session.user.email, env.NEXTAUTH_SECRET);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
