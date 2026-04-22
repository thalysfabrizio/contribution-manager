'use client';

import { useActionState, useState } from 'react';
import { addParticipant, editParticipant, searchPersonByPhone } from '@/actions/participant';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { UserCheck, Search } from 'lucide-react';
import type { CampaignData } from '@/types';
import type { ActionResult } from '@/lib/errors';

interface AddParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  participant?: CampaignData['participants'][number] | null;
  onAdded?: (participantId: string) => void;
}

export function AddParticipantModal({ isOpen, onClose, campaignId, participant, onAdded }: AddParticipantModalProps) {
  const isEditing = !!participant;
  const { toast } = useToast();

  const [phone, setPhone] = useState(participant?.person.phone ?? '');
  const [name, setName] = useState(participant?.person.name ?? '');
  const [phoneLookup, setPhoneLookup] = useState<{ name: string; phone: string } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handlePhoneChange = async (value: string) => {
    setPhone(value);
    if (isEditing) return;

    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length < 10) {
      setPhoneLookup(null);
      return;
    }
    setIsSearching(true);
    try {
      const result = await searchPersonByPhone(campaignId, cleaned);
      if (result.ok && result.data) {
        setPhoneLookup(result.data);
        if (!name) setName(result.data.name);
      } else {
        setPhoneLookup(null);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const submit = async (
    _prev: ActionResult<unknown> | null,
    formData: FormData,
  ): Promise<ActionResult<unknown>> => {
    if (isEditing) {
      const result = await editParticipant(campaignId, participant.id, formData);
      if (!result.ok) {
        toast(result.error, 'error');
      } else {
        toast('Participante atualizado', 'success');
        onClose();
      }
      return result;
    }
    const result = await addParticipant(campaignId, formData);
    if (!result.ok) {
      toast(result.error, 'error');
    } else {
      toast('Participante adicionado', 'success');
      onAdded?.(result.data.participantId);
      onClose();
    }
    return result;
  };

  const [, formAction] = useActionState(submit, null);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Participante' : 'Novo Participante'}
    >
      <form action={formAction} className="space-y-4">
        <div>
          <Input
            name="phone"
            label="Telefone"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="(83) 9 9999-9999"
            required
            inputMode="tel"
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
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Nome completo"
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <SubmitButton>
            {isEditing ? 'Salvar' : phoneLookup ? 'Vincular' : 'Adicionar'}
          </SubmitButton>
        </div>
      </form>
    </Modal>
  );
}
