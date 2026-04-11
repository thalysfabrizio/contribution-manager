'use client';

import { useState } from 'react';
import { updateBranding } from '@/actions/campaign';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { Palette, Save } from 'lucide-react';

const ACCENT_PRESETS = [
  { label: 'Roxo', value: '#8b5cf6' },
  { label: 'Azul', value: '#3b82f6' },
  { label: 'Verde', value: '#10b981' },
  { label: 'Vermelho', value: '#ef4444' },
  { label: 'Laranja', value: '#f59e0b' },
  { label: 'Rosa', value: '#ec4899' },
  { label: 'Teal', value: '#14b8a6' },
  { label: 'Indigo', value: '#6366f1' },
];

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
  const [selectedColor, setSelectedColor] = useState(accentColor || '#8b5cf6');
  const { toast } = useToast();

  return (
    <Card className="p-5 md:p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <Palette size={18} className="text-primary" aria-hidden="true" />
        <h2 className="text-base font-semibold text-text-primary">Personalizar Aparencia</h2>
      </div>

      <form
        action={async (formData) => {
          setLoading(true);
          try {
            formData.set('accentColor', selectedColor);
            await updateBranding(campaignId, formData);
            toast('Aparencia atualizada', 'success');
          } catch {
            toast('Erro ao salvar', 'error');
          } finally {
            setLoading(false);
          }
        }}
        className="space-y-5"
      >
        <Input
          name="orgName"
          label="Nome da organizacao"
          defaultValue={orgName ?? ''}
          placeholder="Ex: Igreja Batista Central"
        />

        <Input
          name="logoUrl"
          label="URL do logo"
          defaultValue={logoUrl ?? ''}
          placeholder="https://exemplo.com/logo.png"
          type="url"
        />

        <Input
          name="bannerUrl"
          label="URL da imagem de capa"
          defaultValue={bannerUrl ?? ''}
          placeholder="https://exemplo.com/banner.jpg"
          type="url"
        />

        {/* Preview de imagens */}
        {(logoUrl || bannerUrl) && (
          <div className="flex items-center gap-3">
            {logoUrl && (
              <div className="size-12 rounded-lg border border-border overflow-hidden bg-app flex items-center justify-center">
                <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
              </div>
            )}
            {bannerUrl && (
              <div className="flex-1 h-16 rounded-lg border border-border overflow-hidden bg-app">
                <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-secondary">Cor de destaque</label>
          <div className="flex flex-wrap gap-2">
            {ACCENT_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setSelectedColor(preset.value)}
                className={`size-9 rounded-full border-2 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  selectedColor === preset.value
                    ? 'border-white scale-110 shadow-lg'
                    : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: preset.value }}
                aria-label={preset.label}
                title={preset.label}
              />
            ))}
          </div>
        </div>

        <Textarea
          name="messageSignature"
          label="Assinatura para mensagens"
          defaultValue={messageSignature ?? ''}
          placeholder="Texto adicionado ao final das mensagens de WhatsApp"
          rows={2}
        />

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
