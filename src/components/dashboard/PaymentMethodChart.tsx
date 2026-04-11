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
    <Card className="p-5 md:p-6">
      <h2 className="text-base font-semibold text-text-primary mb-5">Métodos de Pagamento</h2>
      {total === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <div className="size-14 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center mb-3">
            <CreditCard size={24} className="text-primary/60" aria-hidden="true" />
          </div>
          <p className="text-sm text-text-muted">Nenhum pagamento registrado ainda.</p>
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
