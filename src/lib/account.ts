import { createHash } from 'node:crypto';
import type { PrismaClient } from '@/generated/prisma/client';

export function hashEmail(email: string, salt: string): string {
  return createHash('sha256').update(`${salt}:${email.toLowerCase()}`).digest('hex');
}

export async function exportAccountData(prisma: PrismaClient, userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      createdAt: true,
      consentAt: true,
      consentVersion: true,
    },
  });
  if (!user) return null;

  const campaigns = await prisma.campaign.findMany({
    where: { ownerId: userId },
    include: {
      participants: {
        include: {
          person: true,
          payments: true,
        },
      },
    },
  });

  const memberships = await prisma.campaignMember.findMany({
    where: { userId },
    include: {
      campaign: {
        select: { id: true, name: true, ownerId: true },
      },
    },
  });

  const auditLogs = await prisma.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return {
    exportedAt: new Date().toISOString(),
    schemaVersion: 1,
    user,
    campaigns,
    memberships,
    auditLogs,
  };
}

export async function deleteAccount(
  prisma: PrismaClient,
  userId: string,
  email: string,
  hashSalt: string,
): Promise<void> {
  const emailHash = hashEmail(email, hashSalt);
  await prisma.$transaction([
    prisma.auditLog.updateMany({
      where: { userId },
      data: { actorEmailHash: emailHash },
    }),
    prisma.user.delete({ where: { id: userId } }),
  ]);
}
