'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Pencil,
  Plus,
  Printer,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TransactionTable } from './TransactionTable';
import { AddTransactionModal } from './AddTransactionModal';
import { brl } from '@/lib/format';
import type { EventStatus, TransactionKind } from '@/generated/prisma/client';

type Transaction = {
  id: string;
  kind: TransactionKind;
  amount: number;
  description: string;
  occurredAt: Date;
};

interface EventDashboardProps {
  campaignId: string;
  event: {
    id: string;
    name: string;
    description: string | null;
    eventDate: Date;
    status: EventStatus;
    transactions: Transaction[];
  };
}

const statusLabel: Record<EventStatus, string> = {
  PLANNED: 'Planejado',
  ONGOING: 'Em andamento',
  FINISHED: 'Finalizado',
  CANCELED: 'Cancelado',
};

const statusVariant: Record<EventStatus, 'muted' | 'success' | 'warning' | 'danger' | 'info'> = {
  PLANNED: 'info',
  ONGOING: 'warning',
  FINISHED: 'success',
  CANCELED: 'danger',
};

export function EventDashboard({ campaignId, event }: EventDashboardProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);

  const expense = event.transactions
    .filter((t) => t.kind === 'EXPENSE')
    .reduce((acc, t) => acc + t.amount, 0);
  const income = event.transactions
    .filter((t) => t.kind === 'INCOME')
    .reduce((acc, t) => acc + t.amount, 0);
  const net = income - expense;
  const netPositive = net >= 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <Link
          href={`/campaigns/${campaignId}/eventos`}
          className="inline-flex items-center gap-1 hover:text-text-primary"
        >
          <ArrowLeft size={14} aria-hidden="true" /> Eventos
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-text-primary">{event.name}</h1>
            <Badge variant={statusVariant[event.status]}>{statusLabel[event.status]}</Badge>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-text-muted">
            <Calendar size={14} aria-hidden="true" />
            {event.eventDate.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              timeZone: 'UTC',
            })}
          </div>
          {event.description && (
            <p className="text-sm text-text-secondary mt-2 max-w-2xl">
              {event.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/campaigns/${campaignId}/eventos/${event.id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil size={14} aria-hidden="true" /> Editar
            </Button>
          </Link>
          <Link href={`/campaigns/${campaignId}/eventos/${event.id}/relatorio`}>
            <Button variant="outline" size="sm">
              <Printer size={14} aria-hidden="true" /> Relatório
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <Card className="p-4 md:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-muted font-medium">Despesas</span>
            <div className="size-9 rounded-full bg-danger-bg flex items-center justify-center">
              <TrendingDown size={18} className="text-danger" aria-hidden="true" />
            </div>
          </div>
          <span className="block text-2xl font-bold text-danger">{brl(expense)}</span>
          <span className="text-xs text-text-muted mt-1 block">
            Saídas para o evento
          </span>
        </Card>

        <Card className="p-4 md:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-muted font-medium">Receitas</span>
            <div className="size-9 rounded-full bg-success-bg flex items-center justify-center">
              <TrendingUp size={18} className="text-success" aria-hidden="true" />
            </div>
          </div>
          <span className="block text-2xl font-bold text-success">{brl(income)}</span>
          <span className="text-xs text-text-muted mt-1 block">
            Entradas do evento
          </span>
        </Card>

        <Card className="p-4 md:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-muted font-medium">Resultado</span>
            <div
              className={`size-9 rounded-full flex items-center justify-center ${netPositive ? 'bg-success-bg' : 'bg-danger-bg'}`}
            >
              <Wallet
                size={18}
                className={netPositive ? 'text-success' : 'text-danger'}
                aria-hidden="true"
              />
            </div>
          </div>
          <span
            className={`block text-2xl font-bold ${netPositive ? 'text-success' : 'text-danger'}`}
          >
            {netPositive ? '+' : ''}
            {brl(net)}
          </span>
          <span className="text-xs text-text-muted mt-1 block">
            {netPositive ? 'Lucro do evento' : 'Prejuízo do evento'}
          </span>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Lançamentos</h2>
        <Button onClick={() => setIsAddOpen(true)} size="sm">
          <Plus size={16} aria-hidden="true" /> Novo lançamento
        </Button>
      </div>

      <TransactionTable transactions={event.transactions} />

      <AddTransactionModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        eventId={event.id}
      />
    </div>
  );
}
