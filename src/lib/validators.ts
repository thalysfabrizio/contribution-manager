import { z } from 'zod';

const UNSAFE_URL_PROTOCOLS = /^(javascript|data|file|vbscript|about|blob):/i;

export const safeHttpsUrlSchema = z
  .string()
  .trim()
  .max(2048, 'URL muito longa (máximo 2048 caracteres)')
  .refine((v) => !UNSAFE_URL_PROTOCOLS.test(v), {
    message: 'URL com protocolo não permitido (use apenas https://)',
  })
  .refine(
    (v) => {
      try {
        const url = new URL(v);
        return url.protocol === 'https:';
      } catch {
        return false;
      }
    },
    { message: 'URL inválida — use uma URL https:// completa' },
  );

export const optionalSafeHttpsUrl = safeHttpsUrlSchema.nullable();

export const campaignSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  description: z.string().max(500).optional(),
  pixKey: z.string().min(1, 'Chave PIX é obrigatória'),
  monthlyValue: z.number().int().positive('Valor deve ser positivo'),
  startMonth: z.date(),
  endMonth: z.date(),
  paymentDayStart: z.number().int().min(1).max(31),
  paymentDayEnd: z.number().int().min(1).max(31),
});

export const brandingSchema = z.object({
  orgName: z.string().trim().max(100).nullable(),
  logoUrl: optionalSafeHttpsUrl,
  bannerUrl: optionalSafeHttpsUrl,
  accentColor: z
    .string()
    .trim()
    .regex(/^#[0-9a-f]{6}$/i, 'Cor deve estar em formato hexadecimal (#rrggbb)')
    .nullable(),
  messageSignature: z.string().trim().max(500).nullable(),
});

export const participantSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  phone: z
    .string()
    .regex(/^\d{10,11}$/, 'Telefone deve ter 10 ou 11 dígitos'),
});

export const paymentStatusSchema = z.enum(['PENDING', 'PAID_PIX', 'PAID_CASH', 'LATE']);

export const emailSchema = z
  .string()
  .min(1, 'Email é obrigatório')
  .trim()
  .toLowerCase()
  .email('Email inválido');
