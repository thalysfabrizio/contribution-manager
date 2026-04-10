import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CampaignForm } from '@/components/campaign/CampaignForm';
import { ArrowLeft } from 'lucide-react';

export default async function NewCampaignPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  return (
    <main className="min-h-[calc(100dvh-3.5rem)] p-4 md:p-8">
      <div className="max-w-[600px] mx-auto space-y-6">
        <div>
          <Link
            href="/campaigns"
            className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors mb-3"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Voltar
          </Link>
          <h1 className="text-xl font-bold text-text-primary">Nova Campanha</h1>
          <p className="text-sm text-text-secondary mt-0.5">Configure os detalhes da sua campanha</p>
        </div>
        <CampaignForm />
      </div>
    </main>
  );
}
