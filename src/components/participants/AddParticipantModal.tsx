'use client';

import { useState } from 'react';
import { addParticipant, editParticipant, searchPersonByPhone } from '@/actions/participant';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
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
      const person = await searchPersonByPhone(cleaned);
      setPhoneLookup(person);
    } catch {
      setPhoneLookup(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClose = () => {
    setPhoneLookup(null);
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
          try {
            if (isEditing) {
              await editParticipant(campaignId, participant.id, formData);
              toast('Participante atualizado', 'success');
            } else {
              await addParticipant(campaignId, formData);
              toast('Participante adicionado', 'success');
            }
            handleClose();
          } catch (e) {
            toast(e instanceof Error ? e.message : 'Erro ao salvar', 'error');
          }
        }}
        className="space-y-4"
      >
        <div className="space-y-1">
          <Input
            name="phone"
            label="Telefone"
            defaultValue={participant?.person.phone}
            placeholder="83999999999"
            required
            onChange={(e) => {
              if (!isEditing) handlePhoneSearch(e.target.value);
            }}
          />
          {isSearching && <p className="text-xs text-text-muted">Buscando...</p>}
          {phoneLookup && !isEditing && (
            <div className="bg-success-bg border border-success/30 rounded-md p-2 text-sm">
              <span className="text-success">Pessoa encontrada:</span>{' '}
              <span className="text-text-primary font-medium">{phoneLookup.name}</span>
              <p className="text-xs text-text-muted mt-0.5">
                O nome será preenchido automaticamente ao vincular.
              </p>
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
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit">
            {isEditing ? 'Salvar' : phoneLookup ? 'Vincular' : 'Adicionar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
