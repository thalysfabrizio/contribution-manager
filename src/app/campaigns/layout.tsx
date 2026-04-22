import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { getUserMemberships } from '@/lib/queries';

export default async function CampaignsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const memberships = await getUserMemberships(session.user.id);
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
