'use client';

import { getStatusDisplay } from '@/lib/payment-utils';
import type { PaymentStatus } from '@/types';

interface PaymentToggleProps {
  status?: PaymentStatus;
  isLoading: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

export function PaymentToggle({ status, isLoading, isDisabled, onClick }: PaymentToggleProps) {
  const display = getStatusDisplay(status);

  return (
    <button
      onClick={onClick}
      disabled={isLoading || isDisabled}
      title={isDisabled ? 'Campanha encerrada' : 'Clique para alterar'}
      className={`w-full px-1 py-1 rounded border text-xs cursor-pointer transition-all duration-200 ease-in-out hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${display.classes}`}
    >
      {isLoading ? '...' : display.label}
    </button>
  );
}
