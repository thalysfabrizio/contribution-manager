'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
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

const YEAR_GRID_SIZE = 12;
const POPOVER_GAP = 6;

function parseValue(value: string): { year: number; month: number } | null {
  const m = /^(\d{4})-(\d{2})$/.exec(value);
  if (!m) return null;
  return { year: parseInt(m[1], 10), month: parseInt(m[2], 10) };
}

export function MonthYearPicker({ name, label, value, onChange, required }: MonthYearPickerProps) {
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'months' | 'years'>('months');
  const [pos, setPos] = useState<{ left: number; top: number; width: number } | null>(null);

  const parsed = parseValue(value);
  const today = new Date();
  const [navYear, setNavYear] = useState(parsed?.year ?? today.getUTCFullYear());
  const [yearGridStart, setYearGridStart] = useState(
    Math.floor((parsed?.year ?? today.getUTCFullYear()) / YEAR_GRID_SIZE) * YEAR_GRID_SIZE,
  );

  useLayoutEffect(() => {
    if (!open) return;
    function computePosition() {
      if (!triggerRef.current || !popoverRef.current) return;
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const popoverHeight = popoverRef.current.offsetHeight;
      const spaceAbove = triggerRect.top;
      const goesUp = spaceAbove >= popoverHeight + POPOVER_GAP;
      const top = goesUp
        ? triggerRect.top - popoverHeight - POPOVER_GAP
        : triggerRect.bottom + POPOVER_GAP;
      setPos({ left: triggerRect.left, top, width: triggerRect.width });
    }
    computePosition();
    const onScroll = () => setOpen(false);
    window.addEventListener('resize', computePosition);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('resize', computePosition);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open, view]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  useEscape(() => {
    if (view === 'years') setView('months');
    else setOpen(false);
  }, open);

  const selectMonth = (month: number) => {
    const monthStr = String(month).padStart(2, '0');
    onChange(`${navYear}-${monthStr}`);
    setOpen(false);
  };

  const selectYear = (year: number) => {
    setNavYear(year);
    setView('months');
  };

  const triggerLabel = parsed
    ? `${MONTH_LONG[parsed.month - 1]} ${parsed.year}`
    : 'Selecione';

  const isMonthSelected = (m: number) => parsed?.year === navYear && parsed?.month === m;
  const isMonthCurrent = (m: number) =>
    today.getUTCFullYear() === navYear && today.getUTCMonth() + 1 === m;
  const isYearSelected = (y: number) => parsed?.year === y;
  const isYearCurrent = (y: number) => today.getUTCFullYear() === y;

  const years = Array.from({ length: YEAR_GRID_SIZE }, (_, i) => yearGridStart + i);

  const popover = (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label={`${label} — selecionar mês e ano`}
      style={pos ? { position: 'fixed', left: pos.left, top: pos.top, width: pos.width } : { position: 'fixed', visibility: 'hidden' }}
      className="z-50 bg-card border border-border rounded-xl shadow-xl p-3 animate-slide-down"
    >
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() =>
            view === 'months'
              ? setNavYear(navYear - 1)
              : setYearGridStart(yearGridStart - YEAR_GRID_SIZE)
          }
          className="size-8 inline-flex items-center justify-center rounded-md text-text-secondary hover:text-text-primary hover:bg-card-hover transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
          aria-label={view === 'months' ? 'Ano anterior' : 'Década anterior'}
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => setView(view === 'months' ? 'years' : 'months')}
          className="px-3 py-1 rounded-md text-sm font-semibold text-text-primary tabular-nums hover:bg-card-hover transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
          aria-label={view === 'months' ? 'Selecionar ano' : 'Voltar para meses'}
        >
          {view === 'months'
            ? navYear
            : `${yearGridStart} – ${yearGridStart + YEAR_GRID_SIZE - 1}`}
        </button>
        <button
          type="button"
          onClick={() =>
            view === 'months'
              ? setNavYear(navYear + 1)
              : setYearGridStart(yearGridStart + YEAR_GRID_SIZE)
          }
          className="size-8 inline-flex items-center justify-center rounded-md text-text-secondary hover:text-text-primary hover:bg-card-hover transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
          aria-label={view === 'months' ? 'Próximo ano' : 'Próxima década'}
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
      {view === 'months' ? (
        <div className="grid grid-cols-3 gap-1.5">
          {MONTH_LABELS.map((m, i) => {
            const month = i + 1;
            const selected = isMonthSelected(month);
            const current = isMonthCurrent(month);
            return (
              <button
                key={m}
                type="button"
                onClick={() => selectMonth(month)}
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
      ) : (
        <div className="grid grid-cols-3 gap-1.5">
          {years.map((y) => {
            const selected = isYearSelected(y);
            const current = isYearCurrent(y);
            return (
              <button
                key={y}
                type="button"
                onClick={() => selectYear(y)}
                aria-current={current ? 'date' : undefined}
                className={`min-h-[40px] rounded-md text-sm font-medium tabular-nums transition-all focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${
                  selected
                    ? 'bg-primary text-primary-fg'
                    : current
                      ? 'bg-primary/10 text-primary-text'
                      : 'text-text-secondary hover:text-text-primary hover:bg-card-hover'
                }`}
              >
                {y}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-text-secondary">
        {label}
      </label>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        onClick={() => {
          if (!open) {
            if (parsed) {
              setNavYear(parsed.year);
              setYearGridStart(Math.floor(parsed.year / YEAR_GRID_SIZE) * YEAR_GRID_SIZE);
            }
            setView('months');
          }
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

      {open && typeof document !== 'undefined' && createPortal(popover, document.body)}
    </div>
  );
}
