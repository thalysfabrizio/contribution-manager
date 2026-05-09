'use client';

import { useActionState, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { addEventTransaction } from '@/actions/event-transaction';
import type { ActionResult } from '@/lib/errors';
import type { TransactionKind } from '@/generated/prisma/client';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  defaultKind?: TransactionKind;
}

export function AddTransactionModal({
  isOpen,
  onClose,
  eventId,
  defaultKind = 'EXPENSE',
}: AddTransactionModalProps) {
  const { toast } = useToast();
  const [kind, setKind] = useState<TransactionKind>(defaultKind);

  const submit = async (
    _prev: ActionResult<unknown> | null,
    formData: FormData,
  ): Promise<ActionResult<unknown>> => {
    formData.set('kind', kind);
    const result = await addEventTransaction(eventId, formData);
    if (!result.ok) {
      toast(result.error, 'error');
    } else {
      toast(
        kind === 'EXPENSE' ? 'Despesa registrada' : 'Receita registrada',
        'success',
      );
      onClose();
    }
    return result;
  };

  const [, formAction] = useActionState(submit, null);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo lançamento">
      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <span className="block text-sm font-medium text-text-secondary">
            Tipo
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setKind('EXPENSE')}
              className={`min-h-[44px] rounded-lg border px-3 text-sm font-medium transition-colors ${
                kind === 'EXPENSE'
                  ? 'border-danger bg-danger/10 text-danger'
                  : 'border-border bg-app text-text-secondary hover:bg-card-hover'
              }`}
              aria-pressed={kind === 'EXPENSE'}
            >
              Despesa
            </button>
            <button
              type="button"
              onClick={() => setKind('INCOME')}
              className={`min-h-[44px] rounded-lg border px-3 text-sm font-medium transition-colors ${
                kind === 'INCOME'
                  ? 'border-success bg-success/10 text-success'
                  : 'border-border bg-app text-text-secondary hover:bg-card-hover'
              }`}
              aria-pressed={kind === 'INCOME'}
            >
              Receita
            </button>
          </div>
        </div>

        <Input
          name="amount"
          type="number"
          label="Valor (R$)"
          step="0.01"
          min="0.01"
          placeholder="0,00"
          required
          inputMode="decimal"
        />

        <Input
          name="description"
          label="Descrição"
          placeholder={
            kind === 'EXPENSE'
              ? 'Ex.: Ingredientes, decoração'
              : 'Ex.: Venda de comida, doação'
          }
          required
          maxLength={200}
        />

        <Input
          name="occurredAt"
          type="date"
          label="Data"
          defaultValue={today}
          required
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <SubmitButton>Registrar</SubmitButton>
        </div>
      </form>
    </Modal>
  );
}
