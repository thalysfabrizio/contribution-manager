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

export const getCampaignEvents = cache(async (campaignId: string) => {
  return prisma.event.findMany({
    where: { campaignId },
    select: {
      id: true,
      name: true,
      description: true,
      eventDate: true,
      status: true,
      transactions: { select: { kind: true, amount: true } },
    },
    orderBy: { eventDate: 'desc' },
  });
});

export const getEventDetail = cache(async (eventId: string) => {
  return prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      name: true,
      description: true,
      eventDate: true,
      status: true,
      campaignId: true,
      transactions: {
        select: {
          id: true,
          kind: true,
          amount: true,
          description: true,
          occurredAt: true,
        },
        orderBy: { occurredAt: 'desc' },
      },
    },
  });
});

export type CampaignFinancialSummary = {
  contributionsReceived: number;
  eventsExpense: number;
  eventsIncome: number;
  eventsNet: number;
  cashBalance: number;
};

export const getCampaignFinancialSummary = cache(
  async (campaignId: string): Promise<CampaignFinancialSummary> => {
    const [campaign, txAgg] = await Promise.all([
      prisma.campaign.findUnique({
        where: { id: campaignId },
        select: {
          monthlyValue: true,
          participants: {
            select: {
              payments: { select: { status: true } },
            },
          },
        },
      }),
      prisma.eventTransaction.groupBy({
        by: ['kind'],
        where: { event: { campaignId } },
        _sum: { amount: true },
      }),
    ]);

    const contributionsReceived = campaign
      ? campaign.participants.reduce((acc, p) => {
          const paid = p.payments.filter(
            (pay) => pay.status === 'PAID_PIX' || pay.status === 'PAID_CASH',
          ).length;
          return acc + paid * campaign.monthlyValue;
        }, 0)
      : 0;

    const eventsExpense =
      txAgg.find((t) => t.kind === 'EXPENSE')?._sum.amount ?? 0;
    const eventsIncome =
      txAgg.find((t) => t.kind === 'INCOME')?._sum.amount ?? 0;
    const eventsNet = eventsIncome - eventsExpense;
    const cashBalance = contributionsReceived + eventsNet;

    return {
      contributionsReceived,
      eventsExpense,
      eventsIncome,
      eventsNet,
      cashBalance,
    };
  },
);

export type TimelineEntry = {
  date: Date;
  source: 'CONTRIBUTION' | 'EVENT_EXPENSE' | 'EVENT_INCOME';
  amount: number;
  label: string;
  reference?: string;
};

export const getCampaignTimeline = cache(
  async (campaignId: string): Promise<TimelineEntry[]> => {
    const [campaign, transactions] = await Promise.all([
      prisma.campaign.findUnique({
        where: { id: campaignId },
        select: {
          monthlyValue: true,
          participants: {
            select: {
              person: { select: { name: true } },
              payments: {
                select: { status: true, paidAt: true, month: true },
                where: { status: { in: ['PAID_PIX', 'PAID_CASH'] } },
              },
            },
          },
        },
      }),
      prisma.eventTransaction.findMany({
        where: { event: { campaignId } },
        select: {
          kind: true,
          amount: true,
          description: true,
          occurredAt: true,
          event: { select: { name: true } },
        },
      }),
    ]);

    const entries: TimelineEntry[] = [];

    if (campaign) {
      for (const participant of campaign.participants) {
        for (const payment of participant.payments) {
          entries.push({
            date: payment.paidAt ?? payment.month,
            source: 'CONTRIBUTION',
            amount: campaign.monthlyValue,
            label: `Contribuição — ${participant.person.name}`,
            reference: payment.status === 'PAID_PIX' ? 'PIX' : 'Dinheiro',
          });
        }
      }
    }

    for (const tx of transactions) {
      entries.push({
        date: tx.occurredAt,
        source: tx.kind === 'EXPENSE' ? 'EVENT_EXPENSE' : 'EVENT_INCOME',
        amount: tx.amount,
        label: tx.description,
        reference: tx.event.name,
      });
    }

    return entries.sort((a, b) => b.date.getTime() - a.date.getTime());
  },
);

export type MonthlyBreakdown = {
  month: Date;
  contributions: number;
  eventsExpense: number;
  eventsIncome: number;
  eventsNet: number;
};

export const getCampaignMonthlyBreakdown = cache(
  async (campaignId: string): Promise<MonthlyBreakdown[]> => {
    const [campaign, transactions] = await Promise.all([
      prisma.campaign.findUnique({
        where: { id: campaignId },
        select: {
          monthlyValue: true,
          startMonth: true,
          endMonth: true,
          participants: {
            select: {
              payments: {
                select: { status: true, month: true },
                where: { status: { in: ['PAID_PIX', 'PAID_CASH'] } },
              },
            },
          },
        },
      }),
      prisma.eventTransaction.findMany({
        where: { event: { campaignId } },
        select: { kind: true, amount: true, occurredAt: true },
      }),
    ]);

    if (!campaign) return [];

    const buckets = new Map<string, MonthlyBreakdown>();
    const keyFor = (d: Date) =>
      `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    const monthFor = (d: Date) =>
      new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));

    const ensure = (d: Date) => {
      const key = keyFor(d);
      if (!buckets.has(key)) {
        buckets.set(key, {
          month: monthFor(d),
          contributions: 0,
          eventsExpense: 0,
          eventsIncome: 0,
          eventsNet: 0,
        });
      }
      return buckets.get(key)!;
    };

    const start = monthFor(campaign.startMonth);
    const end = monthFor(campaign.endMonth);
    for (
      let d = new Date(start);
      d <= end;
      d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1))
    ) {
      ensure(d);
    }

    for (const participant of campaign.participants) {
      for (const payment of participant.payments) {
        const bucket = ensure(payment.month);
        bucket.contributions += campaign.monthlyValue;
      }
    }

    for (const tx of transactions) {
      const bucket = ensure(tx.occurredAt);
      if (tx.kind === 'EXPENSE') bucket.eventsExpense += tx.amount;
      else bucket.eventsIncome += tx.amount;
    }

    for (const bucket of buckets.values()) {
      bucket.eventsNet = bucket.eventsIncome - bucket.eventsExpense;
    }

    return Array.from(buckets.values()).sort(
      (a, b) => a.month.getTime() - b.month.getTime(),
    );
  },
);
