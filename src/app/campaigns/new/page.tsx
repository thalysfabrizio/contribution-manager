import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { NewCampaignForm } from '@/components/campaign/NewCampaignForm';
import { ArrowLeft } from 'lucide-react';

export default async function NewCampaignPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  return (
    <main id="main" className="min-h-[calc(100dvh-3.5rem)] p-4 md:p-8">
      <div className="max-w-[640px] mx-auto space-y-6">
        <div>
          <Link
            href="/campaigns"
            className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors mb-3"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Voltar
          </Link>
          <h1 className="text-xl font-bold text-text-primary">Nova Campanha</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Configure tudo de uma vez — ou comece pelo essencial e refine depois
          </p>
        </div>
        <NewCampaignForm />
      </div>
    </main>
  );
}
