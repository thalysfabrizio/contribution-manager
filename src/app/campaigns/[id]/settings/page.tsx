import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import { CampaignForm } from '@/components/campaign/CampaignForm';
import { BrandingForm } from '@/components/campaign/BrandingForm';
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
    <main className="min-h-[calc(100dvh-4rem)] px-5 py-8 md:px-10 md:py-12">
      <div className="max-w-[640px] mx-auto space-y-8">
        <div>
          <Link
            href={`/campaigns/${id}`}
            className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-4"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Voltar
          </Link>
          <h1 className="text-2xl font-bold text-text-primary">Configurações</h1>
          <p className="text-sm text-text-secondary mt-1.5">{campaign.name}</p>
        </div>

        <CampaignForm campaign={campaign} />

        <section id="templates" className="scroll-mt-20">
          <TemplateEditor
            campaignId={id}
            campaignName={campaign.name}
            pixKey={campaign.pixKey}
            monthlyValue={campaign.monthlyValue}
            paymentDayStart={campaign.paymentDayStart}
            paymentDayEnd={campaign.paymentDayEnd}
            templates={campaign.templates as CampaignTemplates | null}
          />
        </section>

        <section id="leaders" className="scroll-mt-20">
          <MemberList campaignId={id} members={memberList} />
        </section>

        <BrandingForm
          campaignId={id}
          orgName={campaign.orgName ?? null}
          logoUrl={campaign.logoUrl ?? null}
          bannerUrl={campaign.bannerUrl ?? null}
          accentColor={campaign.accentColor ?? null}
          messageSignature={campaign.messageSignature ?? null}
        />

        <div className="border border-danger/20 rounded-xl p-5 md:p-6 space-y-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={18} className="text-danger" aria-hidden="true" />
            <h2 className="text-base font-semibold text-danger">Zona de perigo</h2>
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
