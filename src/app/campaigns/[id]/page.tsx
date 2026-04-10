import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import Dashboard from '@/components/Dashboard';
import { MonthlyProgress } from '@/components/dashboard/MonthlyProgress';
import { PaymentMethodChart } from '@/components/dashboard/PaymentMethodChart';
import { ActivityTimeline } from '@/components/activity/ActivityTimeline';
import { getMonthsFromRange } from '@/lib/months';
import type { CampaignData } from '@/types';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CampaignPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const member = await prisma.campaignMember.findUnique({
    where: {
      userId_campaignId: {
        userId: session.user.id,
        campaignId: id,
      },
    },
  });

  if (!member) notFound();

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      participants: {
        include: {
          person: true,
          payments: { orderBy: { month: 'asc' } },
        },
        orderBy: { person: { name: 'asc' } },
      },
    },
  });

  if (!campaign) notFound();

  const data: CampaignData = {
    id: campaign.id,
    name: campaign.name,
    description: campaign.description,
    pixKey: campaign.pixKey,
    monthlyValue: campaign.monthlyValue,
    startMonth: campaign.startMonth,
    endMonth: campaign.endMonth,
    paymentDayStart: campaign.paymentDayStart,
    paymentDayEnd: campaign.paymentDayEnd,
    participants: campaign.participants.map((p) => ({
      id: p.id,
      person: {
        id: p.person.id,
        name: p.person.name,
        phone: p.person.phone,
      },
      payments: p.payments.map((pay) => ({
        id: pay.id,
        month: pay.month,
        status: pay.status,
      })),
    })),
  };

  const isEnded = campaign.endMonth < new Date();
  const months = getMonthsFromRange(campaign.startMonth, campaign.endMonth);

  // Activity logs (first page)
  const logs = await prisma.auditLog.findMany({
    where: { campaignId: id },
    orderBy: { createdAt: 'desc' },
    take: 21,
    include: { user: { select: { name: true } } },
  });

  const activityItems = logs.slice(0, 20).map((log) => ({
    id: log.id,
    action: log.action,
    entity: log.entity,
    entityId: log.entityId,
    details: log.details as Record<string, unknown>,
    userName: log.user.name,
    createdAt: log.createdAt,
  }));

  return (
    <>
      <Dashboard data={data} isEnded={isEnded} userRole={member.role} />
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 pb-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MonthlyProgress participants={data.participants} months={months} />
          <PaymentMethodChart participants={data.participants} />
        </div>
        <ActivityTimeline
          campaignId={id}
          initialItems={activityItems}
          hasMore={logs.length > 20}
        />
      </div>
    </>
  );
}
