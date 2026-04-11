'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, Copy, Check } from 'lucide-react';
import { updatePaymentStatus } from '@/actions/payment';
import { removeParticipant } from '@/actions/participant';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { ConfirmModal } from './ui/ConfirmModal';
import { useToast } from './ui/Toast';
import { SummaryCards } from './dashboard/SummaryCards';
import { OnboardingStepper } from './dashboard/OnboardingStepper';
import { ParticipantTable } from './participants/ParticipantTable';
import { AddParticipantModal } from './participants/AddParticipantModal';
import { MessageModal } from './messaging/MessageModal';
import { getMonthsFromRange } from '@/lib/months';
import type { CampaignData, PaymentStatus } from '@/types';

interface DashboardProps {
  data: CampaignData;
  isEnded?: boolean;
  userRole?: string;
}

export default function Dashboard({ data, isEnded = false }: DashboardProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedFull, setCopiedFull] = useState(false);
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

  const handleToggle = async (participantId: string, monthDate: Date, newStatus: PaymentStatus) => {
    if (loadingId || isEnded) return;
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
      setCopied(true);
      setCopiedFull(true);
      toast('Chave PIX copiada', 'success');
      setTimeout(() => {
        setCopied(false);
        setCopiedFull(false);
      }, 2000);
    } catch {
      toast('Não foi possível copiar', 'error');
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight truncate">{data.name}</h1>
            {isEnded && <Badge variant="muted">Encerrada</Badge>}
          </div>
          {data.description && (
            <p className="text-sm text-text-secondary mt-1.5 line-clamp-1">{data.description}</p>
          )}
        </div>
        <button
          onClick={handleCopyPix}
          className={`flex items-center justify-center gap-2.5 rounded-xl px-4 min-h-[48px] text-sm transition-all duration-300 w-full md:w-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
            copiedFull
              ? 'bg-success-bg border border-success/30 text-success'
              : 'bg-card border border-border hover:bg-card-hover hover:border-primary/20 shadow-sm shadow-black/5'
          }`}
          aria-label="Copiar chave PIX"
        >
          {copiedFull ? (
            <>
              <Check size={16} className="text-success" aria-hidden="true" />
              <span className="font-medium">Copiado!</span>
            </>
          ) : (
            <>
              <span className="text-text-muted">PIX:</span>
              <span className="text-primary font-medium max-w-[180px] truncate">{data.pixKey}</span>
              <Copy size={14} className="text-text-muted" aria-hidden="true" />
            </>
          )}
        </button>
      </div>

      {/* Onboarding stepper */}
      <OnboardingStepper
        hasParticipants={data.participants.length > 0}
        hasPayments={data.participants.some((p) => p.payments.some((pay) => pay.status !== 'PENDING'))}
      />

      {/* Summary Cards */}
      <SummaryCards data={data} months={months} />

      {/* Actions bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex flex-wrap gap-3 md:gap-4 bg-card border border-border rounded-xl px-3 md:px-4 py-2.5 text-sm text-text-secondary shadow-sm shadow-black/5">
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-success" aria-hidden="true" /> PIX
          </span>
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-info" aria-hidden="true" /> Dinheiro
          </span>
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-warning" aria-hidden="true" /> Atrasado
          </span>
        </div>
        {!isEnded && (
          <Button className="hidden md:inline-flex" onClick={() => setEditModal({ isOpen: true, participant: null })}>
            <Plus size={16} aria-hidden="true" />
            Novo Participante
          </Button>
        )}
      </div>

      {/* FAB mobile — Novo Participante */}
      {!isEnded && (
        <button
          onClick={() => setEditModal({ isOpen: true, participant: null })}
          className="fixed bottom-24 right-4 z-30 md:hidden size-14 rounded-full bg-primary text-primary-fg shadow-lg shadow-primary/25 flex items-center justify-center hover:bg-primary-hover active:scale-95 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          aria-label="Novo Participante"
        >
          <Plus size={24} aria-hidden="true" />
        </button>
      )}

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

      {/* Modals */}
      <AddParticipantModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, participant: null })}
        campaignId={data.id}
        participant={editModal.participant}
      />

      <MessageModal
        isOpen={msgModal.isOpen}
        onClose={() => setMsgModal({ isOpen: false, participant: null })}
        participant={msgModal.participant}
        campaign={data}
        months={months}
      />

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '', name: '' })}
        onConfirm={handleDelete}
        title="Excluir Participante"
        message={`Tem certeza que deseja excluir ${deleteConfirm.name}? Os pagamentos deste participante também serão removidos.`}
        confirmLabel="Excluir"
        variant="danger"
      />
    </div>
  );
}
