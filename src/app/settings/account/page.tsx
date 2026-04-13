import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, ShieldAlert } from 'lucide-react';
import { auth } from '@/lib/auth';
import { AccountActions } from './AccountActions';

export const metadata = {
  title: 'Configurações da conta — Contribution Manager',
};

export default async function AccountSettingsPage() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    redirect('/login');
  }

  return (
    <main className="min-h-dvh bg-app text-text-primary">
      <header className="border-b border-border">
        <div className="max-w-[760px] mx-auto px-5 md:px-8 h-16 flex items-center">
          <Link
            href="/campaigns"
            className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-md px-2 py-1"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Voltar para campanhas
          </Link>
        </div>
      </header>

      <section className="max-w-[760px] mx-auto px-5 md:px-8 py-10 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">Configurações da conta</h1>
          <p className="text-text-secondary">
            Gerencie seus dados pessoais, exporte o histórico e, se preferir, exclua
            permanentemente sua conta.
          </p>
        </header>

        <article className="bg-card border border-border rounded-xl p-6 space-y-4">
          <header className="flex items-start gap-3">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Download size={20} className="text-primary" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-text-primary">Exportar meus dados</h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                Baixe um arquivo JSON contendo todos os dados que o Contribution Manager armazena
                sobre a sua conta: perfil, campanhas, participantes, pagamentos e histórico de
                auditoria.
              </p>
            </div>
          </header>
          <a
            href="/api/account/export"
            download
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-primary text-primary-fg font-medium text-sm hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Download size={16} aria-hidden="true" />
            Baixar export em JSON
          </a>
        </article>

        <article className="bg-card border border-danger/30 rounded-xl p-6 space-y-4">
          <header className="flex items-start gap-3">
            <div className="size-10 rounded-lg bg-danger/10 flex items-center justify-center">
              <ShieldAlert size={20} className="text-danger" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-text-primary">Excluir minha conta</h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                Esta ação é <strong>irreversível</strong>. Todas as campanhas de sua propriedade
                serão permanentemente removidas, incluindo participantes, pagamentos e histórico.
                Registros de auditoria em campanhas de outros usuários serão anonimizados.
              </p>
            </div>
          </header>
          <AccountActions userEmail={session.user.email} />
        </article>
      </section>
    </main>
  );
}
