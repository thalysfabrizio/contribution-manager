'use client';

import { useState } from 'react';
import { inviteMember } from '@/actions/member';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { UserPlus } from 'lucide-react';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
}

export function InviteMemberModal({ isOpen, onClose, campaignId }: InviteMemberModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleClose = () => {
    setEmail('');
    setLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Convidar Líder" size="sm">
      <form
        action={async () => {
          setLoading(true);
          const result = await inviteMember(campaignId, email);
          if (!result.ok) {
            toast(result.error, 'error');
            setLoading(false);
            return;
          }
          toast(
            result.data.method === 'direct'
              ? 'Líder adicionado com sucesso'
              : 'Convite enviado — o líder terá acesso ao fazer login',
            'success',
          );
          handleClose();
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
          autoComplete="email"
        />
        <p className="text-xs text-text-muted leading-relaxed">
          Se a pessoa já tem conta, será adicionada diretamente.
          Caso contrário, terá acesso ao fazer login pela primeira vez.
        </p>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-1.5">
                <span className="size-3.5 border-2 border-primary-fg/30 border-t-primary-fg rounded-full animate-spin" />
                Convidando...
              </span>
            ) : (
              <>
                <UserPlus size={15} aria-hidden="true" />
                Convidar
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
