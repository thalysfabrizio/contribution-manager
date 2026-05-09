'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireCampaignAccess } from '@/lib/permissions';
import { eventTransactionSchema } from '@/lib/validators';
import { type ActionResult, handlePrismaError, ok } from '@/lib/errors';
import { getStr } from '@/lib/form';
import { reaisToCents } from '@/lib/format';

export async function addEventTransaction(
  eventId: string,
  formData: FormData,
): Promise<ActionResult<{ transactionId: string }>> {
  let transactionId: string;
  let campaignId: string;
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { campaignId: true },
    });
    if (!event) throw new Error('Evento não encontrado');
    campaignId = event.campaignId;

    const { user } = await requireCampaignAccess(campaignId);

    const data = eventTransactionSchema.parse({
      kind: getStr(formData, 'kind') as 'EXPENSE' | 'INCOME',
      amount: reaisToCents(getStr(formData, 'amount')),
      description: getStr(formData, 'description'),
      occurredAt: new Date(getStr(formData, 'occurredAt')),
    });

    transactionId = await prisma.$transaction(async (tx) => {
      const created = await tx.eventTransaction.create({
        data: {
          eventId,
          kind: data.kind,
          amount: data.amount,
          description: data.description,
          occurredAt: data.occurredAt,
        },
      });

      await tx.auditLog.create({
        data: {
          action: 'EVENT_TRANSACTION_ADDED',
          entity: 'EventTransaction',
          entityId: created.id,
          details: {
            eventId,
            kind: data.kind,
            amount: data.amount,
            description: data.description,
          },
          userId: user.id,
          campaignId,
        },
      });

      return created.id;
    });
  } catch (e) {
    return handlePrismaError(e, { action: 'addEventTransaction', eventId });
  }

  revalidatePath(`/campaigns/${campaignId}/eventos/${eventId}`);
  revalidatePath(`/campaigns/${campaignId}/relatorio-geral`);
  return ok({ transactionId });
}

export async function removeEventTransaction(
  transactionId: string,
): Promise<ActionResult<void>> {
  let campaignId: string;
  let eventId: string;
  try {
    const tx = await prisma.eventTransaction.findUnique({
      where: { id: transactionId },
      select: {
        eventId: true,
        description: true,
        kind: true,
        amount: true,
        event: { select: { campaignId: true } },
      },
    });
    if (!tx) throw new Error('Lançamento não encontrado');
    campaignId = tx.event.campaignId;
    eventId = tx.eventId;

    const { user } = await requireCampaignAccess(campaignId);

    await prisma.$transaction(async (db) => {
      await db.eventTransaction.delete({ where: { id: transactionId } });
      await db.auditLog.create({
        data: {
          action: 'EVENT_TRANSACTION_REMOVED',
          entity: 'EventTransaction',
          entityId: transactionId,
          details: {
            eventId: tx.eventId,
            kind: tx.kind,
            amount: tx.amount,
            description: tx.description,
          },
          userId: user.id,
          campaignId,
        },
      });
    });
  } catch (e) {
    return handlePrismaError(e, {
      action: 'removeEventTransaction',
      transactionId,
    });
  }

  revalidatePath(`/campaigns/${campaignId}/eventos/${eventId}`);
  revalidatePath(`/campaigns/${campaignId}/relatorio-geral`);
  return ok(undefined);
}
