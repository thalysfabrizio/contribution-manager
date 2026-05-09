import { brl } from '@/lib/format';
import type { EventStatus, TransactionKind } from '@/generated/prisma/client';

type Transaction = {
  id: string;
  kind: TransactionKind;
  amount: number;
  description: string;
  occurredAt: Date;
};

interface EventPrintReportProps {
  orgName: string | null;
  campaignName: string;
  event: {
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

export function EventPrintReport({ orgName, campaignName, event }: EventPrintReportProps) {
  const expenses = event.transactions.filter((t) => t.kind === 'EXPENSE');
  const incomes = event.transactions.filter((t) => t.kind === 'INCOME');
  const totalExpense = expenses.reduce((acc, t) => acc + t.amount, 0);
  const totalIncome = incomes.reduce((acc, t) => acc + t.amount, 0);
  const net = totalIncome - totalExpense;

  const generatedAt = new Date().toLocaleString('pt-BR');
  const eventDateStr = event.eventDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

  return (
    <div className="print-report">
      <header className="pr-head">
        <div>
          <h1>{event.name}</h1>
          <div className="pr-sub">
            {orgName ? `${orgName} · ` : ''}
            {campaignName}
          </div>
        </div>
        <div className="pr-head-meta">
          <div className="pr-period">{eventDateStr}</div>
          <div className="pr-muted" suppressHydrationWarning>
            Gerado em {generatedAt}
          </div>
        </div>
      </header>

      {event.description && <p className="pr-description">{event.description}</p>}

      <section className="pr-kpis">
        <div className="pr-kpi">
          <div className="pr-kpi-label">Status</div>
          <div className="pr-kpi-value">{statusLabel[event.status]}</div>
        </div>
        <div className="pr-kpi">
          <div className="pr-kpi-label">Despesas</div>
          <div className="pr-kpi-value">{brl(totalExpense)}</div>
          <div className="pr-kpi-sub">{expenses.length} lançamento(s)</div>
        </div>
        <div className="pr-kpi">
          <div className="pr-kpi-label">Receitas</div>
          <div className="pr-kpi-value">{brl(totalIncome)}</div>
          <div className="pr-kpi-sub">{incomes.length} lançamento(s)</div>
        </div>
        <div className="pr-kpi">
          <div className="pr-kpi-label">{net >= 0 ? 'Lucro' : 'Prejuízo'}</div>
          <div className="pr-kpi-value">{brl(net)}</div>
        </div>
      </section>

      <section className="pr-section pr-two-col">
        <div>
          <h2>Despesas</h2>
          {expenses.length === 0 ? (
            <p className="pr-muted">Sem despesas registradas.</p>
          ) : (
            <ul className="pr-list">
              {expenses.map((tx) => (
                <li key={tx.id}>
                  <strong>{tx.description}</strong>
                  <span className="pr-muted">
                    {' '}· {tx.occurredAt.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                  </span>
                  <div className="pr-list-sub">{brl(tx.amount)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2>Receitas</h2>
          {incomes.length === 0 ? (
            <p className="pr-muted">Sem receitas registradas.</p>
          ) : (
            <ul className="pr-list">
              {incomes.map((tx) => (
                <li key={tx.id}>
                  <strong>{tx.description}</strong>
                  <span className="pr-muted">
                    {' '}· {tx.occurredAt.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                  </span>
                  <div className="pr-list-sub">{brl(tx.amount)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <footer className="pr-footer-summary">
        <span>
          <strong>{event.transactions.length}</strong> lançamento(s)
        </span>
        <span className="pr-sep">·</span>
        <span>
          Resultado: <strong>{brl(net)}</strong>
        </span>
      </footer>
    </div>
  );
}
