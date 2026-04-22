'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { getStatusDisplay } from '@/lib/payment-utils';
import { PAYMENT_OPTIONS } from '@/lib/payment-utils';
import type { PaymentStatus } from '@/types';

interface PaymentToggleProps {
  status?: PaymentStatus;
  isLoading: boolean;
  isDisabled: boolean;
  onSelect: (newStatus: PaymentStatus) => void;
}

export function PaymentToggle({ status, isLoading, isDisabled, onSelect }: PaymentToggleProps) {
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState<'down' | 'up'>('down');
  const ref = useRef<HTMLDivElement>(null);
  const display = getStatusDisplay(status);

  const close = useCallback(() => setOpen(false), []);

  const toggle = () => {
    if (isDisabled || isLoading) return;
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const MENU_HEIGHT = 200;
      setDirection(spaceBelow < MENU_HEIGHT && spaceAbove > spaceBelow ? 'up' : 'down');
    }
    setOpen(!open);
  };

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, close]);

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        onClick={toggle}
        disabled={isLoading || isDisabled}
        title={isDisabled ? 'Campanha encerrada' : 'Clique para alterar'}
        aria-label={display.ariaLabel}
        aria-haspopup="true"
        aria-expanded={open}
        className={`inline-flex items-center justify-center min-w-[48px] min-h-[44px] px-2 py-1.5 rounded-lg border text-sm font-medium cursor-pointer transition-all duration-200 ease-in-out hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${display.classes}`}
      >
        {isLoading ? (
          <span className="size-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
        ) : (
          display.label
        )}
      </button>
      {open && (
        <div
          className={`absolute left-1/2 -translate-x-1/2 bg-card border border-border rounded-xl shadow-xl py-1.5 z-30 min-w-[140px] ${
            direction === 'up'
              ? 'bottom-full mb-1.5 animate-slide-up'
              : 'top-full mt-1.5 animate-slide-down'
          }`}
          role="menu"
        >
          {PAYMENT_OPTIONS.map((opt) => (
            <button
              key={opt.status}
              role="menuitem"
              onClick={() => {
                onSelect(opt.status);
                close();
              }}
              className={`flex items-center gap-2.5 w-full px-3 py-2.5 text-sm transition-colors rounded-lg mx-0 ${
                status === opt.status
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-text-secondary hover:text-text-primary hover:bg-card-hover'
              }`}
            >
              <span className={`size-2.5 rounded-full ${opt.dot}`} aria-hidden="true" />
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
