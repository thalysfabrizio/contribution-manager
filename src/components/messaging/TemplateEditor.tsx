'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { RotateCcw } from 'lucide-react';
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

    // Reposicionar cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variable.length, start + variable.length);
    }, 0);
  };

  const resetTemplate = () => {
    setTemplates({ ...templates, [activeTab]: DEFAULT_TEMPLATES[activeTab] });
    toast('Template restaurado', 'info');
  };

  const previewContext = {
    participantName: 'Maria Silva',
    pixKey,
    value: `R$ ${(monthlyValue / 100).toFixed(2).replace('.', ',')}`,
    campaignName,
    currentMonth: new Date().toLocaleDateString('pt-BR', { month: '2-digit', year: '2-digit' }),
    pendingMonths: 'Lembrando que estão pendentes os pagamentos dos meses: Jan/26, Fev/26.',
    remainingMonths: '6',
    paymentDeadline: `do dia ${paymentDayStart} ao dia ${paymentDayEnd}`,
  };

  const tabs = Object.keys(TEMPLATE_LABELS) as (keyof CampaignTemplates)[];

  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-text-primary">Templates de Mensagem</h2>
        <form
          action={async () => {
            try {
              await updateTemplates(campaignId, templates);
              toast('Templates salvos', 'success');
            } catch {
              toast('Erro ao salvar templates', 'error');
            }
          }}
        >
          <Button type="submit" className="text-xs">
            Salvar Templates
          </Button>
        </form>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto">
        {tabs.map((key) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all duration-200 ${
              activeTab === key
                ? 'bg-primary text-primary-fg'
                : 'text-text-secondary hover:text-text-primary hover:bg-card-hover'
            }`}
          >
            {TEMPLATE_LABELS[key]}
          </button>
        ))}
      </div>

      {/* Variable buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 mb-3">
        {TEMPLATE_VARIABLES.map((v) => (
          <button
            key={v.key}
            onClick={() => insertVariable(v.key)}
            className="px-2 py-1 text-xs rounded border border-border text-text-secondary hover:text-primary hover:border-primary/30 transition-all duration-200"
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={templates[activeTab]}
        onChange={(e) => setTemplates({ ...templates, [activeTab]: e.target.value })}
        rows={8}
        className="w-full rounded-md border border-border bg-app px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-y"
      />

      {/* Actions */}
      <div className="flex items-center justify-between mt-3">
        <button
          onClick={resetTemplate}
          className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors"
        >
          <RotateCcw size={12} />
          Restaurar Padrão
        </button>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="text-xs text-primary hover:text-primary-hover transition-colors"
        >
          {showPreview ? 'Ocultar Preview' : 'Ver Preview'}
        </button>
      </div>

      {/* Preview */}
      {showPreview && (
        <div className="mt-3 p-3 bg-app border border-border rounded-md">
          <p className="text-xs text-text-muted mb-2">Pré-visualização (dados de exemplo):</p>
          <div
            className="text-sm text-text-primary whitespace-pre-wrap"
            dangerouslySetInnerHTML={{
              __html: replaceVariables(templates[activeTab], previewContext),
            }}
          />
        </div>
      )}
    </Card>
  );
}
