import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { EventForm } from '@/components/eventos/EventForm';

export const metadata = { title: 'Novo evento' };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function NovoEventoPage({ params }: Props) {
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

  return (
    <main id="main" className="min-h-[calc(100dvh-3.5rem)]">
      <div className="max-w-2xl mx-auto px-5 py-8 md:px-10 md:py-10 space-y-6">
        <Link
          href={`/campaigns/${id}/eventos`}
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary"
        >
          <ArrowLeft size={14} aria-hidden="true" /> Eventos
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-text-primary">Novo evento</h1>
          <p className="text-sm text-text-muted mt-1">
            Cadastre um evento para registrar suas movimentações financeiras.
          </p>
        </div>

        <Card className="p-5 md:p-6">
          <EventForm campaignId={id} />
        </Card>
      </div>
    </main>
  );
}
