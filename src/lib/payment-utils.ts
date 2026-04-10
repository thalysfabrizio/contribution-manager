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
      return { label: 'PIX', short: 'P', classes: 'bg-success-bg border-success/40 text-success font-semibold', ariaLabel: 'Pago via PIX' };
    case 'PAID_CASH':
      return { label: 'R$', short: '$', classes: 'bg-info-bg border-info/40 text-info font-semibold', ariaLabel: 'Pago em dinheiro' };
    case 'LATE':
      return { label: 'Atraso', short: '!', classes: 'bg-warning-bg border-warning/40 text-warning font-semibold', ariaLabel: 'Atrasado' };
    default:
      return { label: '—', short: '—', classes: 'bg-transparent border-border text-text-muted hover:border-text-muted', ariaLabel: 'Pendente' };
  }
}
