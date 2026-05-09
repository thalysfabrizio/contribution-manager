import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { EventForm } from '@/components/eventos/EventForm';

export const metadata = { title: 'Editar evento' };

interface Props {
  params: Promise<{ id: string; eventoId: string }>;
}

export default async function EditEventoPage({ params }: Props) {
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

  const event = await prisma.event.findUnique({
    where: { id: eventoId },
    select: {
      id: true,
      name: true,
      description: true,
      eventDate: true,
      status: true,
      campaignId: true,
    },
  });
  if (!event || event.campaignId !== id) notFound();

  return (
    <main id="main" className="min-h-[calc(100dvh-3.5rem)]">
      <div className="max-w-2xl mx-auto px-5 py-8 md:px-10 md:py-10 space-y-6">
        <Link
          href={`/campaigns/${id}/eventos/${eventoId}`}
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary"
        >
          <ArrowLeft size={14} aria-hidden="true" /> {event.name}
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-text-primary">Editar evento</h1>
        </div>

        <Card className="p-5 md:p-6">
          <EventForm campaignId={id} event={event} />
        </Card>
      </div>
    </main>
  );
}
