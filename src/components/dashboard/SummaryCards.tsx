import { Card } from '@/components/ui/Card';
import type { CampaignData } from '@/types';
import type { MonthEntry } from '@/lib/months';
import { isSameMonth, isCurrentMonth } from '@/lib/months';

interface SummaryCardsProps {
  data: CampaignData;
  months: MonthEntry[];
}

export function SummaryCards({ data, months }: SummaryCardsProps) {
  const valueInReais = data.monthlyValue / 100;

  const totalCollected = data.participants.reduce((acc, p) => {
    const paid = p.payments.filter((pay) => pay.status === 'PAID_PIX' || pay.status === 'PAID_CASH').length;
    return acc + paid * valueInReais;
  }, 0);

  const totalGoal = data.participants.length * months.length * valueInReais;
  const progressPct = totalGoal > 0 ? Math.round((totalCollected / totalGoal) * 100) : 0;

  const currentMonthEntry = months.find((m) => isCurrentMonth(m.date));
  let paidThisMonth = 0;
  let pendingThisMonth = 0;

  if (currentMonthEntry) {
    data.participants.forEach((p) => {
      const payment = p.payments.find((pay) => isSameMonth(pay.month, currentMonthEntry.date));
      if (payment && (payment.status === 'PAID_PIX' || payment.status === 'PAID_CASH')) {
        paidThisMonth++;
      } else {
        pendingThisMonth++;
      }
    });
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card className="p-3 md:p-4">
        <span className="text-xs text-text-muted">Arrecadado</span>
        <span className="block text-lg font-bold text-text-primary">
          R$ {totalCollected.toFixed(2).replace('.', ',')}
        </span>
        <div className="mt-1 h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-success rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="text-xs text-text-muted">{progressPct}% da meta</span>
      </Card>
      <Card className="p-3 md:p-4">
        <span className="text-xs text-text-muted">Meta Total</span>
        <span className="block text-lg font-bold text-text-primary">
          R$ {totalGoal.toFixed(2).replace('.', ',')}
        </span>
        <span className="text-xs text-text-muted">
          {data.participants.length} x {months.length} meses
        </span>
      </Card>
      <Card className="p-3 md:p-4">
        <span className="text-xs text-text-muted">Em dia (mês atual)</span>
        <span className="block text-lg font-bold text-success">{paidThisMonth}</span>
        <span className="text-xs text-text-muted">de {data.participants.length}</span>
      </Card>
      <Card className="p-3 md:p-4">
        <span className="text-xs text-text-muted">Pendentes (mês atual)</span>
        <span className="block text-lg font-bold text-warning">{pendingThisMonth}</span>
        <span className="text-xs text-text-muted">de {data.participants.length}</span>
      </Card>
    </div>
  );
}
