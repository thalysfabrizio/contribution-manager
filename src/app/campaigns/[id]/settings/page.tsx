import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import { CampaignForm } from '@/components/campaign/CampaignForm';
import { DeleteCampaignButton } from '@/components/campaign/DeleteCampaignButton';
import { TemplateEditor } from '@/components/messaging/TemplateEditor';
import { MemberList } from '@/components/campaign/MemberList';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import type { CampaignTemplates } from '@/lib/templates';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CampaignSettingsPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const member = await prisma.campaignMember.findUnique({
    where: {
      userId_campaignId: {
        userId: session.user.id,
        campaignId: id,
      },
    },
  });

  if (!member || member.role !== 'OWNER') notFound();

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: { select: { name: true, email: true } },
        },
        orderBy: { joinedAt: 'asc' },
      },
    },
  });

  if (!campaign) notFound();

  const memberList = campaign.members.map((m) => ({
    id: m.id,
    role: m.role,
    user: {
      name: m.user.name,
      email: m.user.email,
    },
  }));

  return (
    <main className="min-h-[calc(100dvh-3.5rem)] p-4 md:p-8">
      <div className="max-w-[600px] mx-auto space-y-6">
        <div>
          <Link
            href={`/campaigns/${id}`}
            className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors mb-3"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Voltar
          </Link>
          <h1 className="text-xl font-bold text-text-primary">Configurações</h1>
          <p className="text-sm text-text-secondary mt-0.5">{campaign.name}</p>
        </div>

        <CampaignForm campaign={campaign} />

        <MemberList campaignId={id} members={memberList} />

        <TemplateEditor
          campaignId={id}
          campaignName={campaign.name}
          pixKey={campaign.pixKey}
          monthlyValue={campaign.monthlyValue}
          paymentDayStart={campaign.paymentDayStart}
          paymentDayEnd={campaign.paymentDayEnd}
          templates={campaign.templates as CampaignTemplates | null}
        />

        <div className="border border-danger/20 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-danger" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-danger">Zona de perigo</h2>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">
            Excluir a campanha remove todos os participantes, pagamentos e histórico permanentemente.
          </p>
          <DeleteCampaignButton campaignId={id} campaignName={campaign.name} />
        </div>
      </div>
    </main>
  );
}
