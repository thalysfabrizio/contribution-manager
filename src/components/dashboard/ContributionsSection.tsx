import { Card } from '@/components/ui/Card';
import { brl } from '@/lib/format';
import { getMonthsFromRange, isSameMonth } from '@/lib/months';
import type { CampaignData } from '@/types';

interface ContributionsSectionProps {
  campaign: CampaignData;
}

export function ContributionsSection({ campaign }: ContributionsSectionProps) {
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

  return (
    <section aria-labelledby="contributions-heading" className="space-y-4">
      <div className="border-b border-border pb-2">
        <h2
          id="contributions-heading"
          className="text-xs font-bold tracking-wider uppercase text-text-muted"
        >
          Contribuições
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="p-4 md:p-5">
          <span className="text-xs text-text-muted font-medium uppercase tracking-wide">
            Previsto
          </span>
          <p className="text-xl md:text-2xl font-bold text-text-primary mt-1">
            {brl(totalExpected)}
          </p>
          <p className="text-xs text-text-muted mt-1">
            {campaign.participants.length} × {months.length} meses
          </p>
        </Card>
        <Card className="p-4 md:p-5">
          <span className="text-xs text-text-muted font-medium uppercase tracking-wide">
            Arrecadado
          </span>
          <p className="text-xl md:text-2xl font-bold text-success mt-1">
            {brl(totalReceived)}
          </p>
          <p className="text-xs text-text-muted mt-1">{percent}% concluído</p>
        </Card>
        <Card className="p-4 md:p-5">
          <span className="text-xs text-text-muted font-medium uppercase tracking-wide">
            A receber
          </span>
          <p className="text-xl md:text-2xl font-bold text-text-primary mt-1">
            {brl(outstanding)}
          </p>
        </Card>
        <Card className="p-4 md:p-5">
          <span className="text-xs text-text-muted font-medium uppercase tracking-wide">
            Pagamentos
          </span>
          <p className="text-xl md:text-2xl font-bold text-text-primary mt-1">
            {paidCellsCount}
          </p>
          <p className="text-xs text-text-muted mt-1">
            PIX {pixCount} · Dinheiro {cashCount}
          </p>
        </Card>
      </div>

      <Card className="p-3 md:p-4">
        <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <div>
            <dt className="text-xs uppercase font-semibold text-text-muted tracking-wide">
              PIX
            </dt>
            <dd className="text-text-primary">{campaign.pixKey}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase font-semibold text-text-muted tracking-wide">
              Valor mensal
            </dt>
            <dd className="text-text-primary">{brl(campaign.monthlyValue)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase font-semibold text-text-muted tracking-wide">
              Participantes
            </dt>
            <dd className="text-text-primary">{campaign.participants.length}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase font-semibold text-text-muted tracking-wide">
              Janela
            </dt>
            <dd className="text-text-primary">
              dias {campaign.paymentDayStart} a {campaign.paymentDayEnd}
            </dd>
          </div>
        </dl>
      </Card>

      {campaign.participants.length > 0 && (
        <Card className="p-4 md:p-5">
          <h3 className="text-sm font-semibold text-text-secondary mb-3">
            Progresso mensal
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {monthlyProgress.map(({ month, paid, pct }) => (
              <li
                key={month.date.toISOString()}
                className="grid grid-cols-[60px_1fr_50px] items-center gap-2"
              >
                <span className="text-text-secondary capitalize text-xs">
                  {month.label}
                </span>
                <span className="h-2 bg-border rounded-full overflow-hidden">
                  <span
                    className="block h-full bg-success rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                    role="progressbar"
                    aria-valuenow={Math.round(pct)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Progresso de ${month.label}`}
                  />
                </span>
                <span className="text-right text-xs text-text-muted tabular-nums">
                  {paid}/{campaign.participants.length}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </section>
  );
}
