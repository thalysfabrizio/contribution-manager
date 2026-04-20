'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { Save } from 'lucide-react';
import { DEFAULT_TEMPLATES, type CampaignTemplates } from '@/lib/templates';
import { updateTemplates } from '@/actions/campaign';
import { TemplateFieldsEditor } from './TemplateFieldsEditor';

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
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  return (
    <Card className="p-5 md:p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-text-primary">Templates de Mensagem</h2>
        <form
          action={async () => {
            setSaving(true);
            const result = await updateTemplates(campaignId, templates);
            setSaving(false);
            if (!result.ok) {
              toast(result.error, 'error');
              return;
            }
            toast('Templates salvos', 'success');
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

      <TemplateFieldsEditor
        templates={templates}
        onChange={setTemplates}
        campaignName={campaignName}
        pixKey={pixKey}
        monthlyValue={monthlyValue}
        paymentDayStart={paymentDayStart}
        paymentDayEnd={paymentDayEnd}
      />
    </Card>
  );
}
