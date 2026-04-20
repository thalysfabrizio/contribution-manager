'use client';

import { useState } from 'react';
import { updateBranding } from '@/actions/campaign';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Palette, Save } from 'lucide-react';
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
  const [values, setValues] = useState<BrandingValues>({
    orgName: orgName ?? '',
    logoUrl: logoUrl ?? '',
    bannerUrl: bannerUrl ?? '',
    accentColor: accentColor ?? DEFAULT_ACCENT,
    messageSignature: messageSignature ?? '',
  });
  const { toast } = useToast();

  return (
    <Card className="p-5 md:p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <Palette size={18} className="text-primary" aria-hidden="true" />
        <h2 className="text-base font-semibold text-text-primary">Personalizar Aparencia</h2>
      </div>

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
          toast('Aparencia atualizada', 'success');
        }}
        className="space-y-5"
      >
        <BrandingFields values={values} onChange={setValues} />

        <div className="flex justify-end pt-1">
          <Button type="submit" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="size-4 border-2 border-primary-fg/30 border-t-primary-fg rounded-full animate-spin" />
                Salvando...
              </span>
            ) : (
              <>
                <Save size={16} aria-hidden="true" />
                Salvar Aparencia
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
