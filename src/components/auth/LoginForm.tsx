'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, CheckCircle, HandCoins, Sun, Moon, ArrowLeft } from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState<'google' | 'email' | null>(null);
  const [isDark, setIsDark] = useState(true);
  const searchParams = useSearchParams();
  const isVerify = searchParams.has('verify');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads DOM on mount; lazy init would break SSR hydration
    setIsDark(!document.documentElement.classList.contains('light'));
  }, []);

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    document.documentElement.classList.toggle('light', next === 'light');
    localStorage.setItem('a11y-theme', next);
    setIsDark(next === 'dark');
  };

  if (isVerify) {
    return (
      <main className="min-h-dvh grid place-items-center px-4 py-8 bg-app">
        <div className="w-full max-w-[400px] text-center animate-in">
          <div className="bg-card border border-border rounded-2xl px-8 py-12 shadow-xl shadow-black/10">
            <div className="mx-auto size-20 rounded-full bg-success/10 flex items-center justify-center mb-6">
              <CheckCircle size={40} className="text-success" aria-hidden="true" />
            </div>

            <h1 className="text-2xl font-bold text-text-primary mb-3">
              Verifique seu email
            </h1>
            <p className="text-base text-text-secondary leading-relaxed mb-8">
              Enviamos um link de acesso para o seu email.
              <br />
              Clique no link para entrar.
            </p>

            <button
              onClick={() => window.location.href = '/login'}
              className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-hover transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Voltar ao login
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh grid place-items-center px-4 py-8 bg-app relative overflow-hidden">
      {/* Glow decorativo */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-primary/[0.05] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-primary/[0.03] rounded-full blur-[80px] pointer-events-none" />

      {/* Toggle de tema */}
      <button
        onClick={toggleTheme}
        className="absolute top-5 right-5 size-11 inline-flex items-center justify-center rounded-xl bg-card/80 backdrop-blur-sm border border-border text-text-secondary hover:text-text-primary hover:bg-card transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      >
        {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
      </button>

      <div className="w-full max-w-[440px] relative animate-in">
        {/* ===== Bloco de branding ===== */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center size-[72px] rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 mb-6 shadow-lg shadow-primary/10">
            <HandCoins size={34} className="text-primary" aria-hidden="true" />
          </div>

          <h1 className="text-[28px] md:text-[32px] font-extrabold text-text-primary tracking-tight leading-tight">
            Gestor de Contribuições
          </h1>
          <p className="text-[15px] text-text-secondary mt-3 leading-relaxed max-w-[320px] mx-auto">
            Organize contribuições, acompanhe pagamentos e envie lembretes
          </p>
        </div>

        {/* ===== Card do formulário ===== */}
        <div className="bg-card border border-border rounded-2xl shadow-2xl shadow-black/15">
          <div className="px-7 py-8 md:px-9 md:py-10">
            {/* Botão Google */}
            <button
              onClick={() => {
                setLoading('google');
                signIn('google', { callbackUrl: '/campaigns' });
              }}
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-3 h-[52px] rounded-xl bg-white text-zinc-800 font-semibold text-[15px] border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {loading === 'google' ? (
                <span className="flex items-center gap-2.5">
                  <span className="size-5 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
                  Entrando...
                </span>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
            <div className="flex items-center gap-4 my-7">
              <div className="flex-1 h-px bg-border" />
              <span className="text-sm text-text-muted select-none">ou</span>
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
              className="space-y-5"
            >
              <div className="space-y-2">
                <label
                  htmlFor="login-email"
                  className="block text-sm font-medium text-text-secondary"
                >
                  Endereço de email
                </label>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  placeholder="voce@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full h-[52px] rounded-xl border-2 border-border bg-app px-4 text-base text-text-primary placeholder:text-text-muted transition-all duration-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading !== null}
                className="w-full flex items-center justify-center gap-2.5 h-[52px] rounded-xl bg-primary text-white font-semibold text-[15px] hover:bg-primary-hover active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-primary/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {loading === 'email' ? (
                  <span className="flex items-center gap-2.5">
                    <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enviando link...
                  </span>
                ) : (
                  <>
                    <Mail size={18} aria-hidden="true" />
                    Enviar link de acesso
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-text-muted mt-8 leading-relaxed">
          Ao continuar, você aceita os{' '}
          <Link
            href="/legal/terms"
            className="underline underline-offset-2 hover:text-text-secondary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded"
          >
            Termos de Uso
          </Link>{' '}
          e a{' '}
          <Link
            href="/legal/privacy"
            className="underline underline-offset-2 hover:text-text-secondary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded"
          >
            Política de Privacidade
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
