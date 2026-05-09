import { Card } from '@/components/ui/Card';
import { brl } from '@/lib/format';
import type {
  CampaignFinancialSummary,
  MonthlyBreakdown,
} from '@/lib/queries';

interface ConsolidatedSectionProps {
  summary: CampaignFinancialSummary;
  monthly: MonthlyBreakdown[];
}

export function ConsolidatedSection({
  summary,
  monthly,
}: ConsolidatedSectionProps) {
  const balancePositive = summary.cashBalance >= 0;

  const monthlyBalances = monthly.map((m) => ({
    month: m.month,
    balance: m.contributions + m.eventsNet,
  }));
  const maxAbsBalance = Math.max(
    ...monthlyBalances.map((m) => Math.abs(m.balance)),
    1,
  );

  return (
    <section aria-labelledby="consolidated-heading" className="space-y-4">
      <div className="border-b border-border pb-2">
        <h2
          id="consolidated-heading"
          className="text-xs font-bold tracking-wider uppercase text-text-muted"
        >
          Contribuições + eventos
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="p-4 md:p-5">
          <span className="text-xs text-text-muted font-medium uppercase tracking-wide">
            Contribuído
          </span>
          <p className="text-xl md:text-2xl font-bold text-text-primary mt-1">
            {brl(summary.contributionsReceived)}
          </p>
        </Card>
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
        <Card
          className="p-4 md:p-5 border-2"
          style={{ borderColor: 'var(--color-primary, #8b5cf6)' }}
        >
          <span className="text-xs font-bold uppercase tracking-wide text-primary">
            Saldo do caixa
          </span>
          <p
            className={`text-2xl md:text-3xl font-bold mt-1 ${balancePositive ? 'text-text-primary' : 'text-danger'}`}
          >
            {brl(summary.cashBalance)}
          </p>
          <p className="text-xs text-text-muted mt-1">
            Resultado eventos:{' '}
            <span
              className={summary.eventsNet >= 0 ? 'text-success' : 'text-danger'}
            >
              {summary.eventsNet >= 0 ? '+' : ''}
              {brl(summary.eventsNet)}
            </span>
          </p>
        </Card>
      </div>

      {monthlyBalances.length > 0 && (
        <Card className="p-4 md:p-5">
          <h3 className="text-sm font-semibold text-text-secondary mb-3">
            Saldo por mês
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {monthlyBalances.map((m) => {
              const positive = m.balance >= 0;
              const pct = (Math.abs(m.balance) / maxAbsBalance) * 100;
              return (
                <li
                  key={m.month.toISOString()}
                  className="grid grid-cols-[60px_1fr_90px] items-center gap-2"
                >
                  <span className="text-text-secondary capitalize text-xs">
                    {m.month.toLocaleDateString('pt-BR', {
                      month: 'short',
                      year: '2-digit',
                      timeZone: 'UTC',
                    })}
                  </span>
                  <span className="h-2 bg-border rounded-full overflow-hidden">
                    <span
                      className={`block h-full rounded-full transition-all ${positive ? 'bg-success' : 'bg-danger'}`}
                      style={{ width: `${pct}%` }}
                      role="progressbar"
                      aria-valuenow={Math.round(pct)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </span>
                  <span
                    className={`text-right text-xs tabular-nums font-medium ${positive ? 'text-text-primary' : 'text-danger'}`}
                  >
                    {positive ? '+' : ''}
                    {brl(m.balance)}
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </section>
  );
}
