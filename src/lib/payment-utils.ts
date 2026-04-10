import type { PaymentStatus } from '@/types';

export const PAYMENT_CYCLE: PaymentStatus[] = ['PAID_PIX', 'PAID_CASH', 'LATE', 'PENDING'];

export function getNextStatus(current?: PaymentStatus): PaymentStatus {
  if (!current || current === 'PENDING') return 'PAID_PIX';
  const idx = PAYMENT_CYCLE.indexOf(current);
  return PAYMENT_CYCLE[(idx + 1) % PAYMENT_CYCLE.length];
}

export function getStatusDisplay(status?: PaymentStatus) {
  switch (status) {
    case 'PAID_PIX':
      return { label: 'PIX', classes: 'bg-success-bg border-success text-success font-semibold' };
    case 'PAID_CASH':
      return { label: '$', classes: 'bg-info-bg border-info text-info font-semibold' };
    case 'LATE':
      return { label: '!', classes: 'bg-warning-bg border-warning text-warning font-semibold' };
    default:
      return { label: '-', classes: 'bg-transparent border-border text-text-muted' };
  }
}
