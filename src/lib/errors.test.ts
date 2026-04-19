import { vi } from 'vitest';
import { err, handlePrismaError, ok } from './errors';

describe('ok / err', () => {
  it('ok envolve payload', () => {
    expect(ok({ id: '1' })).toEqual({ ok: true, data: { id: '1' } });
  });

  it('err retorna falha com mensagem e código opcional', () => {
    expect(err('falhou')).toEqual({ ok: false, error: 'falhou', code: undefined });
    expect(err('falhou', 'X1')).toEqual({ ok: false, error: 'falhou', code: 'X1' });
  });
});

describe('handlePrismaError', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('mapeia P2002 com campo do meta.target', () => {
    const e = { code: 'P2002', meta: { target: ['email'] } };
    const result = handlePrismaError(e);
    expect(result).toEqual({
      ok: false,
      error: 'Este email já está em uso',
      code: 'P2002',
    });
  });

  it('mapeia P2002 sem meta.target', () => {
    const e = { code: 'P2002' };
    const result = handlePrismaError(e);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/já existe/i);
  });

  it('mapeia P2025 (registro não encontrado)', () => {
    const result = handlePrismaError({ code: 'P2025' });
    expect(result).toEqual({
      ok: false,
      error: 'Registro não encontrado ou já removido',
      code: 'P2025',
    });
  });

  it('mapeia P2003 (FK violation)', () => {
    const result = handlePrismaError({ code: 'P2003' });
    expect(result).toEqual({
      ok: false,
      error: 'Operação viola uma relação obrigatória',
      code: 'P2003',
    });
  });

  it('retorna mensagem genérica e loga erro de runtime (TypeError)', () => {
    const e = new TypeError('Cannot read properties of undefined');
    const result = handlePrismaError(e, { action: 'x', userId: 'u1' });
    expect(result).toEqual({
      ok: false,
      error: 'Erro inesperado. Tente novamente.',
      code: undefined,
    });
    expect(errorSpy).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(errorSpy.mock.calls[0][0] as string);
    expect(payload.level).toBe('error');
    expect(payload.action).toBe('x');
    expect(payload.userId).toBe('u1');
    expect(payload.error).toMatchObject({ name: 'TypeError' });
  });

  it('loga códigos Prisma desconhecidos como erro genérico', () => {
    const result = handlePrismaError({ code: 'P9999' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/inesperado/i);
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });

  it('preserva mensagem de Error plain (permissões, checks de negócio)', () => {
    const result = handlePrismaError(new Error('Sem acesso a esta campanha'));
    expect(result).toEqual({
      ok: false,
      error: 'Sem acesso a esta campanha',
      code: undefined,
    });
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('mascara erros do próprio Prisma sem código conhecido', () => {
    class PrismaClientValidationError extends Error {}
    const e = new PrismaClientValidationError('Invalid `prisma.x.create()` invocation');
    const result = handlePrismaError(e, { action: 'test' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/inesperado/i);
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });

  it('formata ZodError usando a primeira issue', () => {
    class ZodError extends Error {
      issues = [{ message: 'Nome é obrigatório', path: ['name'] }];
      constructor() {
        super('zod');
      }
    }
    const result = handlePrismaError(new ZodError());
    expect(result).toEqual({
      ok: false,
      error: 'Nome é obrigatório',
      code: 'VALIDATION',
    });
  });
});
