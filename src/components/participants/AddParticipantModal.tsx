'use client';

import { useState } from 'react';
import { addParticipant, editParticipant, searchPersonByPhone } from '@/actions/participant';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { UserCheck, Search } from 'lucide-react';
import type { CampaignData } from '@/types';

interface AddParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  participant?: CampaignData['participants'][number] | null;
}

export function AddParticipantModal({ isOpen, onClose, campaignId, participant }: AddParticipantModalProps) {
  const [phoneLookup, setPhoneLookup] = useState<{ name: string; phone: string } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const isEditing = !!participant;

  const handlePhoneSearch = async (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) {
      setPhoneLookup(null);
      return;
    }
    setIsSearching(true);
    try {
      const result = await searchPersonByPhone(campaignId, cleaned);
      setPhoneLookup(result.ok ? result.data : null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClose = () => {
    setPhoneLookup(null);
    setLoading(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Editar Participante' : 'Novo Participante'}
    >
      <form
        action={async (formData) => {
          setLoading(true);
          const result = isEditing
            ? await editParticipant(campaignId, participant.id, formData)
            : await addParticipant(campaignId, formData);
          if (!result.ok) {
            toast(result.error, 'error');
            setLoading(false);
            return;
          }
          toast(isEditing ? 'Participante atualizado' : 'Participante adicionado', 'success');
          handleClose();
        }}
        className="space-y-4"
      >
        <div>
          <Input
            name="phone"
            label="Telefone"
            defaultValue={participant?.person.phone}
            placeholder="(83) 9 9999-9999"
            required
            inputMode="tel"
            onChange={(e) => {
              if (!isEditing) handlePhoneSearch(e.target.value);
            }}
          />
          {isSearching && (
            <div className="flex items-center gap-2 mt-2 text-xs text-text-muted">
              <Search size={12} className="animate-pulse" aria-hidden="true" />
              Buscando...
            </div>
          )}
          {phoneLookup && !isEditing && (
            <div className="flex items-start gap-2.5 bg-success-bg border border-success/20 rounded-lg p-3 mt-2">
              <UserCheck size={16} className="text-success shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <span className="text-sm text-text-primary font-medium">{phoneLookup.name}</span>
                <p className="text-xs text-text-muted mt-0.5">
                  Pessoa encontrada. Será vinculada a esta campanha.
                </p>
              </div>
            </div>
          )}
        </div>

        <Input
          name="name"
          label="Nome"
          defaultValue={participant?.person.name || phoneLookup?.name || ''}
          required
          placeholder="Nome completo"
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="size-4 border-2 border-primary-fg/30 border-t-primary-fg rounded-full animate-spin" />
                Salvando...
              </span>
            ) : (
              isEditing ? 'Salvar' : phoneLookup ? 'Vincular' : 'Adicionar'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
