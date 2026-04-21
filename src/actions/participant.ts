'use server';

import { prisma } from '@/lib/prisma';
import { requireCampaignAccess } from '@/lib/permissions';
import { participantSchema } from '@/lib/validators';
import { revalidatePath } from 'next/cache';
import { type ActionResult, handlePrismaError, ok } from '@/lib/errors';

export async function addParticipant(
  campaignId: string,
  formData: FormData,
): Promise<ActionResult<{ participantId: string }>> {
  let participantId: string;
  try {
    const { user } = await requireCampaignAccess(campaignId);

    const data = participantSchema.parse({
      name: (formData.get('name') as string).trim(),
      phone: (formData.get('phone') as string).trim().replace(/\D/g, ''),
    });

    participantId = await prisma.$transaction(async (tx) => {
      let person = await tx.person.findUnique({ where: { phone: data.phone } });

      if (!person) {
        person = await tx.person.create({
          data: { name: data.name, phone: data.phone },
        });
      }

      const existing = await tx.participant.findUnique({
        where: {
          personId_campaignId: {
            personId: person.id,
            campaignId,
          },
        },
      });

      if (existing) {
        throw new Error('Esta pessoa já participa desta campanha');
      }

      const participant = await tx.participant.create({
        data: {
          personId: person.id,
          campaignId,
        },
      });

      await tx.auditLog.create({
        data: {
          action: 'PARTICIPANT_ADDED',
          entity: 'Participant',
          entityId: participant.id,
          details: { name: person.name, phone: person.phone },
          userId: user.id,
          campaignId,
        },
      });

      return participant.id;
    });
  } catch (e) {
    return handlePrismaError(e, { action: 'addParticipant', campaignId });
  }

  revalidatePath(`/campaigns/${campaignId}`);
  return ok({ participantId });
}

export async function editParticipant(
  campaignId: string,
  participantId: string,
  formData: FormData,
): Promise<ActionResult<void>> {
  try {
    const { user } = await requireCampaignAccess(campaignId);

    const data = participantSchema.parse({
      name: (formData.get('name') as string).trim(),
      phone: (formData.get('phone') as string).trim().replace(/\D/g, ''),
    });

    const participant = await prisma.participant.findFirst({
      where: { id: participantId, campaignId },
      select: { personId: true },
    });

    if (!participant) throw new Error('Participante não encontrado');

    await prisma.person.update({
      where: { id: participant.personId },
      data: { name: data.name, phone: data.phone },
    });

    await prisma.auditLog.create({
      data: {
        action: 'PARTICIPANT_EDITED',
        entity: 'Participant',
        entityId: participantId,
        details: { name: data.name, phone: data.phone },
        userId: user.id,
        campaignId,
      },
    });
  } catch (e) {
    return handlePrismaError(e, { action: 'editParticipant', campaignId, participantId });
  }

  revalidatePath(`/campaigns/${campaignId}`);
  return ok(undefined);
}

export async function removeParticipant(
  campaignId: string,
  participantId: string,
): Promise<ActionResult<void>> {
  try {
    const { user } = await requireCampaignAccess(campaignId);

    const participant = await prisma.participant.findFirst({
      where: { id: participantId, campaignId },
      include: { person: true },
    });

    if (!participant) throw new Error('Participante não encontrado');

    await prisma.participant.delete({ where: { id: participantId } });

    await prisma.auditLog.create({
      data: {
        action: 'PARTICIPANT_REMOVED',
        entity: 'Participant',
        entityId: participantId,
        details: { name: participant.person.name },
        userId: user.id,
        campaignId,
      },
    });
  } catch (e) {
    return handlePrismaError(e, { action: 'removeParticipant', campaignId, participantId });
  }

  revalidatePath(`/campaigns/${campaignId}`);
  return ok(undefined);
}

export async function searchPersonByPhone(
  campaignId: string,
  phone: string,
): Promise<ActionResult<{ name: string; phone: string } | null>> {
  try {
    const { user } = await requireCampaignAccess(campaignId);

    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) return ok(null);

    const person = await prisma.person.findFirst({
      where: {
        phone: cleaned,
        participants: {
          some: { campaign: { members: { some: { userId: user.id } } } },
        },
      },
      select: { name: true, phone: true },
    });

    return ok(person);
  } catch (e) {
    return handlePrismaError(e, { action: 'searchPersonByPhone', campaignId });
  }
}
