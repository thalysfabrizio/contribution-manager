'use client';

import { useActionState, useState } from 'react';
import { updateBranding } from '@/actions/campaign';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { useToast } from '@/components/ui/Toast';
import { Save } from 'lucide-react';
import { BrandingFields, DEFAULT_ACCENT, type BrandingValues } from './BrandingFields';
import type { ActionResult } from '@/lib/errors';

interface BrandingFormProps {
  campaignId: string;
  orgName: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  accentColor: string | null;
  messageSignature: string | null;
}

export function BrandingForm({
  campaignId,
  orgName,
  logoUrl,
  bannerUrl,
  accentColor,
  messageSignature,
}: BrandingFormProps) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<BrandingValues>({
    orgName: orgName ?? '',
    logoUrl: logoUrl ?? '',
    bannerUrl: bannerUrl ?? '',
    accentColor: accentColor ?? DEFAULT_ACCENT,
    messageSignature: messageSignature ?? '',
  });
  const { toast } = useToast();

  const isDirty =
    values.orgName !== (orgName ?? '') ||
    values.logoUrl !== (logoUrl ?? '') ||
    values.bannerUrl !== (bannerUrl ?? '') ||
    values.accentColor !== (accentColor ?? DEFAULT_ACCENT) ||
    values.messageSignature !== (messageSignature ?? '');

  const submit = async (
    _prev: ActionResult<void> | null,
  ): Promise<ActionResult<void>> => {
    const formData = new FormData();
    formData.set('orgName', values.orgName);
    formData.set('logoUrl', values.logoUrl);
    formData.set('bannerUrl', values.bannerUrl);
    formData.set('accentColor', values.accentColor);
    formData.set('messageSignature', values.messageSignature);
    const result = await updateBranding(campaignId, formData);
    if (!result.ok) {
      toast(result.error, 'error');
    } else {
      toast('Aparência atualizada', 'success');
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
      id="branding"
      title="Personalizar Aparência"
      headerExtra={saveAction}
      open={open}
      onOpenChange={setOpen}
    >
      <BrandingFields values={values} onChange={setValues} />
    </CollapsibleSection>
  );
}
