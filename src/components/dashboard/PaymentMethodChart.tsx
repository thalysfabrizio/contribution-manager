import { Card } from '@/components/ui/Card';
import { CreditCard } from 'lucide-react';
import type { CampaignData } from '@/types';

interface PaymentMethodChartProps {
  participants: CampaignData['participants'];
}

export function PaymentMethodChart({ participants }: PaymentMethodChartProps) {
  let pixCount = 0;
  let cashCount = 0;

  participants.forEach((p) => {
    p.payments.forEach((pay) => {
      if (pay.status === 'PAID_PIX') pixCount++;
      if (pay.status === 'PAID_CASH') cashCount++;
    });
  });

  const total = pixCount + cashCount;
  const pixPct = total > 0 ? Math.round((pixCount / total) * 100) : 0;
  const cashPct = total > 0 ? Math.round((cashCount / total) * 100) : 0;

  return (
    <Card className="p-4 md:p-5">
      <h2 className="text-sm font-semibold text-text-primary mb-4">Métodos de Pagamento</h2>
      {total === 0 ? (
        <div className="flex flex-col items-center py-6 text-text-muted">
          <CreditCard size={24} className="mb-2 opacity-50" aria-hidden="true" />
          <p className="text-sm">Nenhum pagamento registrado.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="h-2.5 bg-border rounded-full overflow-hidden flex">
            <div
              className="h-full bg-success rounded-l-full transition-all duration-700 ease-out"
              style={{ width: `${pixPct}%` }}
            />
            <div
              className="h-full bg-info rounded-r-full transition-all duration-700 ease-out"
              style={{ width: `${cashPct}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-success" aria-hidden="true" />
              <span className="text-text-secondary">PIX</span>
              <span className="text-text-primary font-medium tabular-nums">
                {pixCount} ({pixPct}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-info" aria-hidden="true" />
              <span className="text-text-secondary">Dinheiro</span>
              <span className="text-text-primary font-medium tabular-nums">
                {cashCount} ({cashPct}%)
              </span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
