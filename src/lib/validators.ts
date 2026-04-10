import { z } from 'zod';

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

export const participantSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  phone: z
    .string()
    .regex(/^\d{10,11}$/, 'Telefone deve ter 10 ou 11 dígitos'),
});

export const paymentStatusSchema = z.enum(['PENDING', 'PAID_PIX', 'PAID_CASH', 'LATE']);
