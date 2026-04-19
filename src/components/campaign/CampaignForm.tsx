'use client';

import { useState } from 'react';
import { createCampaign, updateCampaign } from '@/actions/campaign';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { MonthYearPicker } from './MonthYearPicker';
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

function toMonthString(date: Date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function CampaignForm({ campaign }: CampaignFormProps) {
  const { toast } = useToast();
  const isEditing = !!campaign;
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState(campaign?.name ?? '');
  const [description, setDescription] = useState(campaign?.description ?? '');
  const [pixKey, setPixKey] = useState(campaign?.pixKey ?? '');
  const [monthlyValue, setMonthlyValue] = useState(
    campaign ? (campaign.monthlyValue / 100).toFixed(2) : '',
  );
  const [startMonth, setStartMonth] = useState(campaign ? toMonthString(campaign.startMonth) : '');
  const [endMonth, setEndMonth] = useState(campaign ? toMonthString(campaign.endMonth) : '');
  const [paymentDayStart, setPaymentDayStart] = useState(String(campaign?.paymentDayStart ?? 10));
  const [paymentDayEnd, setPaymentDayEnd] = useState(String(campaign?.paymentDayEnd ?? 15));

  return (
    <Card className="p-5 md:p-6">
      <h2 className="text-base font-semibold text-text-primary mb-5">Dados da Campanha</h2>
      <form
        action={async (formData) => {
          setLoading(true);
          try {
            if (isEditing) {
              const result = await updateCampaign(campaign.id, formData);
              if (!result.ok) {
                toast(result.error, 'error');
                return;
              }
              toast('Campanha atualizada', 'success');
            } else {
              const result = await createCampaign(formData);
              // Em caso de sucesso, o redirect throw NEXT_REDIRECT antes de chegar aqui.
              if (!result.ok) toast(result.error, 'error');
            }
          } finally {
            setLoading(false);
          }
        }}
        className="space-y-5"
      >
        <Input
          name="name"
          label="Nome da campanha"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Ex: Congresso 2026"
        />

        <Textarea
          name="description"
          label="Descrição (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Breve descrição da campanha"
          rows={2}
        />

        <Input
          name="pixKey"
          label="Chave PIX"
          value={pixKey}
          onChange={(e) => setPixKey(e.target.value)}
          required
          placeholder="email@exemplo.com ou CPF"
        />

        <Input
          name="monthlyValue"
          label="Valor mensal (R$)"
          type="number"
          step="0.01"
          min="0.01"
          value={monthlyValue}
          onChange={(e) => setMonthlyValue(e.target.value)}
          required
          placeholder="20,00"
        />

        <fieldset className="space-y-1.5">
          <legend className="text-sm font-medium text-text-secondary">Período da campanha</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <MonthYearPicker
              name="startMonth"
              label="Início"
              value={startMonth}
              onChange={setStartMonth}
              required
            />
            <MonthYearPicker
              name="endMonth"
              label="Fim"
              value={endMonth}
              onChange={setEndMonth}
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
              value={paymentDayStart}
              onChange={(e) => setPaymentDayStart(e.target.value)}
              required
            />
            <Input
              name="paymentDayEnd"
              label="Dia fim"
              type="number"
              min="1"
              max="31"
              value={paymentDayEnd}
              onChange={(e) => setPaymentDayEnd(e.target.value)}
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
