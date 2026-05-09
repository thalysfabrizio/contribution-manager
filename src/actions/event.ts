'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import {
  requireCampaignAccess,
  requireCampaignOwner,
} from '@/lib/permissions';
import { eventSchema } from '@/lib/validators';
import { type ActionResult, handlePrismaError, ok } from '@/lib/errors';
import { getStr, getOptStr } from '@/lib/form';

export async function createEvent(
  campaignId: string,
  formData: FormData,
): Promise<ActionResult<{ eventId: string }>> {
  let eventId: string;
  try {
    const { user } = await requireCampaignAccess(campaignId);

    const data = eventSchema.parse({
      name: getStr(formData, 'name'),
      description: getOptStr(formData, 'description') ?? undefined,
      eventDate: new Date(getStr(formData, 'eventDate')),
      status: (getOptStr(formData, 'status') ?? 'PLANNED') as
        | 'PLANNED'
        | 'ONGOING'
        | 'FINISHED'
        | 'CANCELED',
    });

    eventId = await prisma.$transaction(async (tx) => {
      const event = await tx.event.create({
        data: {
          campaignId,
          name: data.name,
          description: data.description ?? null,
          eventDate: data.eventDate,
          status: data.status,
        },
      });

      await tx.auditLog.create({
        data: {
          action: 'EVENT_CREATED',
          entity: 'Event',
          entityId: event.id,
          details: { name: data.name, eventDate: data.eventDate.toISOString() },
          userId: user.id,
          campaignId,
        },
      });

      return event.id;
    });
  } catch (e) {
    return handlePrismaError(e, { action: 'createEvent', campaignId });
  }

  revalidatePath(`/campaigns/${campaignId}/eventos`);
  return ok({ eventId });
}

export async function updateEvent(
  eventId: string,
  formData: FormData,
): Promise<ActionResult<void>> {
  let campaignId: string;
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { campaignId: true },
    });
    if (!event) throw new Error('Evento não encontrado');
    campaignId = event.campaignId;

    const { user } = await requireCampaignAccess(campaignId);

    const data = eventSchema.parse({
      name: getStr(formData, 'name'),
      description: getOptStr(formData, 'description') ?? undefined,
      eventDate: new Date(getStr(formData, 'eventDate')),
      status: (getOptStr(formData, 'status') ?? 'PLANNED') as
        | 'PLANNED'
        | 'ONGOING'
        | 'FINISHED'
        | 'CANCELED',
    });

    await prisma.$transaction(async (tx) => {
      await tx.event.update({
        where: { id: eventId },
        data: {
          name: data.name,
          description: data.description ?? null,
          eventDate: data.eventDate,
          status: data.status,
        },
      });

      await tx.auditLog.create({
        data: {
          action: 'EVENT_EDITED',
          entity: 'Event',
          entityId: eventId,
          details: { name: data.name, status: data.status },
          userId: user.id,
          campaignId,
        },
      });
    });
  } catch (e) {
    return handlePrismaError(e, { action: 'updateEvent', eventId });
  }

  revalidatePath(`/campaigns/${campaignId}/eventos`);
  revalidatePath(`/campaigns/${campaignId}/eventos/${eventId}`);
  return ok(undefined);
}

export async function deleteEvent(
  eventId: string,
): Promise<ActionResult<void>> {
  let campaignId: string;
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { campaignId: true, name: true },
    });
    if (!event) throw new Error('Evento não encontrado');
    campaignId = event.campaignId;

    const { user } = await requireCampaignOwner(campaignId);

    await prisma.$transaction(async (tx) => {
      await tx.event.delete({ where: { id: eventId } });
      await tx.auditLog.create({
        data: {
          action: 'EVENT_REMOVED',
          entity: 'Event',
          entityId: eventId,
          details: { name: event.name },
          userId: user.id,
          campaignId,
        },
      });
    });
  } catch (e) {
    return handlePrismaError(e, { action: 'deleteEvent', eventId });
  }

  revalidatePath(`/campaigns/${campaignId}/eventos`);
  return ok(undefined);
}
