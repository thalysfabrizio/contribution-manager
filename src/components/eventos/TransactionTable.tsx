'use client';

import { useState } from 'react';
import { Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { removeEventTransaction } from '@/actions/event-transaction';
import { brl } from '@/lib/format';
import type { TransactionKind } from '@/generated/prisma/client';

type TransactionRow = {
  id: string;
  kind: TransactionKind;
  amount: number;
  description: string;
  occurredAt: Date;
};

interface TransactionTableProps {
  transactions: TransactionRow[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  const { toast } = useToast();
  const [pendingDelete, setPendingDelete] = useState<TransactionRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    const result = await removeEventTransaction(pendingDelete.id);
    setIsDeleting(false);
    if (!result.ok) {
      toast(result.error, 'error');
    } else {
      toast('Lançamento removido', 'success');
      setPendingDelete(null);
    }
  };

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={<TrendingUp size={28} className="text-primary" aria-hidden="true" />}
        title="Nenhum lançamento ainda"
        description="Adicione despesas (ingredientes, materiais) e receitas (vendas, doações) para acompanhar o resultado do evento."
      />
    );
  }

  return (
    <>
      <Card>
        <ul className="divide-y divide-border">
          {transactions.map((tx) => {
            const isExpense = tx.kind === 'EXPENSE';
            return (
              <li
                key={tx.id}
                className="flex items-center gap-3 px-4 py-3"
              >
                <div
                  className={`size-9 rounded-full flex items-center justify-center shrink-0 ${
                    isExpense ? 'bg-danger-bg' : 'bg-success-bg'
                  }`}
                >
                  {isExpense ? (
                    <TrendingDown
                      size={16}
                      className="text-danger"
                      aria-hidden="true"
                    />
                  ) : (
                    <TrendingUp
                      size={16}
                      className="text-success"
                      aria-hidden="true"
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {tx.description}
                  </p>
                  <p className="text-xs text-text-muted">
                    {tx.occurredAt.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                  </p>
                </div>

                <span
                  className={`text-sm font-semibold tabular-nums ${
                    isExpense ? 'text-danger' : 'text-success'
                  }`}
                >
                  {isExpense ? '−' : '+'}
                  {brl(tx.amount)}
                </span>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPendingDelete(tx)}
                  aria-label={`Remover lançamento ${tx.description}`}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </Button>
              </li>
            );
          })}
        </ul>
      </Card>

      <ConfirmModal
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        title="Remover lançamento?"
        message={
          pendingDelete
            ? `Esta ação não pode ser desfeita. ${pendingDelete.description} (${brl(pendingDelete.amount)}) será removido.`
            : ''
        }
        confirmLabel="Remover"
        loading={isDeleting}
      />
    </>
  );
}
