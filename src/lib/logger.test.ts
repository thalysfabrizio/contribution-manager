import { vi } from 'vitest';
import { logger } from './logger';

let logSpy: ReturnType<typeof vi.spyOn>;
let errorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  logSpy.mockRestore();
  errorSpy.mockRestore();
});

function lastLog(): Record<string, unknown> {
  const call = logSpy.mock.calls.at(-1) ?? errorSpy.mock.calls.at(-1);
  if (!call) throw new Error('Nenhum log capturado');
  return JSON.parse(call[0] as string);
}

describe('logger', () => {
  it('emite info em JSON com level, message e timestamp', () => {
    logger.info('hello', { userId: '123' });
    const payload = lastLog();
    expect(payload.level).toBe('info');
    expect(payload.message).toBe('hello');
    expect(payload.userId).toBe('123');
    expect(typeof payload.timestamp).toBe('string');
  });

  it('emite warn e error em console.error', () => {
    logger.warn('atenção');
    logger.error('falhou', { action: 'x' });
    expect(errorSpy).toHaveBeenCalledTimes(2);
    const lastPayload = JSON.parse(errorSpy.mock.calls.at(-1)![0] as string);
    expect(lastPayload.level).toBe('error');
    expect(lastPayload.action).toBe('x');
  });

  it('serializa Error com name/message/stack', () => {
    const err = new Error('boom');
    logger.error('capturou', { err });
    const payload = JSON.parse(errorSpy.mock.calls.at(-1)![0] as string);
    expect(payload.err).toMatchObject({ name: 'Error', message: 'boom' });
    expect(typeof (payload.err as { stack: string }).stack).toBe('string');
  });

  it('aceita log sem contexto', () => {
    logger.info('sem contexto');
    const payload = lastLog();
    expect(payload.message).toBe('sem contexto');
  });
});
