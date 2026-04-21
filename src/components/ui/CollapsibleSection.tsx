'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface CollapsibleSectionProps {
  id: string;
  title: string;
  defaultOpen?: boolean;
  headerExtra?: React.ReactNode;
  className?: string;
  /** Modo controlado: se fornecido, o componente deixa de usar localStorage. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const STORAGE_PREFIX = 'cm:collapse:';

export function CollapsibleSection({
  id,
  title,
  defaultOpen = true,
  headerExtra,
  className = '',
  open: controlledOpen,
  onOpenChange,
  children,
}: CollapsibleSectionProps) {
  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const headerId = useId();
  const panelId = useId();
  const rootRef = useRef<HTMLElement>(null);

  // Hidratação: lê preferência do usuário do localStorage após mount (evita SSR mismatch).
  // Só quando em modo não-controlado.
  useEffect(() => {
    if (isControlled || typeof window === 'undefined') return;
    try {
      const saved = window.localStorage.getItem(`${STORAGE_PREFIX}${id}`);
      if (saved === 'open') setUncontrolledOpen(true);
      else if (saved === 'closed') setUncontrolledOpen(false);
    } catch {
      /* localStorage indisponível — mantém defaultOpen */
    }
  }, [id, isControlled]);

  // Abrir automaticamente se o hash apontar pra esta seção (links #templates, #leaders etc).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.replace('#', '');
    if (hash && hash === id) {
      if (isControlled) {
        onOpenChange?.(true);
      } else {
        setUncontrolledOpen(true);
      }
      requestAnimationFrame(() => rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  }, [id, isControlled, onOpenChange]);

  const toggle = () => {
    const next = !isOpen;
    if (isControlled) {
      onOpenChange?.(next);
      return;
    }
    setUncontrolledOpen(next);
    try {
      window.localStorage.setItem(`${STORAGE_PREFIX}${id}`, next ? 'open' : 'closed');
    } catch {
      /* ignora */
    }
  };

  return (
    <section
      ref={rootRef}
      id={id}
      className={`bg-card border border-border rounded-xl overflow-hidden shadow-sm shadow-black/5 scroll-mt-20 ${className}`}
      aria-labelledby={headerId}
    >
      <div className="flex items-center">
        <button
          id={headerId}
          type="button"
          onClick={toggle}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="flex-1 flex items-center justify-between gap-3 px-5 md:px-6 py-4 md:py-5 text-left hover:bg-card-hover/50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
        >
          <h2 className="text-base font-semibold text-text-primary">{title}</h2>
          <ChevronDown
            size={18}
            className={`text-text-muted shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </button>
        {headerExtra && (
          <div className="shrink-0 pr-5 md:pr-6 flex items-center">{headerExtra}</div>
        )}
      </div>
      <div
        id={panelId}
        role="region"
        aria-labelledby={headerId}
        className="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
        style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="px-5 md:px-6 pb-5 md:pb-6">{children}</div>
        </div>
      </div>
    </section>
  );
}
