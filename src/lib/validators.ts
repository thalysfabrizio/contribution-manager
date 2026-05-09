import { z } from 'zod';

const UNSAFE_URL_PROTOCOLS = /^(javascript|data|file|vbscript|about|blob):/i;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ONLY_DIGITS = /^\d+$/;
// Formato alfanumérico a partir de jul/2026 (IN RFB 2229/2024): 12 caracteres [0-9A-Z] + 2 dígitos verificadores numéricos.
const CNPJ_SHAPE = /^[0-9A-Z]{12}\d{2}$/;

function isValidCpf(raw: string): boolean {
  if (!ONLY_DIGITS.test(raw) || raw.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(raw)) return false;
  const digits = raw.split('').map(Number);
  const calc = (slice: number[], start: number) => {
    let sum = 0;
    for (let i = 0; i < slice.length; i++) sum += slice[i] * (start - i);
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  };
  return calc(digits.slice(0, 9), 10) === digits[9] && calc(digits.slice(0, 10), 11) === digits[10];
}

function isValidCnpj(raw: string): boolean {
  if (!CNPJ_SHAPE.test(raw)) return false;
  if (/^(.)\1{13}$/.test(raw)) return false;
  // Valor de cada posição = charCodeAt - 48 (dígitos '0'-'9' mapeiam para 0-9, letras 'A'-'Z' para 17-42).
  const values = raw.split('').map((c) => c.charCodeAt(0) - 48);
  const calc = (len: number) => {
    const weights =
      len === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < len; i++) sum += values[i] * weights[i];
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  };
  return calc(12) === values[12] && calc(13) === values[13];
}

function isValidBrPhone(raw: string): boolean {
  if (!/^\d{10,11}$/.test(raw)) return false;
  if (/^(\d)\1+$/.test(raw)) return false;
  if (raw.length === 11 && raw[2] !== '9') return false;
  return true;
}

export function isValidPixKey(key: string): boolean {
  const trimmed = key.trim();
  if (!trimmed) return false;
  if (EMAIL_REGEX.test(trimmed)) return true;
  if (UUID_V4_REGEX.test(trimmed)) return true;
  // Remove apenas os separadores usuais de CPF/CNPJ — mantém letras para CNPJ alfanumérico.
  const unformatted = trimmed.replace(/[.\-/]/g, '').toUpperCase();
  if (isValidCpf(unformatted)) return true;
  if (isValidCnpj(unformatted)) return true;
  if (isValidBrPhone(trimmed)) return true;
  return false;
}

export const pixKeySchema = z
  .string()
  .min(1, 'Chave PIX é obrigatória')
  .refine(isValidPixKey, {
    message:
      'Chave PIX inválida. Use email, telefone (10-11 dígitos), CPF, CNPJ ou chave aleatória (UUID).',
  });

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

export const campaignSchema = z
  .object({
    name: z.string().min(1, 'Nome é obrigatório').max(100),
    description: z.string().max(500).optional(),
    pixKey: pixKeySchema,
    monthlyValue: z.number().int().positive('Valor deve ser positivo'),
    startMonth: z.date(),
    endMonth: z.date(),
    paymentDayStart: z.number().int().min(1).max(31),
    paymentDayEnd: z.number().int().min(1).max(31),
  })
  .refine((data) => data.startMonth < data.endMonth, {
    message: 'Mês inicial deve ser anterior ao mês final',
    path: ['endMonth'],
  })
  .refine((data) => data.paymentDayStart <= data.paymentDayEnd, {
    message: 'Dia de início precisa ser menor ou igual ao dia de fim',
    path: ['paymentDayEnd'],
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

export const templatesSchema = z.object({
  charge: z.string().trim().min(1).max(2000),
  reminder: z.string().trim().min(1).max(2000),
  overdue: z.string().trim().min(1).max(2000),
  thanks: z.string().trim().min(1).max(2000),
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

export const eventStatusSchema = z.enum(['PLANNED', 'ONGOING', 'FINISHED', 'CANCELED']);

export const transactionKindSchema = z.enum(['EXPENSE', 'INCOME']);

export const eventSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório').max(120),
  description: z.string().trim().max(500).optional(),
  eventDate: z.date(),
  status: eventStatusSchema.default('PLANNED'),
});

export const eventTransactionSchema = z.object({
  kind: transactionKindSchema,
  amount: z.number().int().positive('Valor deve ser positivo'),
  description: z.string().trim().min(1, 'Descrição é obrigatória').max(200),
  occurredAt: z.date(),
});
