'use client';

import Image from 'next/image';
import { Input, Textarea } from '@/components/ui/Input';

export const ACCENT_PRESETS = [
  { label: 'Roxo', value: '#8b5cf6' },
  { label: 'Azul', value: '#3b82f6' },
  { label: 'Verde', value: '#10b981' },
  { label: 'Vermelho', value: '#ef4444' },
  { label: 'Laranja', value: '#f59e0b' },
  { label: 'Rosa', value: '#ec4899' },
  { label: 'Teal', value: '#14b8a6' },
  { label: 'Indigo', value: '#6366f1' },
];

export const DEFAULT_ACCENT = '#8b5cf6';

export interface BrandingValues {
  orgName: string;
  logoUrl: string;
  bannerUrl: string;
  accentColor: string;
  messageSignature: string;
}

interface BrandingFieldsProps {
  values: BrandingValues;
  onChange: (next: BrandingValues) => void;
}

export function BrandingFields({ values, onChange }: BrandingFieldsProps) {
  const update = <K extends keyof BrandingValues>(key: K, value: BrandingValues[K]) => {
    onChange({ ...values, [key]: value });
  };

  return (
    <div className="space-y-5">
      <Input
        name="orgName"
        label="Nome da organizacao"
        value={values.orgName}
        onChange={(e) => update('orgName', e.target.value)}
        placeholder="Ex: Igreja Batista Central"
      />

      <Input
        name="logoUrl"
        label="URL do logo"
        value={values.logoUrl}
        onChange={(e) => update('logoUrl', e.target.value)}
        placeholder="https://exemplo.com/logo.png"
        type="url"
      />

      <Input
        name="bannerUrl"
        label="URL da imagem de capa"
        value={values.bannerUrl}
        onChange={(e) => update('bannerUrl', e.target.value)}
        placeholder="https://exemplo.com/banner.jpg"
        type="url"
      />

      {(values.logoUrl || values.bannerUrl) && (
        <div className="flex items-center gap-3">
          {values.logoUrl && (
            <div className="relative size-12 rounded-lg border border-border overflow-hidden bg-app">
              <Image
                src={values.logoUrl}
                alt="Logo"
                fill
                sizes="48px"
                className="object-contain"
                unoptimized
              />
            </div>
          )}
          {values.bannerUrl && (
            <div className="relative flex-1 h-16 rounded-lg border border-border overflow-hidden bg-app">
              <Image
                src={values.bannerUrl}
                alt="Banner"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                unoptimized
              />
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
              onClick={() => update('accentColor', preset.value)}
              className={`size-9 rounded-full border-2 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                values.accentColor === preset.value
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
        value={values.messageSignature}
        onChange={(e) => update('messageSignature', e.target.value)}
        placeholder="Texto adicionado ao final das mensagens de WhatsApp"
        rows={2}
      />
    </div>
  );
}
