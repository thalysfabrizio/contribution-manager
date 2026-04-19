'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CampaignsError({ error, reset }: ErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="rounded-full bg-danger/10 p-4 mb-6">
        <AlertTriangle className="size-10 text-danger" aria-hidden="true" />
      </div>
      <h1 className="text-2xl font-semibold text-text-primary mb-3">
        Ocorreu um erro ao carregar suas campanhas
      </h1>
      <p className="text-text-secondary max-w-md mb-8">
        Tente novamente. Se o problema persistir, aguarde alguns instantes — nossa equipe já foi notificada.
      </p>
      {error.digest && (
        <p className="text-xs text-text-tertiary mb-6 font-mono">Código: {error.digest}</p>
      )}
      <div className="flex gap-3">
        <Button onClick={reset}>Tentar novamente</Button>
        <Link href="/campaigns">
          <Button variant="outline">Voltar para campanhas</Button>
        </Link>
      </div>
    </div>
  );
}
