import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { brl } from '@/lib/format';
import type {
  EventStatus,
  TransactionKind,
} from '@/generated/prisma/client';
import type { CampaignFinancialSummary } from '@/lib/queries';

type EventListItem = {
  id: string;
  name: string;
  description: string | null;
  eventDate: Date;
  status: EventStatus;
  transactions: { kind: TransactionKind; amount: number }[];
};

interface EventsSectionProps {
  events: EventListItem[];
  summary: CampaignFinancialSummary;
}

const statusLabel: Record<EventStatus, string> = {
  PLANNED: 'Planejado',
  ONGOING: 'Em andamento',
  FINISHED: 'Finalizado',
  CANCELED: 'Cancelado',
};

const statusVariant: Record<
  EventStatus,
  'muted' | 'success' | 'warning' | 'danger' | 'info'
> = {
  PLANNED: 'info',
  ONGOING: 'warning',
  FINISHED: 'success',
  CANCELED: 'danger',
};

export function EventsSection({ events, summary }: EventsSectionProps) {
  const eventRows = events.map((e) => {
    const expense = e.transactions
      .filter((t) => t.kind === 'EXPENSE')
      .reduce((acc, t) => acc + t.amount, 0);
    const income = e.transactions
      .filter((t) => t.kind === 'INCOME')
      .reduce((acc, t) => acc + t.amount, 0);
    return { ...e, net: income - expense };
  });

  const eventsPositive = summary.eventsNet >= 0;

  return (
    <section aria-labelledby="events-heading" className="space-y-4">
      <div className="border-b border-border pb-2">
        <h2
          id="events-heading"
          className="text-xs font-bold tracking-wider uppercase text-text-muted"
        >
          Eventos
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="p-4 md:p-5">
          <span className="text-xs text-text-muted font-medium uppercase tracking-wide">
            Despesas
          </span>
          <p className="text-xl md:text-2xl font-bold text-danger mt-1">
            {brl(summary.eventsExpense)}
          </p>
        </Card>
        <Card className="p-4 md:p-5">
          <span className="text-xs text-text-muted font-medium uppercase tracking-wide">
            Receitas
          </span>
          <p className="text-xl md:text-2xl font-bold text-success mt-1">
            {brl(summary.eventsIncome)}
          </p>
        </Card>
        <Card className="p-4 md:p-5">
          <span className="text-xs text-text-muted font-medium uppercase tracking-wide">
            Resultado
          </span>
          <p
            className={`text-xl md:text-2xl font-bold mt-1 ${eventsPositive ? 'text-success' : 'text-danger'}`}
          >
            {eventsPositive ? '+' : ''}
            {brl(summary.eventsNet)}
          </p>
          <p className="text-xs text-text-muted mt-1">
            {eventsPositive ? 'Lucro' : 'Prejuízo'}
          </p>
        </Card>
        <Card className="p-4 md:p-5">
          <span className="text-xs text-text-muted font-medium uppercase tracking-wide">
            Eventos
          </span>
          <p className="text-xl md:text-2xl font-bold text-text-primary mt-1">
            {events.length}
          </p>
        </Card>
      </div>

      {eventRows.length === 0 ? (
        <Card className="p-5 text-sm text-text-muted text-center">
          Nenhum evento cadastrado ainda.
        </Card>
      ) : (
        <Card>
          <ul className="divide-y divide-border md:grid md:grid-cols-2 md:divide-y-0">
            {eventRows.map((e, idx) => {
              const positive = e.net >= 0;
              return (
                <li
                  key={e.id}
                  className={`px-4 py-3 ${
                    idx % 2 === 0 ? 'md:border-r md:border-border' : ''
                  } md:border-b md:border-border ${
                    idx >= eventRows.length - (eventRows.length % 2 === 0 ? 2 : 1)
                      ? 'md:border-b-0'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {e.name}
                      </p>
                      <p className="text-xs text-text-muted">
                        {e.eventDate.toLocaleDateString('pt-BR', {
                          timeZone: 'UTC',
                        })}
                      </p>
                    </div>
                    <Badge variant={statusVariant[e.status]}>
                      {statusLabel[e.status]}
                    </Badge>
                  </div>
                  <p
                    className={`text-sm font-semibold tabular-nums mt-1 ${positive ? 'text-success' : 'text-danger'}`}
                  >
                    {positive ? '+' : ''}
                    {brl(e.net)}
                  </p>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </section>
  );
}
