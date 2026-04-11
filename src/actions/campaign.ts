'use server';

import { prisma } from '@/lib/prisma';
import { getSessionUser, requireCampaignOwner } from '@/lib/permissions';
import { campaignSchema } from '@/lib/validators';
import { CampaignRole } from '@/generated/prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createCampaign(formData: FormData) {
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

  const userId = user.id;
  const campaign = await prisma.campaign.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      pixKey: data.pixKey,
      monthlyValue: data.monthlyValue,
      startMonth: data.startMonth,
      endMonth: data.endMonth,
      paymentDayStart: data.paymentDayStart,
      paymentDayEnd: data.paymentDayEnd,
      owner: { connect: { id: userId } },
    },
  });

  // Owner também é CampaignMember
  await prisma.campaignMember.create({
    data: {
      userId: user.id,
      campaignId: campaign.id,
      role: CampaignRole.OWNER,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'CAMPAIGN_CREATED',
      entity: 'Campaign',
      entityId: campaign.id,
      details: { name: campaign.name },
      userId: user.id,
      campaignId: campaign.id,
    },
  });

  redirect(`/campaigns/${campaign.id}`);
}

export async function updateCampaign(campaignId: string, formData: FormData) {
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

  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath('/campaigns');
}

export async function updateTemplates(campaignId: string, templates: Record<string, string>) {
  await requireCampaignOwner(campaignId);

  await prisma.campaign.update({
    where: { id: campaignId },
    data: { templates },
  });

  revalidatePath(`/campaigns/${campaignId}/settings`);
}

export async function updateBranding(campaignId: string, formData: FormData) {
  const { user } = await requireCampaignOwner(campaignId);

  const orgName = (formData.get('orgName') as string) || null;
  const logoUrl = (formData.get('logoUrl') as string) || null;
  const bannerUrl = (formData.get('bannerUrl') as string) || null;
  const accentColor = (formData.get('accentColor') as string) || null;
  const messageSignature = (formData.get('messageSignature') as string) || null;

  await prisma.campaign.update({
    where: { id: campaignId },
    data: { orgName, logoUrl, bannerUrl, accentColor, messageSignature },
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

  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath(`/campaigns/${campaignId}/settings`);
  revalidatePath('/campaigns');
}

export async function deleteCampaign(campaignId: string) {
  await requireCampaignOwner(campaignId);

  await prisma.campaign.delete({ where: { id: campaignId } });

  redirect('/campaigns');
}
