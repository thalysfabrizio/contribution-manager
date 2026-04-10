import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, Users, Calendar, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CampaignsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const memberships = await prisma.campaignMember.findMany({
    where: { userId: session.user.id },
    include: {
      campaign: {
        include: {
          _count: { select: { participants: true } },
        },
      },
    },
    orderBy: { campaign: { createdAt: 'desc' } },
  });

  // 1 campanha → ir direto
  if (memberships.length === 1) {
    redirect(`/campaigns/${memberships[0].campaignId}`);
  }

  const now = new Date();

  return (
    <main className="min-h-[calc(100dvh-3.5rem)] p-4 md:p-8">
      <div className="max-w-[800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-text-primary">Minhas Campanhas</h1>
            <p className="text-sm text-text-secondary mt-0.5">Selecione ou crie uma campanha</p>
          </div>
          <Link href="/campaigns/new">
            <Button>
              <Plus size={16} aria-hidden="true" />
              <span className="hidden sm:inline">Nova Campanha</span>
              <span className="sm:hidden">Nova</span>
            </Button>
          </Link>
        </div>

        {memberships.length === 0 ? (
          <Card className="p-10 text-center">
            <div className="space-y-4">
              <div className="mx-auto size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Plus size={24} className="text-primary" aria-hidden="true" />
              </div>
              <div>
                <p className="text-text-primary font-medium">Nenhuma campanha ainda</p>
                <p className="text-sm text-text-muted mt-1">
                  Crie sua primeira campanha para começar a gerenciar contribuições.
                </p>
              </div>
              <Link href="/campaigns/new">
                <Button className="mt-2">
                  <Plus size={16} aria-hidden="true" />
                  Criar sua primeira campanha
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid gap-3">
            {memberships.map(({ campaign, role }) => {
              const isEnded = campaign.endMonth < now;
              const startLabel = campaign.startMonth.toLocaleDateString('pt-BR', {
                month: 'short',
                year: 'numeric',
              });
              const endLabel = campaign.endMonth.toLocaleDateString('pt-BR', {
                month: 'short',
                year: 'numeric',
              });

              return (
                <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                  <Card hover className="p-4 md:p-5 cursor-pointer group">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-base font-semibold text-text-primary truncate">
                            {campaign.name}
                          </h2>
                          {isEnded && <Badge variant="muted">Encerrada</Badge>}
                          {role === 'OWNER' && <Badge variant="success">Proprietário</Badge>}
                        </div>
                        {campaign.description && (
                          <p className="text-sm text-text-secondary line-clamp-1">
                            {campaign.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-text-muted">
                          <span className="flex items-center gap-1">
                            <Users size={13} aria-hidden="true" />
                            {campaign._count.participants} participantes
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={13} aria-hidden="true" />
                            {startLabel} — {endLabel}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right hidden sm:block">
                          <span className="text-lg font-bold text-text-primary">
                            R$ {(campaign.monthlyValue / 100).toFixed(2).replace('.', ',')}
                          </span>
                          <span className="block text-xs text-text-muted">por mês</span>
                        </div>
                        <ArrowRight
                          size={16}
                          className="text-text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200"
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
