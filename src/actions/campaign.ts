'use server';

import { prisma } from '@/lib/prisma';
import { getSessionUser, requireCampaignOwner } from '@/lib/permissions';
import { brandingSchema, campaignSchema, templatesSchema } from '@/lib/validators';
import { CampaignRole } from '@/generated/prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { type ActionResult, handlePrismaError, ok } from '@/lib/errors';

export async function createCampaign(formData: FormData): Promise<ActionResult<never>> {
  let campaignId: string;
  try {
    const user = await getSessionUser();

    const data = campaignSchema.parse({
      name: formData.get('name') as string,
      description: (formData.get('description') as string) || undefined,
      pixKey: formData.get('pixKey') as string,
      monthlyValue: Math.round(parseFloat(formData.get('monthlyValue') as string) * 100),
      startMonth: new Date(formData.get('startMonth') as string),
      endMonth: new Date(formData.get('endMonth') as string),
      paymentDayStart: parseInt(formData.get('paymentDayStart') as string),
      paymentDayEnd: parseInt(formData.get('paymentDayEnd') as string),
    });

    const hasBranding =
      formData.has('orgName') ||
      formData.has('logoUrl') ||
      formData.has('bannerUrl') ||
      formData.has('accentColor') ||
      formData.has('messageSignature');

    const branding = hasBranding
      ? brandingSchema.parse({
          orgName: (formData.get('orgName') as string) || null,
          logoUrl: (formData.get('logoUrl') as string) || null,
          bannerUrl: (formData.get('bannerUrl') as string) || null,
          accentColor: (formData.get('accentColor') as string) || null,
          messageSignature: (formData.get('messageSignature') as string) || null,
        })
      : null;

    const templatesRaw = formData.get('templates') as string | null;
    const templates = templatesRaw ? templatesSchema.parse(JSON.parse(templatesRaw)) : null;

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
      name: formData.get('name') as string,
      description: (formData.get('description') as string) || undefined,
      pixKey: formData.get('pixKey') as string,
      monthlyValue: Math.round(parseFloat(formData.get('monthlyValue') as string) * 100),
      startMonth: new Date(formData.get('startMonth') as string),
      endMonth: new Date(formData.get('endMonth') as string),
      paymentDayStart: parseInt(formData.get('paymentDayStart') as string),
      paymentDayEnd: parseInt(formData.get('paymentDayEnd') as string),
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
      orgName: (formData.get('orgName') as string) || null,
      logoUrl: (formData.get('logoUrl') as string) || null,
      bannerUrl: (formData.get('bannerUrl') as string) || null,
      accentColor: (formData.get('accentColor') as string) || null,
      messageSignature: (formData.get('messageSignature') as string) || null,
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
