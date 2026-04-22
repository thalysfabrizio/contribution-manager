'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { deleteAccount } from '@/actions/account';

interface AccountActionsProps {
  userEmail: string;
}

export function AccountActions({ userEmail }: AccountActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    acknowledged &&
    confirmText.trim().toLowerCase() === userEmail.trim().toLowerCase() &&
    !submitting;

  async function handleDelete() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    const result = await deleteAccount(confirmText.trim());
    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }
    await signOut({ callbackUrl: '/login' });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          setError(null);
        }}
        className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-danger text-white font-medium text-sm hover:bg-danger/90 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
      >
        <Trash2 size={16} aria-hidden="true" />
        Excluir minha conta
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          if (submitting) return;
          setIsOpen(false);
          setConfirmText('');
          setAcknowledged(false);
          setError(null);
        }}
        title="Excluir minha conta"
        size="md"
      >
        <div className="space-y-5">
          <div className="bg-danger/10 border border-danger/30 rounded-lg p-4 text-sm text-text-primary">
            <p className="font-medium mb-1">Esta ação é permanente.</p>
            <p className="text-text-secondary leading-relaxed">
              Ao confirmar, sua conta e todas as campanhas que você criou serão excluídas
              imediatamente e não poderão ser recuperadas.
            </p>
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 size-4 rounded border-2 border-border text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger cursor-pointer"
            />
            <span className="text-sm text-text-secondary leading-relaxed">
              Eu entendo que esta ação é <strong>irreversível</strong> e que todas as minhas
              campanhas serão permanentemente excluídas.
            </span>
          </label>

          <div className="space-y-2">
            <label htmlFor="confirm-email" className="text-sm font-medium text-text-secondary">
              Digite seu email para confirmar: <strong>{userEmail}</strong>
            </label>
            <input
              id="confirm-email"
              type="email"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={userEmail}
              autoComplete="off"
              className="w-full h-11 rounded-lg border-2 border-border bg-app px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-danger focus:ring-2 focus:ring-danger/20"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="bg-danger/10 border border-danger/30 rounded-lg px-3 py-2 text-sm text-danger"
            >
              {error}
            </div>
          )}

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => {
                if (submitting) return;
                setIsOpen(false);
                setConfirmText('');
                setAcknowledged(false);
                setError(null);
              }}
              disabled={submitting}
              className="flex-1 h-11 rounded-lg border border-border bg-card text-text-secondary hover:text-text-primary hover:bg-card-hover font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={!canSubmit}
              className="flex-1 h-11 rounded-lg bg-danger text-white font-medium text-sm hover:bg-danger/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
            >
              {submitting ? 'Excluindo...' : 'Excluir definitivamente'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
