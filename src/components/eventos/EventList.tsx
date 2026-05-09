import Link from 'next/link';
import { CalendarDays, TrendingDown, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { brl } from '@/lib/format';
import type { EventStatus, TransactionKind } from '@/generated/prisma/client';

type EventListItem = {
  id: string;
  name: string;
  description: string | null;
  eventDate: Date;
  status: EventStatus;
  transactions: { kind: TransactionKind; amount: number }[];
};

interface EventListProps {
  campaignId: string;
  events: EventListItem[];
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

export function EventList({ campaignId, events }: EventListProps) {
  return (
    <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => {
        const expense = event.transactions
          .filter((t) => t.kind === 'EXPENSE')
          .reduce((acc, t) => acc + t.amount, 0);
        const income = event.transactions
          .filter((t) => t.kind === 'INCOME')
          .reduce((acc, t) => acc + t.amount, 0);
        const net = income - expense;
        const netPositive = net >= 0;

        return (
          <Link
            key={event.id}
            href={`/campaigns/${campaignId}/eventos/${event.id}`}
            className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
          >
            <Card hover className="p-4 md:p-5 h-full">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-base font-semibold text-text-primary leading-tight">
                    {event.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-text-muted mt-1">
                    <CalendarDays size={12} aria-hidden="true" />
                    {event.eventDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                  </div>
                </div>
                <Badge variant={statusVariant[event.status]}>
                  {statusLabel[event.status]}
                </Badge>
              </div>

              {event.description && (
                <p className="text-sm text-text-muted mb-3 line-clamp-2">
                  {event.description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-text-muted">Despesas</span>
                  <div className="font-medium text-danger flex items-center gap-1">
                    <TrendingDown size={12} aria-hidden="true" />
                    {brl(expense)}
                  </div>
                </div>
                <div>
                  <span className="text-text-muted">Receitas</span>
                  <div className="font-medium text-success flex items-center gap-1">
                    <TrendingUp size={12} aria-hidden="true" />
                    {brl(income)}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs text-text-muted">Resultado</span>
                <span
                  className={`text-base font-bold ${netPositive ? 'text-success' : 'text-danger'}`}
                >
                  {netPositive ? '+' : ''}
                  {brl(net)}
                </span>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
