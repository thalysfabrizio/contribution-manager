'use client';

import { useState } from 'react';
import { deleteCampaign } from '@/actions/campaign';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useToast } from '@/components/ui/Toast';
import { Trash2 } from 'lucide-react';

interface Props {
  campaignId: string;
  campaignName: string;
}

export function DeleteCampaignButton({ campaignId, campaignName }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  return (
    <>
      <Button variant="danger" onClick={() => setIsOpen(true)}>
        <Trash2 size={15} aria-hidden="true" />
        Excluir Campanha
      </Button>
      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        loading={loading}
        onConfirm={async () => {
          setLoading(true);
          const result = await deleteCampaign(campaignId);
          // Em caso de sucesso, redirect throw NEXT_REDIRECT antes de chegar aqui.
          if (!result.ok) {
            toast(result.error, 'error');
            setLoading(false);
          }
        }}
        title="Excluir Campanha"
        message={`Tem certeza que deseja excluir "${campaignName}"? Todos os participantes, pagamentos e histórico serão removidos permanentemente.`}
        confirmLabel="Excluir permanentemente"
        variant="danger"
      />
    </>
  );
}
