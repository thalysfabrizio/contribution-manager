import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, HandCoins } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Informações legais — Contribution Manager',
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh bg-app text-text-primary">
      <header className="border-b border-border">
        <div className="max-w-[760px] mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-text-primary hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-md"
          >
            <HandCoins size={20} className="text-primary" aria-hidden="true" />
            <span className="text-sm font-bold">Gestor de Contribuições</span>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-md px-2 py-1"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Voltar
          </Link>
        </div>
      </header>

      <article className="max-w-[760px] mx-auto px-5 md:px-8 py-10 md:py-14 text-[15px] md:text-base leading-relaxed space-y-6">
        {children}
      </article>

      <footer className="border-t border-border mt-10">
        <div className="max-w-[760px] mx-auto px-5 md:px-8 py-6 text-xs text-text-muted flex flex-wrap gap-x-4 gap-y-2">
          <Link href="/legal/privacy" className="hover:text-text-secondary transition-colors">
            Política de Privacidade
          </Link>
          <Link href="/legal/terms" className="hover:text-text-secondary transition-colors">
            Termos de Uso
          </Link>
          <span className="ml-auto">Versão 1.0</span>
        </div>
      </footer>
    </main>
  );
}
