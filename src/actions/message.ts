'use server';

import { prisma } from '@/lib/prisma';
import { requireCampaignAccess } from '@/lib/permissions';
import { revalidatePath } from 'next/cache';

export async function confirmMessageSent(
  campaignId: string,
  participantId: string,
  templateType: string,
) {
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

  revalidatePath(`/campaigns/${campaignId}`);
}
