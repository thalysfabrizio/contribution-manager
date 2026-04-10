'use client';

import { Pencil, MessageCircle, Trash2 } from 'lucide-react';
import { PaymentToggle } from './PaymentToggle';
import { isSameMonth, isCurrentMonth } from '@/lib/months';
import type { CampaignData, PaymentStatus } from '@/types';
import type { MonthEntry } from '@/lib/months';

interface ParticipantRowProps {
  participant: CampaignData['participants'][number];
  months: MonthEntry[];
  isEnded: boolean;
  loadingId: string | null;
  onToggle: (participantId: string, monthDate: Date, currentStatus?: PaymentStatus) => void;
  onEdit: (participant: CampaignData['participants'][number]) => void;
  onMessage: (participant: CampaignData['participants'][number]) => void;
  onDelete: (id: string, name: string) => void;
}

export function ParticipantRow({
  participant: p,
  months,
  isEnded,
  loadingId,
  onToggle,
  onEdit,
  onMessage,
  onDelete,
}: ParticipantRowProps) {
  const paidCount = p.payments.filter(
    (pay) => pay.status === 'PAID_PIX' || pay.status === 'PAID_CASH',
  ).length;
  const progressPct = months.length > 0 ? Math.round((paidCount / months.length) * 100) : 0;

  return (
    <tr className="border-b border-border hover:bg-card-hover/30 transition-colors duration-150 group">
      <td className="p-3 md:p-4 sticky left-0 bg-card z-10 shadow-[4px_0_6px_-1px_rgba(0,0,0,0.3)] group-hover:bg-card-hover/30 transition-colors">
        <div className="font-medium text-text-primary text-sm">{p.person.name}</div>
        <div className="text-xs text-text-muted mt-0.5">{p.person.phone || '—'}</div>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-1 bg-border rounded-full overflow-hidden max-w-[60px]">
            <div
              className="h-full bg-primary/60 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs text-text-muted tabular-nums">{paidCount}/{months.length}</span>
        </div>
      </td>
      {months.map((m) => {
        const payment = p.payments.find((pay) => isSameMonth(pay.month, m.date));
        const status = payment?.status;
        const cellId = `${p.id}-${m.date.toISOString()}`;
        const isLoading = loadingId === cellId;
        return (
          <td
            key={m.date.toISOString()}
            className={`px-1 py-2 text-center ${isCurrentMonth(m.date) ? 'bg-primary/5' : ''}`}
          >
            <PaymentToggle
              status={status}
              isLoading={isLoading}
              isDisabled={isEnded}
              onClick={() => onToggle(p.id, m.date, status)}
            />
          </td>
        );
      })}
      <td className="p-2 md:p-3 text-right whitespace-nowrap sticky right-0 bg-card z-10 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.3)] group-hover:bg-card-hover/30 transition-colors">
        {!isEnded && (
          <div className="inline-flex items-center gap-0.5">
            <button
              onClick={() => onEdit(p)}
              className="size-9 inline-flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-card-hover transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
              aria-label={`Editar ${p.person.name}`}
            >
              <Pencil size={15} aria-hidden="true" />
            </button>
            {p.person.phone && (
              <button
                onClick={() => onMessage(p)}
                className="size-9 inline-flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-card-hover transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
                aria-label={`Enviar mensagem para ${p.person.name}`}
              >
                <MessageCircle size={15} aria-hidden="true" />
              </button>
            )}
            <button
              onClick={() => onDelete(p.id, p.person.name)}
              className="size-9 inline-flex items-center justify-center rounded-lg text-danger/60 hover:text-danger hover:bg-danger-bg transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
              aria-label={`Excluir ${p.person.name}`}
            >
              <Trash2 size={15} aria-hidden="true" />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
