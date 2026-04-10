'use client';

import { Card } from '@/components/ui/Card';
import { ParticipantRow } from './ParticipantRow';
import { isSameMonth, isCurrentMonth } from '@/lib/months';
import { Users } from 'lucide-react';
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
        <table className="w-full text-sm border-collapse" role="grid">
          <thead>
            <tr className="border-b border-border text-left">
              <th
                scope="col"
                className="p-3 md:p-4 min-w-[160px] sticky left-0 bg-card z-10 shadow-[4px_0_6px_-1px_rgba(0,0,0,0.3)] text-xs font-semibold text-text-secondary uppercase tracking-wider"
              >
                Participante
              </th>
              {months.map((m) => (
                <th
                  key={m.date.toISOString()}
                  scope="col"
                  className={`px-2 py-3 text-center min-w-[52px] text-xs font-medium text-text-secondary ${
                    isCurrentMonth(m.date)
                      ? 'bg-primary/5 text-primary'
                      : ''
                  }`}
                >
                  {m.label}
                </th>
              ))}
              <th
                scope="col"
                className="p-3 md:p-4 text-right sticky right-0 bg-card z-10 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.3)] text-xs font-semibold text-text-secondary uppercase tracking-wider"
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {participants.length === 0 ? (
              <tr>
                <td colSpan={months.length + 2} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-text-muted">
                    <Users size={28} className="opacity-40" aria-hidden="true" />
                    <p className="text-sm">Nenhum participante cadastrado.</p>
                    <p className="text-xs">Clique em &quot;Novo Participante&quot; para adicionar.</p>
                  </div>
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
              <tr className="border-t-2 border-border">
                <td className="p-3 md:p-4 sticky left-0 bg-card z-10 text-xs text-text-muted font-semibold uppercase tracking-wider shadow-[4px_0_6px_-1px_rgba(0,0,0,0.3)]">
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
                  const allPaid = paidInMonth === participants.length && participants.length > 0;
                  return (
                    <td
                      key={m.date.toISOString()}
                      className={`px-1.5 py-2.5 text-center text-xs tabular-nums ${
                        isCurrentMonth(m.date) ? 'bg-primary/5' : ''
                      } ${allPaid ? 'text-success font-medium' : 'text-text-muted'}`}
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
