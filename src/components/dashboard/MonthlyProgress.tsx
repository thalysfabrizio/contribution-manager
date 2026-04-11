import { Card } from '@/components/ui/Card';
import { isSameMonth, isCurrentMonth } from '@/lib/months';
import type { CampaignData } from '@/types';
import type { MonthEntry } from '@/lib/months';

interface MonthlyProgressProps {
  participants: CampaignData['participants'];
  months: MonthEntry[];
}

export function MonthlyProgress({ participants, months }: MonthlyProgressProps) {
  const total = participants.length;

  return (
    <Card className="p-5 md:p-6">
      <h2 className="text-base font-semibold text-text-primary mb-5">Progresso por Mês</h2>
      <div className="space-y-2.5">
        {months.map((m) => {
          const paidCount = participants.filter((p) =>
            p.payments.some(
              (pay) =>
                isSameMonth(pay.month, m.date) &&
                (pay.status === 'PAID_PIX' || pay.status === 'PAID_CASH'),
            ),
          ).length;
          const pct = total > 0 ? Math.round((paidCount / total) * 100) : 0;
          const isCurrent = isCurrentMonth(m.date);

          return (
            <div
              key={m.date.toISOString()}
              className={`flex items-center gap-3 py-1 rounded ${isCurrent ? 'bg-primary/5 px-2 -mx-2' : ''}`}
            >
              <span className={`text-sm w-16 shrink-0 ${isCurrent ? 'text-primary font-medium' : 'text-text-secondary'}`}>
                {m.label}
              </span>
              <div className="flex-1 h-2.5 bg-border rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${isCurrent ? 'bg-primary' : 'bg-primary/60'}`}
                  style={{ width: `${pct}%` }}
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${m.label}: ${paidCount} de ${total}`}
                />
              </div>
              <span className="text-sm text-text-muted w-20 text-right tabular-nums">
                {paidCount}/{total} ({pct}%)
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
