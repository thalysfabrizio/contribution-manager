import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getEventDetail } from '@/lib/queries';
import { Card } from '@/components/ui/Card';
import { brl } from '@/lib/format';
import { EventPrintReport } from '@/components/print/EventPrintReport';
import { PrintTrigger } from '@/components/print/PrintTrigger';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string; eventoId: string }>;
}

export const metadata = { title: 'Relatório do evento' };

export default async function EventReportPage({ params }: Props) {
  const { id, eventoId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const member = await prisma.campaignMember.findUnique({
    where: {
      userId_campaignId: { userId: session.user.id, campaignId: id },
    },
    select: { role: true },
  });
  if (!member) notFound();

  const [event, campaign] = await Promise.all([
    getEventDetail(eventoId),
    prisma.campaign.findUnique({
      where: { id },
      select: { name: true, orgName: true },
    }),
  ]);

  if (!event || event.campaignId !== id || !campaign) notFound();

  const expense = event.transactions
    .filter((t) => t.kind === 'EXPENSE')
    .reduce((acc, t) => acc + t.amount, 0);
  const income = event.transactions
    .filter((t) => t.kind === 'INCOME')
    .reduce((acc, t) => acc + t.amount, 0);
  const net = income - expense;

  return (
    <main id="main" className="min-h-[calc(100dvh-3.5rem)] print:min-h-0">
      <div className="max-w-[1100px] mx-auto px-5 py-8 md:px-10 md:py-10 space-y-6 print:hidden">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Link
            href={`/campaigns/${id}/eventos/${eventoId}`}
            className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary"
          >
            <ArrowLeft size={14} aria-hidden="true" /> {event.name}
          </Link>
          <PrintTrigger />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Relatório · {event.name}
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {event.eventDate.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              timeZone: 'UTC',
            })}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          <Card className="p-4 md:p-5">
            <span className="text-sm text-text-muted">Despesas</span>
            <p className="text-2xl font-bold text-danger mt-1">{brl(expense)}</p>
          </Card>
          <Card className="p-4 md:p-5">
            <span className="text-sm text-text-muted">Receitas</span>
            <p className="text-2xl font-bold text-success mt-1">{brl(income)}</p>
          </Card>
          <Card className="p-4 md:p-5">
            <span className="text-sm text-text-muted">
              {net >= 0 ? 'Lucro' : 'Prejuízo'}
            </span>
            <p
              className={`text-2xl font-bold mt-1 ${net >= 0 ? 'text-success' : 'text-danger'}`}
            >
              {net >= 0 ? '+' : ''}
              {brl(net)}
            </p>
          </Card>
        </div>

        <p className="text-sm text-text-muted">
          A versão completa para impressão será gerada ao clicar em &quot;Imprimir&quot;.
        </p>
      </div>

      <EventPrintReport
        orgName={campaign.orgName ?? null}
        campaignName={campaign.name}
        event={event}
      />
    </main>
  );
}
