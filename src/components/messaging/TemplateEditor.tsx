'use client';

import { useActionState, useState } from 'react';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { useToast } from '@/components/ui/Toast';
import { Save } from 'lucide-react';
import { DEFAULT_TEMPLATES, type CampaignTemplates } from '@/lib/templates';
import { updateTemplates } from '@/actions/campaign';
import { TemplateFieldsEditor } from './TemplateFieldsEditor';
import type { ActionResult } from '@/lib/errors';

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
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const baseline = initialTemplates ?? DEFAULT_TEMPLATES;
  const isDirty =
    templates.charge !== baseline.charge ||
    templates.reminder !== baseline.reminder ||
    templates.overdue !== baseline.overdue ||
    templates.thanks !== baseline.thanks;

  const submit = async (
    _prev: ActionResult<void> | null,
  ): Promise<ActionResult<void>> => {
    const result = await updateTemplates(campaignId, templates);
    if (!result.ok) {
      toast(result.error, 'error');
    } else {
      toast('Templates salvos', 'success');
      setOpen(false);
    }
    return result;
  };

  const [, formAction] = useActionState(submit, null);

  const saveAction = (
    <form action={formAction}>
      <SubmitButton size="sm" disabled={!isDirty}>
        <Save size={13} aria-hidden="true" />
        Salvar
      </SubmitButton>
    </form>
  );

  return (
    <CollapsibleSection
      id="templates"
      title="Templates de Mensagem"
      headerExtra={saveAction}
      open={open}
      onOpenChange={setOpen}
    >
      <TemplateFieldsEditor
        templates={templates}
        onChange={setTemplates}
        campaignName={campaignName}
        pixKey={pixKey}
        monthlyValue={monthlyValue}
        paymentDayStart={paymentDayStart}
        paymentDayEnd={paymentDayEnd}
      />
    </CollapsibleSection>
  );
}
