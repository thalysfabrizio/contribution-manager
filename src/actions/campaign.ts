'use server';

import { prisma } from '@/lib/prisma';
import { getSessionUser, requireCampaignOwner } from '@/lib/permissions';
import { brandingSchema, campaignSchema, emailSchema, templatesSchema } from '@/lib/validators';
import { CampaignRole } from '@/generated/prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { type ActionResult, handlePrismaError, ok } from '@/lib/errors';
import { getStr, getOptStr } from '@/lib/form';

export async function createCampaign(formData: FormData): Promise<ActionResult<never>> {
  let campaignId: string;
  try {
    const user = await getSessionUser();

    const data = campaignSchema.parse({
      name: getStr(formData, 'name'),
      description: getOptStr(formData, 'description') ?? undefined,
      pixKey: getStr(formData, 'pixKey'),
      monthlyValue: Math.round(parseFloat(getStr(formData, 'monthlyValue')) * 100),
      startMonth: new Date(getStr(formData, 'startMonth')),
      endMonth: new Date(getStr(formData, 'endMonth')),
      paymentDayStart: parseInt(getStr(formData, 'paymentDayStart')),
      paymentDayEnd: parseInt(getStr(formData, 'paymentDayEnd')),
    });

    const hasBranding =
      formData.has('orgName') ||
      formData.has('logoUrl') ||
      formData.has('bannerUrl') ||
      formData.has('accentColor') ||
      formData.has('messageSignature');

    const branding = hasBranding
      ? brandingSchema.parse({
          orgName: getOptStr(formData, 'orgName'),
          logoUrl: getOptStr(formData, 'logoUrl'),
          bannerUrl: getOptStr(formData, 'bannerUrl'),
          accentColor: getOptStr(formData, 'accentColor'),
          messageSignature: getOptStr(formData, 'messageSignature'),
        })
      : null;

    const templatesRaw = getOptStr(formData, 'templates');
    const templates = templatesRaw ? templatesSchema.parse(JSON.parse(templatesRaw)) : null;

    const leadersRaw = getOptStr(formData, 'leaderEmails');
    const leaderEmails: string[] = leadersRaw
      ? (JSON.parse(leadersRaw) as unknown[]).map((e) => emailSchema.parse(e))
      : [];

    const campaign = await prisma.$transaction(async (tx) => {
      const created = await tx.campaign.create({
        data: {
          name: data.name,
          description: data.description ?? null,
          pixKey: data.pixKey,
          monthlyValue: data.monthlyValue,
          startMonth: data.startMonth,
          endMonth: data.endMonth,
          paymentDayStart: data.paymentDayStart,
          paymentDayEnd: data.paymentDayEnd,
          owner: { connect: { id: user.id } },
          ...(branding ?? {}),
          ...(templates ? { templates } : {}),
        },
      });

      await tx.campaignMember.create({
        data: {
          userId: user.id,
          campaignId: created.id,
          role: CampaignRole.OWNER,
        },
      });

      for (const email of leaderEmails) {
        const existing = await tx.user.findUnique({ where: { email } });
        const leader = existing ?? (await tx.user.create({ data: { email } }));

        // Evita duplicar se o email coincidir com outra membership já criada nesta transação.
        const alreadyMember = await tx.campaignMember.findUnique({
          where: { userId_campaignId: { userId: leader.id, campaignId: created.id } },
        });
        if (alreadyMember) continue;

        await tx.campaignMember.create({
          data: {
            userId: leader.id,
            campaignId: created.id,
            role: CampaignRole.MEMBER,
          },
        });

        await tx.auditLog.create({
          data: {
            action: 'MEMBER_INVITED',
            entity: 'CampaignMember',
            details: { email, method: existing ? 'direct' : 'invite' },
            userId: user.id,
            campaignId: created.id,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          action: 'CAMPAIGN_CREATED',
          entity: 'Campaign',
          entityId: created.id,
          details: { name: created.name },
          userId: user.id,
          campaignId: created.id,
        },
      });

      return created;
    });
    campaignId = campaign.id;
  } catch (e) {
    return handlePrismaError(e, { action: 'createCampaign' });
  }

  redirect(`/campaigns/${campaignId}`);
}

export async function updateCampaign(
  campaignId: string,
  formData: FormData,
): Promise<ActionResult<void>> {
  try {
    const { user } = await requireCampaignOwner(campaignId);

    const data = campaignSchema.parse({
      name: getStr(formData, 'name'),
      description: getOptStr(formData, 'description') ?? undefined,
      pixKey: getStr(formData, 'pixKey'),
      monthlyValue: Math.round(parseFloat(getStr(formData, 'monthlyValue')) * 100),
      startMonth: new Date(getStr(formData, 'startMonth')),
      endMonth: new Date(getStr(formData, 'endMonth')),
      paymentDayStart: parseInt(getStr(formData, 'paymentDayStart')),
      paymentDayEnd: parseInt(getStr(formData, 'paymentDayEnd')),
    });

    await prisma.campaign.update({
      where: { id: campaignId },
      data,
    });

    await prisma.auditLog.create({
      data: {
        action: 'CAMPAIGN_EDITED',
        entity: 'Campaign',
        entityId: campaignId,
        details: { name: data.name },
        userId: user.id,
        campaignId,
      },
    });
  } catch (e) {
    return handlePrismaError(e, { action: 'updateCampaign', campaignId });
  }

  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath('/campaigns');
  return ok(undefined);
}

export async function updateTemplates(
  campaignId: string,
  templates: Record<string, string>,
): Promise<ActionResult<void>> {
  try {
    await requireCampaignOwner(campaignId);

    await prisma.campaign.update({
      where: { id: campaignId },
      data: { templates },
    });
  } catch (e) {
    return handlePrismaError(e, { action: 'updateTemplates', campaignId });
  }

  revalidatePath(`/campaigns/${campaignId}/settings`);
  return ok(undefined);
}

export async function updateBranding(
  campaignId: string,
  formData: FormData,
): Promise<ActionResult<void>> {
  try {
    const { user } = await requireCampaignOwner(campaignId);

    const data = brandingSchema.parse({
      orgName: getOptStr(formData, 'orgName'),
      logoUrl: getOptStr(formData, 'logoUrl'),
      bannerUrl: getOptStr(formData, 'bannerUrl'),
      accentColor: getOptStr(formData, 'accentColor'),
      messageSignature: getOptStr(formData, 'messageSignature'),
    });

    await prisma.campaign.update({
      where: { id: campaignId },
      data,
    });

    await prisma.auditLog.create({
      data: {
        action: 'CAMPAIGN_EDITED',
        entity: 'Campaign',
        entityId: campaignId,
        details: { branding: true },
        userId: user.id,
        campaignId,
      },
    });
  } catch (e) {
    return handlePrismaError(e, { action: 'updateBranding', campaignId });
  }

  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath(`/campaigns/${campaignId}/settings`);
  revalidatePath('/campaigns');
  return ok(undefined);
}

export async function deleteCampaign(campaignId: string): Promise<ActionResult<never>> {
  try {
    await requireCampaignOwner(campaignId);
    await prisma.campaign.delete({ where: { id: campaignId } });
  } catch (e) {
    return handlePrismaError(e, { action: 'deleteCampaign', campaignId });
  }

  redirect('/campaigns');
}
