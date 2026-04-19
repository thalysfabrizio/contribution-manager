import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL é obrigatória')
    .refine(
      (v) => v.startsWith('postgres://') || v.startsWith('postgresql://'),
      'DATABASE_URL deve começar com postgres:// ou postgresql://',
    ),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL deve ser uma URL válida'),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, 'NEXTAUTH_SECRET deve ter pelo menos 32 caracteres (use `openssl rand -base64 32`)'),
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID é obrigatório'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET é obrigatório'),
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY é obrigatório'),
  EMAIL_FROM: z.string().email('EMAIL_FROM deve ser um email válido'),
  SENTRY_DSN: z.string().url('SENTRY_DSN deve ser uma URL válida').optional(),
  SENTRY_ENVIRONMENT: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(raiz)'}: ${issue.message}`)
      .join('\n');
    throw new Error(
      `Variáveis de ambiente inválidas ou ausentes:\n${issues}\n\n` +
        `Verifique seu arquivo .env ou a configuração do ambiente. ` +
        `Consulte .env.example para a lista completa.`,
    );
  }
  return result.data;
}

export const env: Env = new Proxy({} as Env, {
  get(_target, key: string) {
    if (!cached) cached = loadEnv();
    return cached[key as keyof Env];
  },
});

export function __resetEnvCacheForTests(): void {
  cached = undefined;
}
