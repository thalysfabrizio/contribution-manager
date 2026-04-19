'use server';

import { prisma } from '@/lib/prisma';
import { requireCampaignOwner } from '@/lib/permissions';
import { emailSchema } from '@/lib/validators';
import { revalidatePath } from 'next/cache';

export async function inviteMember(campaignId: string, email: string) {
  const { user } = await requireCampaignOwner(campaignId);

  const normalizedEmail = emailSchema.parse(email);

  const method = await prisma.$transaction(async (tx) => {
    const existingUser = await tx.user.findUnique({ where: { email: normalizedEmail } });

    if (existingUser) {
      const existingMember = await tx.campaignMember.findUnique({
        where: {
          userId_campaignId: {
            userId: existingUser.id,
            campaignId,
          },
        },
      });

      if (existingMember) {
        throw new Error('Esta pessoa já é membro desta campanha');
      }

      await tx.campaignMember.create({
        data: {
          userId: existingUser.id,
          campaignId,
          role: 'MEMBER',
        },
      });

      await tx.auditLog.create({
        data: {
          action: 'MEMBER_INVITED',
          entity: 'CampaignMember',
          details: { email: normalizedEmail, method: 'direct' },
          userId: user.id,
          campaignId,
        },
      });

      return 'direct' as const;
    }

    const invitedUser = await tx.user.create({
      data: { email: normalizedEmail },
    });

    await tx.campaignMember.create({
      data: {
        userId: invitedUser.id,
        campaignId,
        role: 'MEMBER',
      },
    });

    await tx.auditLog.create({
      data: {
        action: 'MEMBER_INVITED',
        entity: 'CampaignMember',
        details: { email: normalizedEmail, method: 'invite' },
        userId: user.id,
        campaignId,
      },
    });

    return 'invite' as const;
  });

  revalidatePath(`/campaigns/${campaignId}/settings`);
  return { method };
}

export async function removeMember(campaignId: string, memberId: string) {
  const { user } = await requireCampaignOwner(campaignId);

  const member = await prisma.campaignMember.findUnique({
    where: { id: memberId },
    include: { user: true },
  });

  if (!member) throw new Error('Membro não encontrado');
  if (member.role === 'OWNER') throw new Error('Não é possível remover o proprietário');

  await prisma.campaignMember.delete({ where: { id: memberId } });

  await prisma.auditLog.create({
    data: {
      action: 'MEMBER_REMOVED',
      entity: 'CampaignMember',
      entityId: memberId,
      details: { email: member.user.email },
      userId: user.id,
      campaignId,
    },
  });

  revalidatePath(`/campaigns/${campaignId}/settings`);
}
