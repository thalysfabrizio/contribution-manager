'use server';

import { prisma } from '@/lib/prisma';
import { requireCampaignAccess } from '@/lib/permissions';
import { paymentStatusSchema } from '@/lib/validators';
import type { PaymentStatus } from '@/generated/prisma/client';
import { revalidatePath } from 'next/cache';

export async function updatePaymentStatus(
  campaignId: string,
  participantId: string,
  month: Date,
  newStatus: PaymentStatus,
) {
  const { user } = await requireCampaignAccess(campaignId);

  // Verificar que campanha não está encerrada
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { endMonth: true },
  });

  if (campaign && campaign.endMonth < new Date()) {
    throw new Error('Campanha encerrada — somente leitura');
  }

  paymentStatusSchema.parse(newStatus);

  // Buscar status anterior para o audit log
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

  revalidatePath(`/campaigns/${campaignId}`);
}
