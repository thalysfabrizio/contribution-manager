'use client';

import { useEffect, useRef } from 'react';
import { Pencil, MessageCircle, Trash2 } from 'lucide-react';
import { PaymentToggle } from './PaymentToggle';
import { isSameMonth, isCurrentMonth } from '@/lib/months';
import type { CampaignData, PaymentStatus } from '@/types';
import type { MonthEntry } from '@/lib/months';

interface ParticipantCardProps {
  participant: CampaignData['participants'][number];
  months: MonthEntry[];
  isEnded: boolean;
  isHighlighted?: boolean;
  onToggle: (participantId: string, monthDate: Date, newStatus: PaymentStatus) => void;
  onEdit: (participant: CampaignData['participants'][number]) => void;
  onMessage: (participant: CampaignData['participants'][number]) => void;
  onDelete: (id: string, name: string) => void;
}

export function ParticipantCard({
  participant: p,
  months,
  isEnded,
  isHighlighted,
  onToggle,
  onEdit,
  onMessage,
  onDelete,
}: ParticipantCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isHighlighted && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isHighlighted]);

  const paidCount = p.payments.filter(
    (pay) => pay.status === 'PAID_PIX' || pay.status === 'PAID_CASH',
  ).length;
  const progressPct = months.length > 0 ? Math.round((paidCount / months.length) * 100) : 0;

  return (
    <div
      ref={cardRef}
      className={`bg-card border border-border rounded-xl shadow-sm shadow-black/5 p-4 space-y-3 ${
        isHighlighted ? 'card-highlight' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="font-medium text-text-primary truncate">{p.person.name}</div>
          <div className="text-sm text-text-muted mt-0.5">{p.person.phone || '—'}</div>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-2 bg-border rounded-full overflow-hidden max-w-[140px]">
              <div
                className="h-full bg-primary/60 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-xs text-text-muted tabular-nums">
              {paidCount}/{months.length}
            </span>
          </div>
        </div>
        {!isEnded && (
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={() => onEdit(p)}
              className="size-11 inline-flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-card-hover transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
              aria-label={`Editar ${p.person.name}`}
            >
              <Pencil size={18} aria-hidden="true" />
            </button>
            {p.person.phone && (
              <button
                onClick={() => onMessage(p)}
                className="size-11 inline-flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-card-hover transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
                aria-label={`Enviar mensagem para ${p.person.name}`}
              >
                <MessageCircle size={18} aria-hidden="true" />
              </button>
            )}
            <button
              onClick={() => onDelete(p.id, p.person.name)}
              className="size-11 inline-flex items-center justify-center rounded-lg text-danger/60 hover:text-danger hover:bg-danger-bg transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
              aria-label={`Excluir ${p.person.name}`}
            >
              <Trash2 size={18} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-border">
        {months.map((m) => {
          const payment = p.payments.find((pay) => isSameMonth(pay.month, m.date));
          const status = payment?.status;
          return (
            <div key={m.date.toISOString()} className="flex flex-col items-center gap-1">
              <span
                className={`text-xs tabular-nums ${
                  isCurrentMonth(m.date) ? 'text-primary font-medium' : 'text-text-muted'
                }`}
              >
                {m.label}
              </span>
              <PaymentToggle
                status={status}
                isLoading={false}
                isDisabled={isEnded}
                onSelect={(newStatus) => onToggle(p.id, m.date, newStatus)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
