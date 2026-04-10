'use client';

import { useState } from 'react';
import { inviteMember } from '@/actions/member';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
}

export function InviteMemberModal({ isOpen, onClose, campaignId }: InviteMemberModalProps) {
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Convidar Líder">
      <form
        action={async () => {
          try {
            const result = await inviteMember(campaignId, email);
            if (result.method === 'direct') {
              toast('Líder adicionado com sucesso', 'success');
            } else {
              toast('Convite enviado — o líder terá acesso ao fazer login', 'success');
            }
            setEmail('');
            onClose();
          } catch (e) {
            toast(e instanceof Error ? e.message : 'Erro ao convidar', 'error');
          }
        }}
        className="space-y-4"
      >
        <Input
          type="email"
          name="email"
          label="Email do líder"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="lider@exemplo.com"
        />
        <p className="text-xs text-text-muted">
          Se a pessoa já tem conta, será adicionada diretamente.
          Caso contrário, terá acesso ao fazer login pela primeira vez.
        </p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Convidar</Button>
        </div>
      </form>
    </Modal>
  );
}
