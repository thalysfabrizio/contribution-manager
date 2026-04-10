import { Card } from '@/components/ui/Card';
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
    <Card className="p-4 md:p-6">
      <h2 className="text-base font-semibold text-text-primary mb-4">Métodos de Pagamento</h2>
      {total === 0 ? (
        <p className="text-sm text-text-muted">Nenhum pagamento registrado.</p>
      ) : (
        <div className="space-y-4">
          <div className="h-3 bg-border rounded-full overflow-hidden flex">
            <div
              className="h-full bg-success transition-all duration-500"
              style={{ width: `${pixPct}%` }}
            />
            <div
              className="h-full bg-info transition-all duration-500"
              style={{ width: `${cashPct}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-success" />
              <span className="text-text-secondary">PIX</span>
              <span className="text-text-primary font-medium">
                {pixCount} ({pixPct}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-info" />
              <span className="text-text-secondary">Dinheiro</span>
              <span className="text-text-primary font-medium">
                {cashCount} ({cashPct}%)
              </span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
