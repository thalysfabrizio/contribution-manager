'use client';

import { useActionState, useState } from 'react';
import { inviteMember } from '@/actions/member';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { UserPlus } from 'lucide-react';
import type { ActionResult } from '@/lib/errors';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
}

export function InviteMemberModal({ isOpen, onClose, campaignId }: InviteMemberModalProps) {
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleClose = () => {
    setEmail('');
    onClose();
  };

  const submit = async (
    _prev: ActionResult<{ method: 'direct' | 'invite' }> | null,
  ): Promise<ActionResult<{ method: 'direct' | 'invite' }>> => {
    const result = await inviteMember(campaignId, email);
    if (!result.ok) {
      toast(result.error, 'error');
    } else {
      toast(
        result.data.method === 'direct'
          ? 'Líder adicionado com sucesso'
          : 'Convite enviado — o líder terá acesso ao fazer login',
        'success',
      );
      handleClose();
    }
    return result;
  };

  const [, formAction] = useActionState(submit, null);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Convidar Líder" size="sm">
      <form action={formAction} className="space-y-4">
        <Input
          type="email"
          name="email"
          label="Email do líder"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="lider@exemplo.com"
          autoComplete="email"
        />
        <p className="text-xs text-text-muted leading-relaxed">
          Se a pessoa já tem conta, será adicionada diretamente.
          Caso contrário, terá acesso ao fazer login pela primeira vez.
        </p>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
          <SubmitButton pendingLabel="Convidando...">
            <UserPlus size={15} aria-hidden="true" />
            Convidar
          </SubmitButton>
        </div>
      </form>
    </Modal>
  );
}
