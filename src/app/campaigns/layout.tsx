import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';

export default async function CampaignsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params?: Promise<{ id?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const memberships = await prisma.campaignMember.findMany({
    where: { userId: session.user.id },
    select: {
      campaign: {
        select: { id: true, name: true, orgName: true, logoUrl: true, accentColor: true },
      },
    },
    orderBy: { campaign: { createdAt: 'desc' } },
  });

  const campaigns = memberships.map((m) => m.campaign);

  // Tentar extrair o campaignId da URL
  let currentCampaignId: string | undefined;
  if (params) {
    const resolved = await params;
    currentCampaignId = resolved?.id;
  }

  const currentCampaign = campaigns.find((c) => c.id === currentCampaignId);
  const accentColor = currentCampaign?.accentColor;

  return (
    <>
      {accentColor && (
        <style>{`:root { --color-primary: ${accentColor}; --color-primary-hover: color-mix(in srgb, ${accentColor} 85%, black); }`}</style>
      )}
      <Header
        userName={session.user.name ?? null}
        userImage={session.user.image ?? null}
        campaigns={campaigns}
        currentCampaignId={currentCampaignId}
      />
      <div className="pb-24 md:pb-0">
        {children}
      </div>
      <BottomNav campaignId={currentCampaignId} />
    </>
  );
}
