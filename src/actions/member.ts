'use server';

import { prisma } from '@/lib/prisma';
import { requireCampaignOwner } from '@/lib/permissions';
import { emailSchema } from '@/lib/validators';
import { revalidatePath } from 'next/cache';
import { type ActionResult, handlePrismaError, ok } from '@/lib/errors';

type InviteMethod = 'direct' | 'invite';

export async function inviteMember(
  campaignId: string,
  email: string,
): Promise<ActionResult<{ method: InviteMethod }>> {
  let method: InviteMethod;
  try {
    const { user } = await requireCampaignOwner(campaignId);
    const normalizedEmail = emailSchema.parse(email);

    method = await prisma.$transaction(async (tx) => {
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
  } catch (e) {
    return handlePrismaError(e, { action: 'inviteMember', campaignId });
  }

  revalidatePath(`/campaigns/${campaignId}/settings`);
  return ok({ method });
}

export async function removeMember(
  campaignId: string,
  memberId: string,
): Promise<ActionResult<void>> {
  try {
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
  } catch (e) {
    return handlePrismaError(e, { action: 'removeMember', campaignId, memberId });
  }

  revalidatePath(`/campaigns/${campaignId}/settings`);
  return ok(undefined);
}
