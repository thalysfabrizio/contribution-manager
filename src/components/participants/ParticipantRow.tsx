'use client';

import { Pencil, MessageCircle, Trash2 } from 'lucide-react';
import { PaymentToggle } from './PaymentToggle';
import { isSameMonth, isCurrentMonth } from '@/lib/months';
import { getNextStatus } from '@/lib/payment-utils';
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

  return (
    <tr className="border-b border-border hover:bg-card-hover/50 transition-colors duration-200">
      <td className="p-3 md:p-4 sticky left-0 bg-card z-10 shadow-[4px_0_6px_-1px_rgba(0,0,0,0.3)]">
        <div className="font-medium text-text-primary">{p.person.name}</div>
        <div className="text-xs text-text-muted">{p.person.phone || '-'}</div>
        <div className="text-xs text-text-muted mt-0.5">
          {paidCount}/{months.length} pagos
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
            className={`px-1.5 py-2 text-center ${isCurrentMonth(m.date) ? 'bg-primary/5' : ''}`}
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
      <td className="p-3 md:p-4 text-right whitespace-nowrap sticky right-0 bg-card z-10 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.3)]">
        {!isEnded && (
          <>
            <button
              onClick={() => onEdit(p)}
              className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-card-hover transition-all duration-200"
              aria-label={`Editar ${p.person.name}`}
            >
              <Pencil size={16} />
            </button>
            {p.person.phone && (
              <button
                onClick={() => onMessage(p)}
                className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-card-hover transition-all duration-200"
                aria-label={`Enviar mensagem para ${p.person.name}`}
              >
                <MessageCircle size={16} />
              </button>
            )}
            <button
              onClick={() => onDelete(p.id, p.person.name)}
              className="p-2 rounded-md text-danger/70 hover:text-danger hover:bg-danger-bg transition-all duration-200"
              aria-label={`Excluir ${p.person.name}`}
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </td>
    </tr>
  );
}
