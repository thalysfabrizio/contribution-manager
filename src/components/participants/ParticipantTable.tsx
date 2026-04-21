'use client';

import { Card } from '@/components/ui/Card';
import { ParticipantRow } from './ParticipantRow';
import { ParticipantCard } from './ParticipantCard';
import { isSameMonth, isCurrentMonth } from '@/lib/months';
import { Users } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import type { CampaignData, PaymentStatus } from '@/types';
import type { MonthEntry } from '@/lib/months';

interface ParticipantTableProps {
  participants: CampaignData['participants'];
  months: MonthEntry[];
  isEnded: boolean;
  loadingId: string | null;
  highlightId?: string | null;
  onToggle: (participantId: string, monthDate: Date, newStatus: PaymentStatus) => void;
  onEdit: (participant: CampaignData['participants'][number]) => void;
  onMessage: (participant: CampaignData['participants'][number]) => void;
  onDelete: (id: string, name: string) => void;
}

export function ParticipantTable({
  participants,
  months,
  isEnded,
  loadingId,
  highlightId,
  onToggle,
  onEdit,
  onMessage,
  onDelete,
}: ParticipantTableProps) {
  return (
    <>
      {/* Mobile: lista de cards */}
      <div className="md:hidden space-y-3">
        {participants.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Users size={32} className="text-primary/60" aria-hidden="true" />}
              title="Nenhum participante cadastrado"
              description="Adicione participantes para acompanhar os pagamentos da campanha."
            />
          </Card>
        ) : (
          participants.map((p) => (
            <ParticipantCard
              key={p.id}
              participant={p}
              months={months}
              isEnded={isEnded}
              loadingId={loadingId}
              isHighlighted={highlightId === p.id}
              onToggle={onToggle}
              onEdit={onEdit}
              onMessage={onMessage}
              onDelete={onDelete}
            />
          ))
        )}
      </div>

      {/* Desktop: tabela */}
      <div className="hidden md:block overflow-x-auto -mx-5 md:-mx-6">
        <table className="w-full text-sm border-collapse" role="grid">
          <thead>
            <tr className="border-b border-border text-left">
              <th
                scope="col"
                className="p-3 md:p-4 min-w-[160px] sticky left-0 bg-card z-10 sticky-shadow-left text-xs font-semibold text-text-secondary uppercase tracking-wider"
              >
                Participante
              </th>
              {months.map((m) => (
                <th
                  key={m.date.toISOString()}
                  scope="col"
                  className={`px-2 py-3 text-center min-w-[56px] text-sm font-medium text-text-secondary ${
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
                className="p-3 md:p-4 text-right sticky right-0 bg-card z-10 sticky-shadow-right text-xs font-semibold text-text-secondary uppercase tracking-wider"
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {participants.length === 0 ? (
              <tr>
                <td colSpan={months.length + 2}>
                  <EmptyState
                    icon={<Users size={32} className="text-primary/60" aria-hidden="true" />}
                    title="Nenhum participante cadastrado"
                    description="Adicione participantes para acompanhar os pagamentos da campanha."
                  />
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
                  isHighlighted={highlightId === p.id}
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
                <td className="p-3 md:p-4 sticky left-0 bg-card z-10 text-xs text-text-muted font-semibold uppercase tracking-wider sticky-shadow-left">
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
                      className={`px-1.5 py-2.5 text-center text-sm tabular-nums ${
                        isCurrentMonth(m.date) ? 'bg-primary/5' : ''
                      } ${allPaid ? 'text-success font-medium' : 'text-text-muted'}`}
                    >
                      {paidInMonth}/{participants.length}
                    </td>
                  );
                })}
                <td className="p-3 md:p-4 sticky right-0 bg-card z-10 sticky-shadow-right" />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </>
  );
}
