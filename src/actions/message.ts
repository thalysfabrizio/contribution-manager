'use server';

import { prisma } from '@/lib/prisma';
import { requireCampaignAccess } from '@/lib/permissions';
import { revalidatePath } from 'next/cache';
import { type ActionResult, handlePrismaError, ok } from '@/lib/errors';

export async function confirmMessageSent(
  campaignId: string,
  participantId: string,
  templateType: string,
): Promise<ActionResult<void>> {
  try {
    const { user } = await requireCampaignAccess(campaignId);

    await prisma.auditLog.create({
      data: {
        action: 'MESSAGE_SENT',
        entity: 'Participant',
        entityId: participantId,
        details: { templateType },
        userId: user.id,
        campaignId,
      },
    });
  } catch (e) {
    return handlePrismaError(e, {
      action: 'confirmMessageSent',
      campaignId,
      participantId,
    });
  }

  revalidatePath(`/campaigns/${campaignId}`);
  return ok(undefined);
}
