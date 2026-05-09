import { brl } from '@/lib/format';
import { getMonthsFromRange, isSameMonth } from '@/lib/months';
import type {
  CampaignFinancialSummary,
  MonthlyBreakdown,
} from '@/lib/queries';
import type { CampaignData } from '@/types';
import type { EventStatus, TransactionKind } from '@/generated/prisma/client';

type EventListItem = {
  id: string;
  name: string;
  description: string | null;
  eventDate: Date;
  status: EventStatus;
  transactions: { kind: TransactionKind; amount: number }[];
};

interface GeneralPrintReportProps {
  orgName: string | null;
  campaign: CampaignData;
  period: string;
  summary: CampaignFinancialSummary;
  monthly: MonthlyBreakdown[];
  events: EventListItem[];
}

const statusLabel: Record<EventStatus, string> = {
  PLANNED: 'Planejado',
  ONGOING: 'Em andamento',
  FINISHED: 'Finalizado',
  CANCELED: 'Cancelado',
};

const COLOR_POSITIVE = '#16a34a';
const COLOR_NEGATIVE = '#dc2626';
const COLOR_NEUTRAL = '#18181b';

export function GeneralPrintReport({
  orgName,
  campaign,
  period,
  summary,
  monthly,
  events,
}: GeneralPrintReportProps) {
  const generatedAt = new Date().toLocaleString('pt-BR');

  // === Contribuições ===
  const months = getMonthsFromRange(campaign.startMonth, campaign.endMonth);
  const totalCells = campaign.participants.length * months.length;
  const totalExpected = totalCells * campaign.monthlyValue;

  const paidCells = campaign.participants.flatMap((p) =>
    p.payments.filter(
      (pay) => pay.status === 'PAID_PIX' || pay.status === 'PAID_CASH',
    ),
  );
  const paidCellsCount = paidCells.length;
  const pixCount = paidCells.filter((p) => p.status === 'PAID_PIX').length;
  const cashCount = paidCellsCount - pixCount;
  const totalReceived = paidCellsCount * campaign.monthlyValue;
  const outstanding = totalExpected - totalReceived;
  const percent =
    totalCells > 0 ? Math.round((paidCellsCount / totalCells) * 100) : 0;

  const monthlyProgress = months.map((m) => {
    const paid = campaign.participants.filter((p) =>
      p.payments.some(
        (pay) =>
          isSameMonth(pay.month, m.date) &&
          (pay.status === 'PAID_PIX' || pay.status === 'PAID_CASH'),
      ),
    ).length;
    const pct =
      campaign.participants.length > 0
        ? (paid / campaign.participants.length) * 100
        : 0;
    return { month: m, paid, pct };
  });

  // === Eventos ===
  const eventRows = events.map((e) => {
    const expense = e.transactions
      .filter((t) => t.kind === 'EXPENSE')
      .reduce((acc, t) => acc + t.amount, 0);
    const income = e.transactions
      .filter((t) => t.kind === 'INCOME')
      .reduce((acc, t) => acc + t.amount, 0);
    return { ...e, net: income - expense };
  });

  // === Consolidado mensal (saldo do mês = contribuições + eventsNet) ===
  const monthlyBalances = monthly.map((m) => ({
    month: m.month,
    balance: m.contributions + m.eventsNet,
  }));
  const maxAbsBalance = Math.max(
    ...monthlyBalances.map((m) => Math.abs(m.balance)),
    1,
  );

  return (
    <div className="print-report">
      <header className="pr-head">
        <div>
          <h1>{orgName || campaign.name}</h1>
          <div className="pr-sub">Relatório geral · {campaign.name}</div>
        </div>
        <div className="pr-head-meta">
          <div className="pr-period">{period}</div>
          <div className="pr-muted" suppressHydrationWarning>
            Gerado em {generatedAt}
          </div>
        </div>
      </header>

      {/* === BLOCO 1: CONTRIBUIÇÕES === */}
      <section className="pr-section">
        <h2>Contribuições</h2>

        <div className="pr-kpis">
          <div className="pr-kpi">
            <div className="pr-kpi-label">Previsto</div>
            <div className="pr-kpi-value">{brl(totalExpected)}</div>
            <div className="pr-kpi-sub">
              {campaign.participants.length} × {months.length} meses
            </div>
          </div>
          <div className="pr-kpi">
            <div className="pr-kpi-label">Arrecadado</div>
            <div className="pr-kpi-value">{brl(totalReceived)}</div>
            <div className="pr-kpi-sub">{percent}% concluído</div>
          </div>
          <div className="pr-kpi">
            <div className="pr-kpi-label">A receber</div>
            <div className="pr-kpi-value">{brl(outstanding)}</div>
          </div>
          <div className="pr-kpi">
            <div className="pr-kpi-label">Pagamentos confirmados</div>
            <div className="pr-kpi-value">{paidCellsCount}</div>
            <div className="pr-kpi-sub">
              PIX {pixCount} · Dinheiro {cashCount}
            </div>
          </div>
        </div>

        <div className="pr-meta-row">
          <div>
            <span className="pr-meta-label">PIX</span> {campaign.pixKey}
          </div>
          <div>
            <span className="pr-meta-label">Valor mensal</span>{' '}
            {brl(campaign.monthlyValue)}
          </div>
          <div>
            <span className="pr-meta-label">Participantes</span>{' '}
            {campaign.participants.length}
          </div>
          <div>
            <span className="pr-meta-label">Janela</span> dias{' '}
            {campaign.paymentDayStart} a {campaign.paymentDayEnd}
          </div>
        </div>

        {campaign.participants.length > 0 && (
          <ul className="pr-progress" style={{ marginTop: 8 }}>
            {monthlyProgress.map(({ month, paid, pct }) => (
              <li key={month.date.toISOString()}>
                <span className="pr-progress-month">{month.label}</span>
                <span className="pr-progress-bar" aria-hidden="true">
                  <span
                    className="pr-progress-fill"
                    style={{ width: `${pct}%` }}
                  />
                </span>
                <span className="pr-progress-count">
                  {paid}/{campaign.participants.length}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* === BLOCO 2: EVENTOS === */}
      <section className="pr-section">
        <h2>Eventos</h2>

        <div className="pr-kpis">
          <div className="pr-kpi">
            <div className="pr-kpi-label">Despesas</div>
            <div className="pr-kpi-value">{brl(summary.eventsExpense)}</div>
          </div>
          <div className="pr-kpi">
            <div className="pr-kpi-label">Receitas</div>
            <div className="pr-kpi-value">{brl(summary.eventsIncome)}</div>
          </div>
          <div className="pr-kpi">
            <div className="pr-kpi-label">Resultado</div>
            <div
              className="pr-kpi-value"
              style={{
                color: summary.eventsNet >= 0 ? COLOR_POSITIVE : COLOR_NEGATIVE,
              }}
            >
              {summary.eventsNet >= 0 ? '+' : ''}
              {brl(summary.eventsNet)}
            </div>
            <div className="pr-kpi-sub">
              {summary.eventsNet >= 0 ? 'Lucro' : 'Prejuízo'}
            </div>
          </div>
          <div className="pr-kpi">
            <div className="pr-kpi-label">Eventos</div>
            <div className="pr-kpi-value">{events.length}</div>
          </div>
        </div>

        {eventRows.length === 0 ? (
          <p className="pr-muted" style={{ marginTop: 8 }}>
            Nenhum evento cadastrado ainda.
          </p>
        ) : (
          <ul className="pr-list pr-list-compact" style={{ marginTop: 8 }}>
            {eventRows.map((e) => (
              <li key={e.id}>
                <strong>{e.name}</strong>
                <span className="pr-muted">
                  {' '}·{' '}
                  {e.eventDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                </span>
                <div className="pr-list-sub">
                  {statusLabel[e.status]} ·{' '}
                  <span
                    style={{
                      color: e.net >= 0 ? COLOR_POSITIVE : COLOR_NEGATIVE,
                      fontWeight: 600,
                    }}
                  >
                    {e.net >= 0 ? '+' : ''}
                    {brl(e.net)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* === BLOCO 3: CONSOLIDADO === */}
      <section className="pr-section">
        <h2>Contribuições + eventos</h2>

        <div className="pr-kpis">
          <div className="pr-kpi">
            <div className="pr-kpi-label">Contribuído</div>
            <div className="pr-kpi-value">
              {brl(summary.contributionsReceived)}
            </div>
          </div>
          <div className="pr-kpi">
            <div className="pr-kpi-label">Despesas eventos</div>
            <div className="pr-kpi-value">{brl(summary.eventsExpense)}</div>
          </div>
          <div className="pr-kpi">
            <div className="pr-kpi-label">Receitas eventos</div>
            <div className="pr-kpi-value">{brl(summary.eventsIncome)}</div>
          </div>
          <div
            className="pr-kpi"
            style={{ background: '#f4f4f5', borderColor: '#a1a1aa' }}
          >
            <div className="pr-kpi-label">Saldo do caixa</div>
            <div
              className="pr-kpi-value"
              style={{
                color:
                  summary.cashBalance >= 0 ? COLOR_NEUTRAL : COLOR_NEGATIVE,
              }}
            >
              {brl(summary.cashBalance)}
            </div>
          </div>
        </div>

        {monthlyBalances.length > 0 && (
          <ul className="pr-progress" style={{ marginTop: 8 }}>
            {monthlyBalances.map((m) => {
              const positive = m.balance >= 0;
              const pct = (Math.abs(m.balance) / maxAbsBalance) * 100;
              return (
                <li key={m.month.toISOString()}>
                  <span className="pr-progress-month">
                    {m.month.toLocaleDateString('pt-BR', {
                      month: 'short',
                      year: '2-digit',
                      timeZone: 'UTC',
                    })}
                  </span>
                  <span className="pr-progress-bar" aria-hidden="true">
                    <span
                      className="pr-progress-fill"
                      style={{
                        width: `${pct}%`,
                        background: positive ? COLOR_POSITIVE : COLOR_NEGATIVE,
                      }}
                    />
                  </span>
                  <span
                    className="pr-progress-count"
                    style={{ color: positive ? COLOR_NEUTRAL : COLOR_NEGATIVE }}
                  >
                    {positive ? '+' : ''}
                    {brl(m.balance)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <footer className="pr-footer-summary">
        <span>
          Saldo do caixa: <strong>{brl(summary.cashBalance)}</strong>
        </span>
        <span className="pr-sep">·</span>
        <span>
          Resultado eventos:{' '}
          <strong>
            {summary.eventsNet >= 0 ? '+' : ''}
            {brl(summary.eventsNet)}
          </strong>
        </span>
        <span className="pr-sep">·</span>
        <span>
          <strong>{paidCellsCount}</strong> pagamentos
        </span>
        <span className="pr-sep">·</span>
        <span>
          PIX <strong>{pixCount}</strong> · Dinheiro <strong>{cashCount}</strong>
        </span>
      </footer>
    </div>
  );
}
