'use client';

import { useState } from 'react';
import { createCampaign, updateCampaign } from '@/actions/campaign';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { Save, Plus } from 'lucide-react';

interface CampaignFormProps {
  campaign?: {
    id: string;
    name: string;
    description: string | null;
    pixKey: string;
    monthlyValue: number;
    startMonth: Date;
    endMonth: Date;
    paymentDayStart: number;
    paymentDayEnd: number;
  };
}

function toMonthInput(date: Date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function CampaignForm({ campaign }: CampaignFormProps) {
  const { toast } = useToast();
  const isEditing = !!campaign;
  const [loading, setLoading] = useState(false);

  return (
    <Card className="p-5 md:p-6">
      <h2 className="text-base font-semibold text-text-primary mb-5">Dados da Campanha</h2>
      <form
        action={async (formData) => {
          setLoading(true);
          try {
            if (isEditing) {
              await updateCampaign(campaign.id, formData);
              toast('Campanha atualizada', 'success');
            } else {
              await createCampaign(formData);
            }
          } catch (e) {
            toast(e instanceof Error ? e.message : 'Erro ao salvar campanha', 'error');
          } finally {
            setLoading(false);
          }
        }}
        className="space-y-5"
      >
        <Input
          name="name"
          label="Nome da campanha"
          defaultValue={campaign?.name}
          required
          placeholder="Ex: Congresso 2026"
        />

        <Textarea
          name="description"
          label="Descrição (opcional)"
          defaultValue={campaign?.description ?? ''}
          placeholder="Breve descrição da campanha"
          rows={2}
        />

        <Input
          name="pixKey"
          label="Chave PIX"
          defaultValue={campaign?.pixKey}
          required
          placeholder="email@exemplo.com ou CPF"
        />

        <Input
          name="monthlyValue"
          label="Valor mensal (R$)"
          type="number"
          step="0.01"
          min="0.01"
          defaultValue={campaign ? (campaign.monthlyValue / 100).toFixed(2) : ''}
          required
          placeholder="20,00"
        />

        <fieldset className="space-y-1.5">
          <legend className="text-sm font-medium text-text-secondary">Período da campanha</legend>
          <div className="grid grid-cols-2 gap-3">
            <Input
              name="startMonth"
              label="Início"
              type="month"
              defaultValue={campaign ? toMonthInput(campaign.startMonth) : ''}
              required
            />
            <Input
              name="endMonth"
              label="Fim"
              type="month"
              defaultValue={campaign ? toMonthInput(campaign.endMonth) : ''}
              required
            />
          </div>
        </fieldset>

        <fieldset className="space-y-1.5">
          <legend className="text-sm font-medium text-text-secondary">Prazo de pagamento</legend>
          <div className="grid grid-cols-2 gap-3">
            <Input
              name="paymentDayStart"
              label="Dia início"
              type="number"
              min="1"
              max="31"
              defaultValue={campaign?.paymentDayStart ?? 10}
              required
            />
            <Input
              name="paymentDayEnd"
              label="Dia fim"
              type="number"
              min="1"
              max="31"
              defaultValue={campaign?.paymentDayEnd ?? 15}
              required
            />
          </div>
        </fieldset>

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="size-4 border-2 border-primary-fg/30 border-t-primary-fg rounded-full animate-spin" />
                Salvando...
              </span>
            ) : (
              <>
                {isEditing ? <Save size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
                {isEditing ? 'Salvar Alterações' : 'Criar Campanha'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
