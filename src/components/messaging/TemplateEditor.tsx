'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { RotateCcw, Save, Eye, EyeOff } from 'lucide-react';
import {
  DEFAULT_TEMPLATES,
  TEMPLATE_VARIABLES,
  TEMPLATE_LABELS,
  replaceVariables,
  type CampaignTemplates,
} from '@/lib/templates';
import { updateTemplates } from '@/actions/campaign';

interface TemplateEditorProps {
  campaignId: string;
  campaignName: string;
  pixKey: string;
  monthlyValue: number;
  paymentDayStart: number;
  paymentDayEnd: number;
  templates: CampaignTemplates | null;
}

export function TemplateEditor({
  campaignId,
  campaignName,
  pixKey,
  monthlyValue,
  paymentDayStart,
  paymentDayEnd,
  templates: initialTemplates,
}: TemplateEditorProps) {
  const [templates, setTemplates] = useState<CampaignTemplates>(
    initialTemplates ?? DEFAULT_TEMPLATES,
  );
  const [activeTab, setActiveTab] = useState<keyof CampaignTemplates>('charge');
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const insertVariable = (variable: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = templates[activeTab];
    const newValue = currentValue.substring(0, start) + variable + currentValue.substring(end);

    setTemplates({ ...templates, [activeTab]: newValue });

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variable.length, start + variable.length);
    });
  };

  const resetTemplate = () => {
    setTemplates({ ...templates, [activeTab]: DEFAULT_TEMPLATES[activeTab] });
    toast('Template restaurado ao padrão', 'info');
  };

  const previewContext = {
    participantName: 'Maria Silva',
    pixKey,
    value: (monthlyValue / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    campaignName,
    currentMonth: new Date().toLocaleDateString('pt-BR', { month: '2-digit', year: '2-digit' }),
    pendingMonths: 'Lembrando que estão pendentes os pagamentos dos meses: Jan/26, Fev/26.',
    remainingMonths: '6',
    paymentDeadline: `do dia ${paymentDayStart} ao dia ${paymentDayEnd}`,
  };

  const tabs = Object.keys(TEMPLATE_LABELS) as (keyof CampaignTemplates)[];

  return (
    <Card className="p-5 md:p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-text-primary">Templates de Mensagem</h2>
        <form
          action={async () => {
            setSaving(true);
            try {
              await updateTemplates(campaignId, templates);
              toast('Templates salvos', 'success');
            } catch {
              toast('Erro ao salvar templates', 'error');
            } finally {
              setSaving(false);
            }
          }}
        >
          <Button type="submit" size="sm" disabled={saving}>
            {saving ? (
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
        </form>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1" role="tablist">
        {tabs.map((key) => (
          <button
            key={key}
            role="tab"
            aria-selected={activeTab === key}
            onClick={() => setActiveTab(key)}
            className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 min-h-[36px] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${
              activeTab === key
                ? 'bg-primary text-primary-fg shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-card-hover'
            }`}
          >
            {TEMPLATE_LABELS[key]}
          </button>
        ))}
      </div>

      {/* Variable buttons */}
      <div className="mb-3">
        <p className="text-xs text-text-muted mb-2">Inserir variável:</p>
        <div className="flex flex-wrap gap-1.5">
          {TEMPLATE_VARIABLES.map((v) => (
            <button
              key={v.key}
              onClick={() => insertVariable(v.key)}
              className="px-2.5 py-1.5 text-xs rounded-md border border-border text-text-secondary hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={templates[activeTab]}
        onChange={(e) => setTemplates({ ...templates, [activeTab]: e.target.value })}
        rows={8}
        aria-label={`Template: ${TEMPLATE_LABELS[activeTab]}`}
        className="w-full rounded-lg border border-border bg-app px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-y"
      />

      {/* Actions */}
      <div className="flex items-center justify-between mt-3">
        <button
          onClick={resetTemplate}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors min-h-[32px] px-1 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary rounded"
        >
          <RotateCcw size={12} aria-hidden="true" />
          Restaurar Padrão
        </button>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-1.5 text-xs text-primary hover:text-primary-hover transition-colors min-h-[32px] px-1 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary rounded"
        >
          {showPreview ? <EyeOff size={12} aria-hidden="true" /> : <Eye size={12} aria-hidden="true" />}
          {showPreview ? 'Ocultar Preview' : 'Ver Preview'}
        </button>
      </div>

      {/* Preview */}
      {showPreview && (
        <div className="mt-3 p-3.5 bg-app border border-border rounded-lg animate-slide-up">
          <p className="text-xs text-text-muted mb-2 font-medium">Pré-visualização (dados de exemplo):</p>
          <div
            className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: replaceVariables(templates[activeTab], previewContext),
            }}
          />
        </div>
      )}
    </Card>
  );
}
