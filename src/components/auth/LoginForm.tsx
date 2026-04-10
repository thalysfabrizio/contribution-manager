'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Mail, CheckCircle, HandCoins } from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState<'google' | 'email' | null>(null);
  const searchParams = useSearchParams();
  const isVerify = searchParams.get('verify') === '1';

  if (isVerify) {
    return (
      <main className="min-h-dvh flex items-center justify-center p-6 bg-app">
        <div className="w-full max-w-sm text-center animate-in">
          <div className="bg-card border border-border rounded-2xl p-8 space-y-5">
            <div className="mx-auto size-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle size={32} className="text-success" aria-hidden="true" />
            </div>
            <h1 className="text-xl font-bold text-text-primary">Verifique seu email</h1>
            <p className="text-sm text-text-secondary leading-relaxed">
              Enviamos um link de acesso para o seu email.<br />
              Clique no link para entrar.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh flex items-center justify-center p-6 bg-app relative overflow-hidden">
      {/* Glow sutil de fundo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[400px] relative animate-in">
        {/* Logo e título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-primary/10 border border-primary/20 mb-5">
            <HandCoins size={30} className="text-primary" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Gestor de Contribuições
          </h1>
          <p className="text-sm text-text-secondary mt-1.5">
            Gerencie contribuições de forma simples e organizada
          </p>
        </div>

        {/* Card do formulário */}
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-5">
          {/* Botão Google */}
          <button
            onClick={() => {
              setLoading('google');
              signIn('google', { callbackUrl: '/campaigns' });
            }}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-3 min-h-[48px] px-4 rounded-xl bg-white text-zinc-800 font-medium text-sm hover:bg-zinc-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {loading === 'google' ? (
              <span className="flex items-center gap-2">
                <span className="size-4 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
                Entrando...
              </span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Entrar com Google
              </>
            )}
          </button>

          {/* Separador */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-muted font-medium">ou entre com email</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Form de email */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!email.trim()) return;
              setLoading('email');
              signIn('resend', { email, callbackUrl: '/campaigns' });
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="block text-sm font-medium text-text-secondary">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                name="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full h-12 rounded-xl border-2 border-border bg-app px-4 text-base text-text-primary placeholder:text-text-muted transition-all duration-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
            </div>
            <button
              type="submit"
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-2 min-h-[48px] px-4 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-hover transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {loading === 'email' ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enviando...
                </span>
              ) : (
                <>
                  <Mail size={16} aria-hidden="true" />
                  Enviar link de acesso
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-text-muted mt-6">
          Ao continuar, você aceita os termos de uso da plataforma.
        </p>
      </div>
    </main>
  );
}
