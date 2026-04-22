import { cache } from 'react';
import { prisma } from './prisma';

export const getUserMemberships = cache(async (userId: string) => {
  return prisma.campaignMember.findMany({
    where: { userId },
    select: {
      role: true,
      campaign: {
        select: {
          id: true,
          name: true,
          description: true,
          orgName: true,
          logoUrl: true,
          accentColor: true,
          startMonth: true,
          endMonth: true,
          monthlyValue: true,
          createdAt: true,
          _count: { select: { participants: true } },
        },
      },
    },
    orderBy: { campaign: { createdAt: 'desc' } },
  });
});

export const campaignDetailSelect = {
  id: true,
  name: true,
  description: true,
  pixKey: true,
  monthlyValue: true,
  startMonth: true,
  endMonth: true,
  paymentDayStart: true,
  paymentDayEnd: true,
  orgName: true,
  bannerUrl: true,
  messageSignature: true,
  participants: {
    select: {
      id: true,
      person: { select: { id: true, name: true, phone: true } },
      payments: {
        select: { id: true, month: true, status: true },
        orderBy: { month: 'asc' as const },
      },
    },
    orderBy: { person: { name: 'asc' as const } },
  },
} as const;

export const getCampaignDetail = cache(async (campaignId: string) => {
  return prisma.campaign.findUnique({
    where: { id: campaignId },
    select: campaignDetailSelect,
  });
});
