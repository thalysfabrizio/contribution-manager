'use client';

import { useState } from 'react';
import { Plus, Copy } from 'lucide-react';
import { updatePaymentStatus } from '@/actions/payment';
import { removeParticipant } from '@/actions/participant';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { ConfirmModal } from './ui/ConfirmModal';
import { useToast } from './ui/Toast';
import { SummaryCards } from './dashboard/SummaryCards';
import { ParticipantTable } from './participants/ParticipantTable';
import { AddParticipantModal } from './participants/AddParticipantModal';
import { MessageModal } from './messaging/MessageModal';
import { getMonthsFromRange } from '@/lib/months';
import { getNextStatus } from '@/lib/payment-utils';
import type { CampaignData, PaymentStatus } from '@/types';

interface DashboardProps {
  data: CampaignData;
  isEnded?: boolean;
  userRole?: string;
}

export default function Dashboard({ data, isEnded = false }: DashboardProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    participant: CampaignData['participants'][number] | null;
  }>({ isOpen: false, participant: null });
  const [msgModal, setMsgModal] = useState<{
    isOpen: boolean;
    participant: CampaignData['participants'][number] | null;
  }>({ isOpen: false, participant: null });
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    id: string;
    name: string;
  }>({ isOpen: false, id: '', name: '' });
  const { toast } = useToast();

  const months = getMonthsFromRange(data.startMonth, data.endMonth);

  const handleToggle = async (participantId: string, monthDate: Date, currentStatus?: PaymentStatus) => {
    if (loadingId || isEnded) return;
    const newStatus = getNextStatus(currentStatus);
    const id = `${participantId}-${monthDate.toISOString()}`;
    setLoadingId(id);
    try {
      await updatePaymentStatus(data.id, participantId, monthDate, newStatus);
    } catch {
      toast('Erro ao atualizar pagamento', 'error');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async () => {
    try {
      await removeParticipant(data.id, deleteConfirm.id);
      toast('Participante removido', 'success');
    } catch {
      toast('Erro ao remover participante', 'error');
    }
  };

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(data.pixKey);
      toast('Chave PIX copiada', 'success');
    } catch {
      toast('Não foi possível copiar', 'error');
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-[1200px] mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-text-primary tracking-tight">{data.name}</h1>
              {isEnded && <Badge variant="muted">Encerrada</Badge>}
            </div>
            {data.description && <p className="text-sm text-text-secondary">{data.description}</p>}
          </div>
          <button
            onClick={handleCopyPix}
            className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 text-sm hover:bg-card-hover transition-all duration-200"
            title="Copiar chave PIX"
          >
            <span className="text-text-muted">PIX:</span>
            <span className="text-primary font-medium">{data.pixKey}</span>
            <Copy size={14} className="text-text-muted" />
          </button>
        </div>

        {/* Summary Cards */}
        <SummaryCards data={data} months={months} />

        {/* Actions bar */}
        <div className="flex items-center justify-between">
          <div className="flex gap-3 text-xs text-text-secondary">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success" /> PIX
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-info" /> Dinheiro
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-warning" /> Atrasado
            </span>
          </div>
          {!isEnded && (
            <Button onClick={() => setEditModal({ isOpen: true, participant: null })}>
              <Plus size={16} />
              Novo Participante
            </Button>
          )}
        </div>

        {/* Participants Table */}
        <ParticipantTable
          participants={data.participants}
          months={months}
          isEnded={isEnded}
          loadingId={loadingId}
          onToggle={handleToggle}
          onEdit={(p) => setEditModal({ isOpen: true, participant: p })}
          onMessage={(p) => setMsgModal({ isOpen: true, participant: p })}
          onDelete={(id, name) => setDeleteConfirm({ isOpen: true, id, name })}
        />

        {/* Add/Edit Participant Modal */}
        <AddParticipantModal
          isOpen={editModal.isOpen}
          onClose={() => setEditModal({ isOpen: false, participant: null })}
          campaignId={data.id}
          participant={editModal.participant}
        />

        {/* Message Modal */}
        <MessageModal
          isOpen={msgModal.isOpen}
          onClose={() => setMsgModal({ isOpen: false, participant: null })}
          participant={msgModal.participant}
          campaign={data}
          months={months}
        />

        {/* Delete Confirmation */}
        <ConfirmModal
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm({ isOpen: false, id: '', name: '' })}
          onConfirm={handleDelete}
          title="Excluir Participante"
          message={`Tem certeza que deseja excluir ${deleteConfirm.name}? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          variant="danger"
        />
      </div>
    </main>
  );
}
