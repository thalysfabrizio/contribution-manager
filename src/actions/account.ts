'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deleteAccount as deleteAccountInDb } from '@/lib/account';
import { checkRateLimit } from '@/lib/rate-limit';
import { env } from '@/lib/env';
import { type ActionResult, handlePrismaError, ok } from '@/lib/errors';

export async function deleteAccount(confirmEmail: string): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.email) {
      throw new Error('Não autorizado');
    }

    const exists = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });
    if (!exists) throw new Error('Não autorizado');

    const limit = await checkRateLimit(`account-delete:${session.user.id}`, 3, 60 * 60_000);
    if (!limit.allowed) {
      throw new Error(
        `Muitas tentativas. Tente novamente em ${Math.ceil(limit.retryAfter / 60)} minutos.`,
      );
    }

    const normalized = confirmEmail.trim().toLowerCase();
    if (normalized !== session.user.email.toLowerCase()) {
      throw new Error('O email de confirmação não corresponde ao email da conta.');
    }

    await deleteAccountInDb(prisma, session.user.id, session.user.email, env.NEXTAUTH_SECRET);
  } catch (e) {
    return handlePrismaError(e, { action: 'deleteAccount' });
  }

  return ok(undefined);
}
