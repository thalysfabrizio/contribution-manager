import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, Users, Calendar, ArrowRight } from 'lucide-react';
import { isCampaignEnded } from '@/lib/months';

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

  return (
    <main id="main" className="min-h-[calc(100dvh-4rem)] px-5 py-8 md:px-10 md:py-12">
      <div className="max-w-[800px] mx-auto space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-text-primary">Minhas Campanhas</h1>
            <p className="text-sm text-text-secondary mt-1">Selecione ou crie uma campanha</p>
          </div>
          <Link href="/campaigns/new">
            <Button>
              <Plus size={16} aria-hidden="true" />
              <span className="hidden md:inline">Nova Campanha</span>
              <span className="md:hidden">Nova</span>
            </Button>
          </Link>
        </div>

        {memberships.length === 0 ? (
          <Card className="p-6 md:p-10">
            <div className="flex flex-col items-center py-8 text-center animate-in">
              <div className="size-20 md:size-24 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center mb-6">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-primary/60" aria-hidden="true">
                  <rect x="6" y="14" width="36" height="26" rx="4" stroke="currentColor" strokeWidth="2" />
                  <path d="M6 22h36" stroke="currentColor" strokeWidth="2" />
                  <circle cx="24" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                  <path d="M18 32h12M22 28v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Comece sua primeira campanha</h3>
              <p className="text-sm text-text-muted max-w-sm leading-relaxed mb-6">
                Crie uma campanha para organizar contribuicoes, acompanhar pagamentos e enviar lembretes.
              </p>
              <Link href="/campaigns/new">
                <Button>
                  <Plus size={16} aria-hidden="true" />
                  Criar Campanha
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {memberships.map(({ campaign, role }) => {
              const isEnded = isCampaignEnded(campaign.endMonth);
              const startLabel = campaign.startMonth.toLocaleDateString('pt-BR', {
                month: 'short',
                year: 'numeric',
                timeZone: 'UTC',
              });
              const endLabel = campaign.endMonth.toLocaleDateString('pt-BR', {
                month: 'short',
                year: 'numeric',
                timeZone: 'UTC',
              });

              return (
                <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                  <Card hover className="p-5 md:p-6 cursor-pointer group">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h2 className="text-lg font-semibold text-text-primary truncate">
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
                        <div className="flex items-center gap-4 text-sm text-text-muted">
                          <span className="flex items-center gap-1.5">
                            <Users size={14} aria-hidden="true" />
                            {campaign._count.participants} participantes
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={14} aria-hidden="true" />
                            {startLabel} — {endLabel}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-base sm:text-lg font-bold text-text-primary">
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
