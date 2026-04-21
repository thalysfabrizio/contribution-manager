import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import Dashboard from '@/components/Dashboard';
import { MonthlyProgress } from '@/components/dashboard/MonthlyProgress';
import { PaymentMethodChart } from '@/components/dashboard/PaymentMethodChart';
import { ActivityTimeline } from '@/components/activity/ActivityTimeline';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { getMonthsFromRange, isCampaignEnded } from '@/lib/months';
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
    messageSignature: campaign.messageSignature,
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

  const isEnded = isCampaignEnded(campaign.endMonth);
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
    userName: log.user?.name ?? null,
    createdAt: log.createdAt,
  }));

  return (
    <main className="min-h-[calc(100dvh-3.5rem)]">
      {campaign.bannerUrl && (
        <div className="relative w-full h-32 md:h-44 overflow-hidden">
          <img
            src={campaign.bannerUrl}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-app" />
        </div>
      )}
      <div className="max-w-[1200px] mx-auto px-5 py-8 md:px-10 md:py-10 space-y-8">
        <Dashboard data={data} orgName={campaign.orgName ?? null} isEnded={isEnded} userRole={member.role} />
        <CollapsibleSection id="analytics" title="Análise da Campanha">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
            <MonthlyProgress participants={data.participants} months={months} />
            <PaymentMethodChart participants={data.participants} />
          </div>
        </CollapsibleSection>
        <ActivityTimeline
          campaignId={id}
          initialItems={activityItems}
          hasMore={logs.length > 20}
        />
      </div>
    </main>
  );
}
