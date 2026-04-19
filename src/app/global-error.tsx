'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
            background: '#0b0b12',
            color: '#e5e7eb',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '9999px',
              background: 'rgba(239, 68, 68, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
              fontSize: 32,
            }}
            aria-hidden="true"
          >
            !
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 12px' }}>
            Algo deu errado
          </h1>
          <p style={{ color: '#a1a1aa', maxWidth: 420, margin: '0 0 32px' }}>
            Um erro inesperado interrompeu a aplicação. Tente recarregar a página.
          </p>
          {error.digest && (
            <p
              style={{
                fontSize: 12,
                color: '#71717a',
                fontFamily: 'ui-monospace, monospace',
                margin: '0 0 24px',
              }}
            >
              Código: {error.digest}
            </p>
          )}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={reset}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                background: '#8b5cf6',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Tentar novamente
            </button>
            <Link
              href="/"
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                background: 'transparent',
                color: '#e5e7eb',
                border: '1px solid #3f3f46',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              Ir para o início
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
