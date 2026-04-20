'use client';

import { useState } from 'react';
import { createCampaign } from '@/actions/campaign';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { MonthYearPicker } from './MonthYearPicker';
import { BrandingFields, DEFAULT_ACCENT, type BrandingValues } from './BrandingFields';
import { TemplateFieldsEditor } from '@/components/messaging/TemplateFieldsEditor';
import { DEFAULT_TEMPLATES, type CampaignTemplates } from '@/lib/templates';
import { Plus, ChevronDown, Palette, MessageSquare } from 'lucide-react';

interface SectionProps {
  title: string;
  hint?: string;
  icon: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleSection({ title, hint, icon, open, onToggle, children }: SectionProps) {
  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 p-5 md:p-6 text-left hover:bg-card-hover/30 transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-primary shrink-0">{icon}</span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-text-primary">{title}</h2>
            {hint && <p className="text-xs text-text-muted mt-0.5">{hint}</p>}
          </div>
        </div>
        <ChevronDown
          size={18}
          className={`text-text-muted shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      {open && <div className="px-5 pb-5 md:px-6 md:pb-6">{children}</div>}
    </Card>
  );
}

export function NewCampaignForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [monthlyValue, setMonthlyValue] = useState('');
  const [startMonth, setStartMonth] = useState('');
  const [endMonth, setEndMonth] = useState('');
  const [paymentDayStart, setPaymentDayStart] = useState('10');
  const [paymentDayEnd, setPaymentDayEnd] = useState('15');

  const [brandingOpen, setBrandingOpen] = useState(false);
  const [branding, setBranding] = useState<BrandingValues>({
    orgName: '',
    logoUrl: '',
    bannerUrl: '',
    accentColor: DEFAULT_ACCENT,
    messageSignature: '',
  });

  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [templates, setTemplates] = useState<CampaignTemplates>(DEFAULT_TEMPLATES);
  const [templatesTouched, setTemplatesTouched] = useState(false);

  const monthlyValueCents = Math.round((parseFloat(monthlyValue) || 0) * 100);

  return (
    <form
      action={async () => {
        setLoading(true);
        try {
          const formData = new FormData();
          formData.set('name', name);
          formData.set('description', description);
          formData.set('pixKey', pixKey);
          formData.set('monthlyValue', monthlyValue);
          formData.set('startMonth', startMonth);
          formData.set('endMonth', endMonth);
          formData.set('paymentDayStart', paymentDayStart);
          formData.set('paymentDayEnd', paymentDayEnd);

          const hasBranding =
            branding.orgName.trim() !== '' ||
            branding.logoUrl.trim() !== '' ||
            branding.bannerUrl.trim() !== '' ||
            branding.accentColor !== DEFAULT_ACCENT ||
            branding.messageSignature.trim() !== '';

          if (hasBranding) {
            formData.set('orgName', branding.orgName);
            formData.set('logoUrl', branding.logoUrl);
            formData.set('bannerUrl', branding.bannerUrl);
            formData.set('accentColor', branding.accentColor);
            formData.set('messageSignature', branding.messageSignature);
          }

          if (templatesTouched) {
            formData.set('templates', JSON.stringify(templates));
          }

          const result = await createCampaign(formData);
          // Em sucesso, redirect throw NEXT_REDIRECT antes de chegar aqui.
          if (!result.ok) toast(result.error, 'error');
        } finally {
          setLoading(false);
        }
      }}
      className="space-y-4"
    >
      <Card className="p-5 md:p-6">
        <h2 className="text-base font-semibold text-text-primary mb-5">Dados da Campanha</h2>
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
      </Card>

      <CollapsibleSection
        title="Personalizar Aparência"
        hint="Logo, cores e assinatura — opcional, dá pra configurar depois"
        icon={<Palette size={18} aria-hidden="true" />}
        open={brandingOpen}
        onToggle={() => setBrandingOpen((v) => !v)}
      >
        <BrandingFields values={branding} onChange={setBranding} />
      </CollapsibleSection>

      <CollapsibleSection
        title="Templates de Mensagem"
        hint="Personalizar mensagens de cobrança — opcional, há defaults prontos"
        icon={<MessageSquare size={18} aria-hidden="true" />}
        open={templatesOpen}
        onToggle={() => setTemplatesOpen((v) => !v)}
      >
        <TemplateFieldsEditor
          templates={templates}
          onChange={(t) => {
            setTemplates(t);
            setTemplatesTouched(true);
          }}
          campaignName={name}
          pixKey={pixKey}
          monthlyValue={monthlyValueCents}
          paymentDayStart={parseInt(paymentDayStart) || 1}
          paymentDayEnd={parseInt(paymentDayEnd) || 1}
        />
      </CollapsibleSection>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="size-4 border-2 border-primary-fg/30 border-t-primary-fg rounded-full animate-spin" />
              Criando...
            </span>
          ) : (
            <>
              <Plus size={16} aria-hidden="true" />
              Criar Campanha
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
