import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  getCampaignDetail,
  getCampaignEvents,
  getCampaignFinancialSummary,
  getCampaignMonthlyBreakdown,
} from '@/lib/queries';
import { ContributionsSection } from '@/components/dashboard/ContributionsSection';
import { EventsSection } from '@/components/dashboard/EventsSection';
import { ConsolidatedSection } from '@/components/dashboard/ConsolidatedSection';
import { GeneralPrintReport } from '@/components/print/GeneralPrintReport';
import { PrintTrigger } from '@/components/print/PrintTrigger';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Relatório geral' };

interface Props {
  params: Promise<{ id: string }>;
}

function formatPeriod(start: Date, end: Date): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
  return `${fmt(start)} – ${fmt(end)}`;
}

export default async function GeneralReportPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const member = await prisma.campaignMember.findUnique({
    where: {
      userId_campaignId: { userId: session.user.id, campaignId: id },
    },
    select: { role: true },
  });
  if (!member) notFound();

  const campaign = await getCampaignDetail(id);
  if (!campaign) notFound();

  const [events, summary, monthly] = await Promise.all([
    getCampaignEvents(id),
    getCampaignFinancialSummary(id),
    getCampaignMonthlyBreakdown(id),
  ]);

  const orgName = (campaign as { orgName?: string | null }).orgName ?? null;

  return (
    <main id="main" className="min-h-[calc(100dvh-3.5rem)] print:min-h-0">
      <div className="max-w-[1200px] mx-auto px-5 py-8 md:px-10 md:py-10 space-y-6 print:hidden">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Link
            href={`/campaigns/${id}`}
            className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary"
          >
            <ArrowLeft size={14} aria-hidden="true" /> {campaign.name}
          </Link>
          <PrintTrigger />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Relatório geral
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {formatPeriod(campaign.startMonth, campaign.endMonth)}
          </p>
        </div>

        <ContributionsSection campaign={campaign} />
        <EventsSection events={events} summary={summary} />
        <ConsolidatedSection summary={summary} monthly={monthly} />
      </div>

      <GeneralPrintReport
        orgName={orgName}
        campaign={campaign}
        period={formatPeriod(campaign.startMonth, campaign.endMonth)}
        summary={summary}
        monthly={monthly}
        events={events}
      />
    </main>
  );
}
