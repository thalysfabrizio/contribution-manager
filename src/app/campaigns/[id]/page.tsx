import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import Image from 'next/image';
import Dashboard from '@/components/Dashboard';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { OnboardingStepper } from '@/components/dashboard/OnboardingStepper';
import { MonthlyProgress } from '@/components/dashboard/MonthlyProgress';
import { PaymentMethodChart } from '@/components/dashboard/PaymentMethodChart';
import { ActivityTimeline } from '@/components/activity/ActivityTimeline';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { CampaignPrintReport } from '@/components/print/CampaignPrintReport';
import { getMonthsFromRange, isCampaignEnded } from '@/lib/months';
import { getCampaignDetail } from '@/lib/queries';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const campaign = await getCampaignDetail(id);
  return { title: campaign?.name ?? 'Campanha' };
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
    select: { role: true },
  });

  if (!member) notFound();

  const campaign = await getCampaignDetail(id);
  if (!campaign) notFound();

  const isEnded = isCampaignEnded(campaign.endMonth);
  const months = getMonthsFromRange(campaign.startMonth, campaign.endMonth);

  const logs = await prisma.auditLog.findMany({
    where: { campaignId: id },
    orderBy: { createdAt: 'desc' },
    take: 21,
    select: {
      id: true,
      action: true,
      entity: true,
      entityId: true,
      details: true,
      createdAt: true,
      user: { select: { name: true } },
    },
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
    <main id="main" className="min-h-[calc(100dvh-3.5rem)]">
      {campaign.bannerUrl && (
        <div className="relative w-full h-32 md:h-44 overflow-hidden">
          <Image
            src={campaign.bannerUrl}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-app" />
        </div>
      )}
      <div className="max-w-[1200px] mx-auto px-5 py-8 md:px-10 md:py-10 space-y-8">
        <Dashboard
          data={campaign}
          isEnded={isEnded}
          userRole={member.role}
          topSlot={
            <>
              <OnboardingStepper
                hasParticipants={campaign.participants.length > 0}
                hasPayments={campaign.participants.some((p) =>
                  p.payments.some((pay) => pay.status !== 'PENDING'),
                )}
              />
              <SummaryCards data={campaign} months={months} />
            </>
          }
          printSlot={<CampaignPrintReport data={campaign} orgName={campaign.orgName ?? null} />}
        />
        <CollapsibleSection id="analytics" title="Análise da Campanha">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
            <MonthlyProgress participants={campaign.participants} months={months} />
            <PaymentMethodChart participants={campaign.participants} />
          </div>
        </CollapsibleSection>
        <ActivityTimeline
          key={id}
          campaignId={id}
          initialItems={activityItems}
          hasMore={logs.length > 20}
        />
      </div>
    </main>
  );
}
