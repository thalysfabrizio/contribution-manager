'use client';

import { useState } from 'react';
import { updateBranding } from '@/actions/campaign';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Save } from 'lucide-react';
import { BrandingFields, DEFAULT_ACCENT, type BrandingValues } from './BrandingFields';

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
  const [loading, setLoading] = useState(false);
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

  const saveAction = (
    <form
      action={async () => {
        setLoading(true);
        const formData = new FormData();
        formData.set('orgName', values.orgName);
        formData.set('logoUrl', values.logoUrl);
        formData.set('bannerUrl', values.bannerUrl);
        formData.set('accentColor', values.accentColor);
        formData.set('messageSignature', values.messageSignature);
        const result = await updateBranding(campaignId, formData);
        setLoading(false);
        if (!result.ok) {
          toast(result.error, 'error');
          return;
        }
        toast('Aparência atualizada', 'success');
        setOpen(false);
      }}
    >
      <Button type="submit" size="sm" disabled={loading || !isDirty}>
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
