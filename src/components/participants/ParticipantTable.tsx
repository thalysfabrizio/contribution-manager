'use client';

import { Card } from '@/components/ui/Card';
import { ParticipantRow } from './ParticipantRow';
import { isSameMonth, isCurrentMonth } from '@/lib/months';
import type { CampaignData, PaymentStatus } from '@/types';
import type { MonthEntry } from '@/lib/months';

interface ParticipantTableProps {
  participants: CampaignData['participants'];
  months: MonthEntry[];
  isEnded: boolean;
  loadingId: string | null;
  onToggle: (participantId: string, monthDate: Date, currentStatus?: PaymentStatus) => void;
  onEdit: (participant: CampaignData['participants'][number]) => void;
  onMessage: (participant: CampaignData['participants'][number]) => void;
  onDelete: (id: string, name: string) => void;
}

export function ParticipantTable({
  participants,
  months,
  isEnded,
  loadingId,
  onToggle,
  onEdit,
  onMessage,
  onDelete,
}: ParticipantTableProps) {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="p-3 md:p-4 min-w-[150px] sticky left-0 bg-card z-10 shadow-[4px_0_6px_-1px_rgba(0,0,0,0.3)]">
                Participante
              </th>
              {months.map((m) => (
                <th
                  key={m.date.toISOString()}
                  className={`px-2 py-3 text-center min-w-[80px] text-text-secondary font-medium ${
                    isCurrentMonth(m.date) ? 'bg-primary/5' : ''
                  }`}
                >
                  {m.label}
                </th>
              ))}
              <th className="p-3 md:p-4 text-right sticky right-0 bg-card z-10 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.3)]">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {participants.length === 0 ? (
              <tr>
                <td colSpan={months.length + 2} className="p-8 text-center text-text-muted">
                  Nenhum participante cadastrado. Clique em &quot;Novo Participante&quot; para adicionar.
                </td>
              </tr>
            ) : (
              participants.map((p) => (
                <ParticipantRow
                  key={p.id}
                  participant={p}
                  months={months}
                  isEnded={isEnded}
                  loadingId={loadingId}
                  onToggle={onToggle}
                  onEdit={onEdit}
                  onMessage={onMessage}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
          {participants.length > 0 && (
            <tfoot>
              <tr className="border-t border-border">
                <td className="p-3 md:p-4 sticky left-0 bg-card z-10 text-xs text-text-muted font-medium shadow-[4px_0_6px_-1px_rgba(0,0,0,0.3)]">
                  Totais
                </td>
                {months.map((m) => {
                  const paidInMonth = participants.filter((p) =>
                    p.payments.some(
                      (pay) =>
                        isSameMonth(pay.month, m.date) &&
                        (pay.status === 'PAID_PIX' || pay.status === 'PAID_CASH'),
                    ),
                  ).length;
                  return (
                    <td
                      key={m.date.toISOString()}
                      className={`px-1.5 py-2 text-center text-xs text-text-muted ${
                        isCurrentMonth(m.date) ? 'bg-primary/5' : ''
                      }`}
                    >
                      {paidInMonth}/{participants.length}
                    </td>
                  );
                })}
                <td className="p-3 md:p-4 sticky right-0 bg-card z-10 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.3)]" />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </Card>
  );
}
