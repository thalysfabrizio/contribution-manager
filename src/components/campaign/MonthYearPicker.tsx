'use client';

import { useId, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useEscape } from '@/hooks/useEscape';

interface MonthYearPickerProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const MONTH_LABELS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];
const MONTH_LONG = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function parseValue(value: string): { year: number; month: number } | null {
  const m = /^(\d{4})-(\d{2})$/.exec(value);
  if (!m) return null;
  return { year: parseInt(m[1], 10), month: parseInt(m[2], 10) };
}

export function MonthYearPicker({ name, label, value, onChange, required }: MonthYearPickerProps) {
  const id = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const parsed = parseValue(value);
  const today = new Date();
  const [navYear, setNavYear] = useState(parsed?.year ?? today.getUTCFullYear());

  useClickOutside(wrapperRef, () => setOpen(false), open);
  useEscape(() => setOpen(false), open);

  const select = (month: number) => {
    const monthStr = String(month).padStart(2, '0');
    onChange(`${navYear}-${monthStr}`);
    setOpen(false);
  };

  const triggerLabel = parsed
    ? `${MONTH_LONG[parsed.month - 1]} ${parsed.year}`
    : 'Selecione';

  const isSelected = (m: number) => parsed?.year === navYear && parsed?.month === m;
  const isCurrent = (m: number) =>
    today.getUTCFullYear() === navYear && today.getUTCMonth() + 1 === m;

  return (
    <div ref={wrapperRef} className="space-y-1.5 relative">
      <label htmlFor={id} className="block text-sm font-medium text-text-secondary">
        {label}
      </label>
      <button
        id={id}
        type="button"
        onClick={() => {
          if (!open && parsed) setNavYear(parsed.year);
          setOpen(!open);
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 rounded-lg border border-border bg-app px-3 py-2.5 text-base text-text-primary transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
      >
        <span className={parsed ? '' : 'text-text-muted'}>{triggerLabel}</span>
        <Calendar size={16} className="text-text-muted" aria-hidden="true" />
      </button>
      <input type="hidden" name={name} value={value} required={required} />

      {open && (
        <div
          role="dialog"
          aria-label={`${label} — selecionar mês e ano`}
          className="absolute z-30 mt-1.5 w-72 bg-card border border-border rounded-xl shadow-xl p-3 animate-slide-down"
        >
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setNavYear(navYear - 1)}
              className="size-8 inline-flex items-center justify-center rounded-md text-text-secondary hover:text-text-primary hover:bg-card-hover transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
              aria-label="Ano anterior"
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            <span className="text-sm font-semibold text-text-primary tabular-nums">{navYear}</span>
            <button
              type="button"
              onClick={() => setNavYear(navYear + 1)}
              className="size-8 inline-flex items-center justify-center rounded-md text-text-secondary hover:text-text-primary hover:bg-card-hover transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
              aria-label="Próximo ano"
            >
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {MONTH_LABELS.map((m, i) => {
              const month = i + 1;
              const selected = isSelected(month);
              const current = isCurrent(month);
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => select(month)}
                  aria-current={current ? 'date' : undefined}
                  className={`min-h-[40px] rounded-md text-sm font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${
                    selected
                      ? 'bg-primary text-primary-fg'
                      : current
                        ? 'bg-primary/10 text-primary-text'
                        : 'text-text-secondary hover:text-text-primary hover:bg-card-hover'
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
