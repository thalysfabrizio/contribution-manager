import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getEventDetail } from '@/lib/queries';
import { EventDashboard } from '@/components/eventos/EventDashboard';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string; eventoId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { eventoId } = await params;
  const event = await prisma.event.findUnique({
    where: { id: eventoId },
    select: { name: true },
  });
  return { title: event?.name ?? 'Evento' };
}

export default async function EventoPage({ params }: Props) {
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

  const event = await getEventDetail(eventoId);
  if (!event || event.campaignId !== id) notFound();

  return (
    <main id="main" className="min-h-[calc(100dvh-3.5rem)]">
      <div className="max-w-[1200px] mx-auto px-5 py-8 md:px-10 md:py-10">
        <EventDashboard campaignId={id} event={event} />
      </div>
    </main>
  );
}
