'use client';

import { useState } from 'react';
import { deleteCampaign } from '@/actions/campaign';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Trash2 } from 'lucide-react';

interface Props {
  campaignId: string;
  campaignName: string;
}

export function DeleteCampaignButton({ campaignId, campaignName }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const { toast } = useToast();

  const canSubmit =
    acknowledged &&
    confirmText.trim().toLowerCase() === campaignName.trim().toLowerCase() &&
    !loading;

  const close = () => {
    if (loading) return;
    setIsOpen(false);
    setConfirmText('');
    setAcknowledged(false);
  };

  return (
    <>
      <Button variant="danger" onClick={() => setIsOpen(true)}>
        <Trash2 size={15} aria-hidden="true" />
        Excluir Campanha
      </Button>
      <Modal isOpen={isOpen} onClose={close} title="Excluir Campanha" size="md">
        <div className="space-y-5">
          <div className="bg-danger/10 border border-danger/30 rounded-lg p-4 text-sm text-text-primary">
            <p className="font-medium mb-1">Esta ação é permanente.</p>
            <p className="text-text-secondary leading-relaxed">
              Todos os participantes, pagamentos e histórico de auditoria de{' '}
              <strong>{campaignName}</strong> serão excluídos imediatamente.
            </p>
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 size-4 rounded border-2 border-border text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger cursor-pointer"
            />
            <span className="text-sm text-text-secondary leading-relaxed">
              Eu entendo que esta ação é <strong>irreversível</strong>.
            </span>
          </label>

          <div className="space-y-2">
            <label htmlFor="confirm-campaign-name" className="text-sm font-medium text-text-secondary">
              Digite o nome da campanha para confirmar: <strong>{campaignName}</strong>
            </label>
            <input
              id="confirm-campaign-name"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={campaignName}
              autoComplete="off"
              className="w-full h-11 rounded-lg border-2 border-border bg-app px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-danger focus:ring-2 focus:ring-danger/20"
            />
          </div>

          <div className="flex gap-2.5 pt-2">
            <Button variant="outline" onClick={close} disabled={loading} className="flex-1">
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                if (!canSubmit) return;
                setLoading(true);
                const result = await deleteCampaign(campaignId);
                if (!result.ok) {
                  toast(result.error, 'error');
                  setLoading(false);
                }
              }}
              disabled={!canSubmit}
              className="flex-1"
            >
              {loading ? 'Excluindo...' : 'Excluir definitivamente'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
