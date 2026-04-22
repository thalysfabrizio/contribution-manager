'use client';

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCampaign } from '@/actions/campaign';
import { Button } from '@/components/ui/Button';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Input, Textarea } from '@/components/ui/Input';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { useToast } from '@/components/ui/Toast';
import { MonthYearPicker } from './MonthYearPicker';
import { BrandingFields, DEFAULT_ACCENT, type BrandingValues } from './BrandingFields';
import { TemplateFieldsEditor } from '@/components/messaging/TemplateFieldsEditor';
import { DEFAULT_TEMPLATES, type CampaignTemplates } from '@/lib/templates';
import { Plus, UserPlus, X } from 'lucide-react';
import type { ActionResult } from '@/lib/errors';

export function NewCampaignForm() {
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [monthlyValue, setMonthlyValue] = useState('');
  const [startMonth, setStartMonth] = useState('');
  const [endMonth, setEndMonth] = useState('');
  const [paymentDayStart, setPaymentDayStart] = useState('10');
  const [paymentDayEnd, setPaymentDayEnd] = useState('15');

  const [branding, setBranding] = useState<BrandingValues>({
    orgName: '',
    logoUrl: '',
    bannerUrl: '',
    accentColor: DEFAULT_ACCENT,
    messageSignature: '',
  });

  const [templates, setTemplates] = useState<CampaignTemplates>(DEFAULT_TEMPLATES);
  const [templatesTouched, setTemplatesTouched] = useState(false);

  const [leaderInput, setLeaderInput] = useState('');
  const [leaderEmails, setLeaderEmails] = useState<string[]>([]);
  const [leaderError, setLeaderError] = useState<string | null>(null);

  // Controlled state das sanfonas: todas abertas na criação,
  // isolado do localStorage (que serve só ao settings/dashboard).
  const [openDataCamp, setOpenDataCamp] = useState(true);
  const [openTemplates, setOpenTemplates] = useState(true);
  const [openBranding, setOpenBranding] = useState(true);
  const [openLeaders, setOpenLeaders] = useState(true);

  const monthlyValueCents = Math.round((parseFloat(monthlyValue) || 0) * 100);

  const addLeader = () => {
    const trimmed = leaderInput.trim().toLowerCase();
    if (!trimmed) return;
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!ok) {
      setLeaderError('Email inválido');
      return;
    }
    if (leaderEmails.includes(trimmed)) {
      setLeaderError('Email já adicionado');
      return;
    }
    setLeaderEmails([...leaderEmails, trimmed]);
    setLeaderInput('');
    setLeaderError(null);
  };

  const removeLeader = (email: string) => {
    setLeaderEmails(leaderEmails.filter((e) => e !== email));
  };

  const submit = async (
    _prev: ActionResult<{ campaignId: string }> | null,
  ): Promise<ActionResult<{ campaignId: string }>> => {
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

    if (leaderEmails.length > 0) {
      formData.set('leaderEmails', JSON.stringify(leaderEmails));
    }

    const result = await createCampaign(formData);
    if (!result.ok) {
      toast(result.error, 'error');
    } else {
      router.push(`/campaigns/${result.data.campaignId}`);
    }
    return result;
  };

  const [, formAction] = useActionState(submit, null);

  return (
    <form action={formAction} className="space-y-4">
      <CollapsibleSection
        id="new-campaign-data"
        title="Dados da Campanha"
        open={openDataCamp}
        onOpenChange={setOpenDataCamp}
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

      <CollapsibleSection
        id="new-templates"
        title="Templates de Mensagem"
        open={openTemplates}
        onOpenChange={setOpenTemplates}
      >
        <p className="text-xs text-text-muted mb-4">
          Personalizar mensagens de cobrança — opcional, há defaults prontos.
        </p>
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

      <CollapsibleSection
        id="new-branding"
        title="Personalizar Aparência"
        open={openBranding}
        onOpenChange={setOpenBranding}
      >
        <p className="text-xs text-text-muted mb-4">
          Logo, cores e assinatura — opcional, dá pra configurar depois.
        </p>
        <BrandingFields values={branding} onChange={setBranding} />
      </CollapsibleSection>

      <CollapsibleSection
        id="new-leaders"
        title="Líderes da Campanha"
        open={openLeaders}
        onOpenChange={setOpenLeaders}
      >
        <p className="text-xs text-text-muted mb-4">
          Convide outras pessoas para co-administrar — opcional, é possível adicionar depois.
        </p>
        <div className="flex gap-2">
          <Input
            name="leaderInput"
            label="Email do líder"
            type="email"
            value={leaderInput}
            onChange={(e) => {
              setLeaderInput(e.target.value);
              if (leaderError) setLeaderError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addLeader();
              }
            }}
            placeholder="lider@exemplo.com"
          />
          <div className="flex items-end">
            <Button type="button" variant="outline" onClick={addLeader} disabled={!leaderInput.trim()}>
              <UserPlus size={14} aria-hidden="true" />
              Adicionar
            </Button>
          </div>
        </div>
        {leaderError && <p className="text-sm text-danger mt-2">{leaderError}</p>}
        {leaderEmails.length > 0 && (
          <ul className="flex flex-wrap gap-2 mt-4">
            {leaderEmails.map((email) => (
              <li
                key={email}
                className="inline-flex items-center gap-2 pl-3 pr-1 py-1 bg-card-hover border border-border rounded-full text-sm text-text-primary"
              >
                {email}
                <button
                  type="button"
                  onClick={() => removeLeader(email)}
                  className="size-6 inline-flex items-center justify-center rounded-full text-text-muted hover:text-danger hover:bg-danger-bg transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
                  aria-label={`Remover ${email}`}
                >
                  <X size={13} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </CollapsibleSection>

      <div className="flex justify-end pt-2">
        <SubmitButton pendingLabel="Criando...">
          <Plus size={16} aria-hidden="true" />
          Criar Campanha
        </SubmitButton>
      </div>
    </form>
  );
}
