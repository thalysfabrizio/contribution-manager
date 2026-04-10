import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, Users, Calendar } from 'lucide-react';

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
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-[800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-text-primary">Minhas Campanhas</h1>
            <p className="text-sm text-text-secondary">Selecione ou crie uma campanha</p>
          </div>
          <Link href="/campaigns/new">
            <Button>
              <Plus size={16} />
              Nova Campanha
            </Button>
          </Link>
        </div>

        {memberships.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-text-muted mb-4">Você ainda não participa de nenhuma campanha.</p>
            <Link href="/campaigns/new">
              <Button>
                <Plus size={16} />
                Criar sua primeira campanha
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-4">
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
                  <Card className="p-4 md:p-6 hover:bg-card-hover transition-colors duration-200 cursor-pointer">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-semibold text-text-primary">
                            {campaign.name}
                          </h2>
                          {isEnded && <Badge variant="muted">Encerrada</Badge>}
                          {role === 'OWNER' && <Badge variant="success">Proprietário</Badge>}
                        </div>
                        {campaign.description && (
                          <p className="text-sm text-text-secondary">{campaign.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-text-muted pt-1">
                          <span className="flex items-center gap-1">
                            <Users size={14} />
                            {campaign._count.participants} participantes
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {startLabel} — {endLabel}
                          </span>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-text-primary">
                        R$ {(campaign.monthlyValue / 100).toFixed(2).replace('.', ',')}
                        <span className="text-xs text-text-muted font-normal">/mês</span>
                      </span>
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
