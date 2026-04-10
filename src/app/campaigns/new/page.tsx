import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { CampaignForm } from '@/components/campaign/CampaignForm';

export default async function NewCampaignPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-[600px] mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Nova Campanha</h1>
          <p className="text-sm text-text-secondary">Configure os detalhes da sua campanha</p>
        </div>
        <CampaignForm />
      </div>
    </main>
  );
}
