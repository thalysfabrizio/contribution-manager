import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCampaignDetail } from '@/lib/queries';
import { CampaignPrintReport } from '@/components/print/CampaignPrintReport';
import { PrintTrigger } from '@/components/print/PrintTrigger';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { MonthlyProgress } from '@/components/dashboard/MonthlyProgress';
import { PaymentMethodChart } from '@/components/dashboard/PaymentMethodChart';
import { getMonthsFromRange } from '@/lib/months';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Relatório de contribuições' };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CampaignReportPage({ params }: Props) {
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

  const months = getMonthsFromRange(campaign.startMonth, campaign.endMonth);

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
            Relatório de contribuições
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Visão completa da arrecadação, pagamentos e pendências.
          </p>
        </div>

        <SummaryCards data={campaign} months={months} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
          <MonthlyProgress participants={campaign.participants} months={months} />
          <PaymentMethodChart participants={campaign.participants} />
        </div>
      </div>

      <CampaignPrintReport data={campaign} orgName={campaign.orgName ?? null} />
    </main>
  );
}
