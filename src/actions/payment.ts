'use server';

import { prisma } from '@/lib/prisma';
import { requireCampaignAccess } from '@/lib/permissions';
import { paymentStatusSchema } from '@/lib/validators';
import type { PaymentStatus } from '@/generated/prisma/client';
import { isCampaignEnded } from '@/lib/months';
import { revalidatePath } from 'next/cache';
import { type ActionResult, handlePrismaError, ok } from '@/lib/errors';

export async function updatePaymentStatus(
  campaignId: string,
  participantId: string,
  month: Date,
  newStatus: PaymentStatus,
): Promise<ActionResult<void>> {
  try {
    const { user } = await requireCampaignAccess(campaignId);

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { endMonth: true },
    });

    if (campaign && isCampaignEnded(campaign.endMonth)) {
      throw new Error('Campanha encerrada — somente leitura');
    }

    paymentStatusSchema.parse(newStatus);

    const participant = await prisma.participant.findFirst({
      where: { id: participantId, campaignId },
      select: { id: true },
    });
    if (!participant) throw new Error('Participante não encontrado');

    const existingPayment = await prisma.payment.findUnique({
      where: { participantId_month: { participantId, month } },
      select: { status: true },
    });
    const previousStatus = existingPayment?.status ?? 'PENDING';

    if (newStatus === 'PENDING') {
      await prisma.payment.deleteMany({
        where: { participantId, month },
      });
    } else {
      await prisma.payment.upsert({
        where: {
          participantId_month: { participantId, month },
        },
        update: {
          status: newStatus,
          paidAt: newStatus === 'PAID_PIX' || newStatus === 'PAID_CASH' ? new Date() : null,
        },
        create: {
          participantId,
          month,
          status: newStatus,
          paidAt: newStatus === 'PAID_PIX' || newStatus === 'PAID_CASH' ? new Date() : null,
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        action: 'PAYMENT_UPDATED',
        entity: 'Payment',
        entityId: participantId,
        details: {
          month: month.toISOString(),
          from: previousStatus,
          to: newStatus,
        },
        userId: user.id,
        campaignId,
      },
    });
  } catch (e) {
    return handlePrismaError(e, {
      action: 'updatePaymentStatus',
      campaignId,
      participantId,
    });
  }

  revalidatePath(`/campaigns/${campaignId}`);
  return ok(undefined);
}
