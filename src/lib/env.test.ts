import { envSchema, loadEnv, __resetEnvCacheForTests } from './env';

const validEnv = {
  NODE_ENV: 'development',
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
  NEXTAUTH_URL: 'http://localhost:3000',
  NEXTAUTH_SECRET: 'a'.repeat(32),
  GOOGLE_CLIENT_ID: 'google-client-id',
  GOOGLE_CLIENT_SECRET: 'google-client-secret',
  RESEND_API_KEY: 're_xxxxxxxxxxxxx',
  EMAIL_FROM: 'noreply@example.com',
};

describe('envSchema', () => {
  it('aceita um conjunto de variáveis completo e válido', () => {
    expect(() => envSchema.parse(validEnv)).not.toThrow();
  });

  it('assume NODE_ENV=development quando ausente', () => {
    const { NODE_ENV: _omit, ...rest } = validEnv;
    void _omit;
    const parsed = envSchema.parse(rest);
    expect(parsed.NODE_ENV).toBe('development');
  });

  it('rejeita DATABASE_URL ausente', () => {
    const { DATABASE_URL: _omit, ...rest } = validEnv;
    void _omit;
    const result = envSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejeita DATABASE_URL com protocolo errado', () => {
    const result = envSchema.safeParse({ ...validEnv, DATABASE_URL: 'mysql://x' });
    expect(result.success).toBe(false);
  });

  it('aceita DATABASE_URL com prefixo postgres://', () => {
    const result = envSchema.safeParse({
      ...validEnv,
      DATABASE_URL: 'postgres://u:p@host:5432/db',
    });
    expect(result.success).toBe(true);
  });

  it('rejeita NEXTAUTH_URL inválida', () => {
    const result = envSchema.safeParse({ ...validEnv, NEXTAUTH_URL: 'nao-e-url' });
    expect(result.success).toBe(false);
  });

  it('rejeita NEXTAUTH_SECRET com menos de 32 caracteres', () => {
    const result = envSchema.safeParse({ ...validEnv, NEXTAUTH_SECRET: 'curto' });
    expect(result.success).toBe(false);
  });

  it('rejeita GOOGLE_CLIENT_ID vazio', () => {
    const result = envSchema.safeParse({ ...validEnv, GOOGLE_CLIENT_ID: '' });
    expect(result.success).toBe(false);
  });

  it('rejeita EMAIL_FROM que não é email', () => {
    const result = envSchema.safeParse({ ...validEnv, EMAIL_FROM: 'nao-e-email' });
    expect(result.success).toBe(false);
  });
});

describe('loadEnv', () => {
  beforeEach(() => {
    __resetEnvCacheForTests();
  });

  it('retorna objeto tipado quando variáveis são válidas', () => {
    const loaded = loadEnv(validEnv as unknown as NodeJS.ProcessEnv);
    expect(loaded.DATABASE_URL).toBe(validEnv.DATABASE_URL);
    expect(loaded.EMAIL_FROM).toBe(validEnv.EMAIL_FROM);
  });

  it('lança erro agregando todos os problemas quando envs são inválidas', () => {
    const broken = {
      NODE_ENV: 'development',
      DATABASE_URL: '',
      NEXTAUTH_URL: 'nao-url',
      NEXTAUTH_SECRET: 'curto',
      GOOGLE_CLIENT_ID: '',
      GOOGLE_CLIENT_SECRET: '',
      RESEND_API_KEY: '',
      EMAIL_FROM: 'nao',
    };
    expect(() => loadEnv(broken as unknown as NodeJS.ProcessEnv)).toThrow(
      /Variáveis de ambiente inválidas/,
    );
  });

  it('inclui o nome da variável na mensagem de erro', () => {
    const broken = { ...validEnv, NEXTAUTH_SECRET: 'curto' };
    try {
      loadEnv(broken as unknown as NodeJS.ProcessEnv);
      expect.unreachable('deveria ter lançado');
    } catch (e) {
      expect((e as Error).message).toMatch(/NEXTAUTH_SECRET/);
    }
  });
});
