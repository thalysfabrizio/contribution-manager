import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';

export default async function CampaignsLayout({
  children,
}: {
  children: React.ReactNode;
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

  return (
    <>
      <Header
        userName={session.user.name ?? null}
        userImage={session.user.image ?? null}
        campaigns={campaigns}
      />
      <div className="pb-24 md:pb-0">
        {children}
      </div>
      <BottomNav />
    </>
  );
}
