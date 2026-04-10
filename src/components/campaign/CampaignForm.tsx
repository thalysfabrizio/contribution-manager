'use client';

import { createCampaign, updateCampaign } from '@/actions/campaign';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';

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

  return (
    <Card className="p-4 md:p-6">
      <form
        action={async (formData) => {
          try {
            if (isEditing) {
              await updateCampaign(campaign.id, formData);
              toast('Campanha atualizada', 'success');
            } else {
              await createCampaign(formData);
            }
          } catch (e) {
            toast(e instanceof Error ? e.message : 'Erro ao salvar campanha', 'error');
          }
        }}
        className="space-y-4"
      >
        <Input
          name="name"
          label="Nome da campanha"
          defaultValue={campaign?.name}
          required
          placeholder="Ex: Congresso 2026"
        />

        <div className="space-y-1">
          <label htmlFor="description" className="block text-sm font-medium text-text-secondary">
            Descrição (opcional)
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={campaign?.description ?? ''}
            placeholder="Breve descrição da campanha"
            rows={2}
            className="w-full rounded-md border border-border bg-app px-3 py-2 text-base text-text-primary placeholder:text-text-muted transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
        </div>

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
          placeholder="20.00"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            name="startMonth"
            label="Mês de início"
            type="month"
            defaultValue={campaign ? toMonthInput(campaign.startMonth) : ''}
            required
          />
          <Input
            name="endMonth"
            label="Mês final"
            type="month"
            defaultValue={campaign ? toMonthInput(campaign.endMonth) : ''}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            name="paymentDayStart"
            label="Prazo: dia início"
            type="number"
            min="1"
            max="31"
            defaultValue={campaign?.paymentDayStart ?? 10}
            required
          />
          <Input
            name="paymentDayEnd"
            label="Prazo: dia fim"
            type="number"
            min="1"
            max="31"
            defaultValue={campaign?.paymentDayEnd ?? 15}
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit">{isEditing ? 'Salvar Alterações' : 'Criar Campanha'}</Button>
        </div>
      </form>
    </Card>
  );
}
