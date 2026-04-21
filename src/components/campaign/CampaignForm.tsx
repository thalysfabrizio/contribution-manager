'use client';

import { useState } from 'react';
import { updateCampaign } from '@/actions/campaign';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { useToast } from '@/components/ui/Toast';
import { MonthYearPicker } from './MonthYearPicker';
import { Save } from 'lucide-react';

interface CampaignFormProps {
  campaign: {
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
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const [name, setName] = useState(campaign.name);
  const [description, setDescription] = useState(campaign.description ?? '');
  const [pixKey, setPixKey] = useState(campaign.pixKey);
  const [monthlyValue, setMonthlyValue] = useState((campaign.monthlyValue / 100).toFixed(2));
  const [startMonth, setStartMonth] = useState(toMonthString(campaign.startMonth));
  const [endMonth, setEndMonth] = useState(toMonthString(campaign.endMonth));
  const [paymentDayStart, setPaymentDayStart] = useState(String(campaign.paymentDayStart));
  const [paymentDayEnd, setPaymentDayEnd] = useState(String(campaign.paymentDayEnd));

  const saveButton = (
    <Button type="submit" size="sm" disabled={loading} form="campaign-form">
      {loading ? (
        <span className="flex items-center gap-1.5">
          <span className="size-3 border-2 border-primary-fg/30 border-t-primary-fg rounded-full animate-spin" />
          Salvando...
        </span>
      ) : (
        <>
          <Save size={13} aria-hidden="true" />
          Salvar
        </>
      )}
    </Button>
  );

  return (
    <form
      id="campaign-form"
      action={async (formData) => {
        setLoading(true);
        try {
          const result = await updateCampaign(campaign.id, formData);
          if (!result.ok) {
            toast(result.error, 'error');
            return;
          }
          toast('Campanha atualizada', 'success');
          setOpen(false);
        } finally {
          setLoading(false);
        }
      }}
    >
      <CollapsibleSection
        id="campaign-data"
        title="Dados da Campanha"
        headerExtra={saveButton}
        open={open}
        onOpenChange={setOpen}
      >
        <div className="space-y-5">
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
        </div>
      </CollapsibleSection>
    </form>
  );
}
