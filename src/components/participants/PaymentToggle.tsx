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
      aria-label={display.ariaLabel}
      className={`inline-flex items-center justify-center min-w-[42px] min-h-[32px] px-1.5 py-1 rounded-md border text-xs cursor-pointer transition-all duration-200 ease-in-out hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${display.classes}`}
    >
      {isLoading ? (
        <span className="size-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      ) : (
        display.label
      )}
    </button>
  );
}
