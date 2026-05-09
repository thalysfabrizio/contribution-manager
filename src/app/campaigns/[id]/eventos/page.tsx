import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { CalendarDays, Plus } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCampaignEvents } from '@/lib/queries';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { EventList } from '@/components/eventos/EventList';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    select: { name: true },
  });
  return { title: campaign ? `Eventos · ${campaign.name}` : 'Eventos' };
}

export default async function EventosPage({ params }: Props) {
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

  const events = await getCampaignEvents(id);

  return (
    <main id="main" className="min-h-[calc(100dvh-3.5rem)]">
      <div className="max-w-[1200px] mx-auto px-5 py-8 md:px-10 md:py-10 space-y-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Eventos</h1>
            <p className="text-sm text-text-muted mt-1">
              Cadastre eventos da campanha e acompanhe despesas e receitas.
            </p>
          </div>
          <Link href={`/campaigns/${id}/eventos/new`}>
            <Button>
              <Plus size={16} aria-hidden="true" /> Novo evento
            </Button>
          </Link>
        </div>

        {events.length === 0 ? (
          <EmptyState
            icon={
              <CalendarDays size={28} className="text-primary" aria-hidden="true" />
            }
            title="Nenhum evento ainda"
            description="Crie um evento para registrar despesas (ingredientes, materiais) e receitas (vendas, doações)."
            action={
              <Link href={`/campaigns/${id}/eventos/new`}>
                <Button>
                  <Plus size={16} aria-hidden="true" /> Criar primeiro evento
                </Button>
              </Link>
            }
          />
        ) : (
          <EventList campaignId={id} events={events} />
        )}
      </div>
    </main>
  );
}
