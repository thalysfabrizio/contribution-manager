import { Card } from '@/components/ui/Card';
import { isSameMonth } from '@/lib/months';
import type { CampaignData } from '@/types';
import type { MonthEntry } from '@/lib/months';

interface MonthlyProgressProps {
  participants: CampaignData['participants'];
  months: MonthEntry[];
}

export function MonthlyProgress({ participants, months }: MonthlyProgressProps) {
  const total = participants.length;

  return (
    <Card className="p-4 md:p-6">
      <h2 className="text-base font-semibold text-text-primary mb-4">Progresso por Mês</h2>
      <div className="space-y-3">
        {months.map((m) => {
          const paidCount = participants.filter((p) =>
            p.payments.some(
              (pay) =>
                isSameMonth(pay.month, m.date) &&
                (pay.status === 'PAID_PIX' || pay.status === 'PAID_CASH'),
            ),
          ).length;
          const pct = total > 0 ? Math.round((paidCount / total) * 100) : 0;

          return (
            <div key={m.date.toISOString()} className="flex items-center gap-3">
              <span className="text-xs text-text-secondary w-16 shrink-0">{m.label}</span>
              <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs text-text-muted w-16 text-right">
                {paidCount}/{total} ({pct}%)
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
