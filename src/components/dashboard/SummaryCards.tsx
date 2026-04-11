import { Card } from '@/components/ui/Card';
import { TrendingUp, Target, CheckCircle, Clock } from 'lucide-react';
import type { CampaignData } from '@/types';
import type { MonthEntry } from '@/lib/months';
import { isSameMonth, isCurrentMonth } from '@/lib/months';

const iconBgMap: Record<string, string> = {
  'text-success': 'bg-success-bg',
  'text-primary': 'bg-primary/10',
  'text-warning': 'bg-warning-bg',
  'text-info': 'bg-info-bg',
  'text-danger': 'bg-danger-bg',
};

interface SummaryCardsProps {
  data: CampaignData;
  months: MonthEntry[];
}

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

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

  const cards = [
    {
      label: 'Arrecadado',
      value: formatCurrency(totalCollected),
      sub: `${progressPct}% da meta`,
      icon: TrendingUp,
      color: 'text-success' as const,
      progress: progressPct,
    },
    {
      label: 'Meta Total',
      value: formatCurrency(totalGoal),
      sub: `${data.participants.length} x ${months.length} meses`,
      icon: Target,
      color: 'text-primary' as const,
    },
    {
      label: 'Em dia',
      value: String(paidThisMonth),
      sub: `de ${data.participants.length} no mês`,
      icon: CheckCircle,
      color: 'text-success' as const,
    },
    {
      label: 'Pendentes',
      value: String(pendingThisMonth),
      sub: `de ${data.participants.length} no mês`,
      icon: Clock,
      color: 'text-warning' as const,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 animate-stagger">
      {cards.map((card) => (
        <Card key={card.label} className="p-4 md:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs md:text-sm text-text-muted font-medium">{card.label}</span>
            <div className={`size-9 rounded-full flex items-center justify-center ${iconBgMap[card.color] ?? 'bg-card-hover'}`}>
              <card.icon size={18} className={card.color} aria-hidden="true" />
            </div>
          </div>
          <span className="block text-xl md:text-2xl font-bold text-text-primary leading-tight">
            {card.value}
          </span>
          {card.progress !== undefined && (
            <div className="mt-2.5 h-2.5 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-success rounded-full transition-all duration-700 ease-out"
                style={{ width: `${card.progress}%` }}
                role="progressbar"
                aria-valuenow={card.progress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          )}
          <span className="text-sm text-text-muted mt-1.5 block">{card.sub}</span>
        </Card>
      ))}
    </div>
  );
}
