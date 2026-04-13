import { vi } from 'vitest';
import { checkRateLimit, cleanupExpiredRateLimits } from './rate-limit';

interface StoredRecord {
  count: number;
  windowStart: Date;
}

type UpdateData =
  | { count: number; windowStart: Date }
  | { count: { increment: number } };

function makePrisma(initial: StoredRecord | null = null) {
  let state: StoredRecord | null = initial;
  const findUnique = vi.fn(async () => state);
  const create = vi.fn(async ({ data }: { data: { key: string; count: number; windowStart: Date } }) => {
    state = { count: data.count, windowStart: data.windowStart };
    return {};
  });
  const update = vi.fn(async ({ data }: { data: UpdateData }) => {
    if (!state) throw new Error('update on missing record');
    if ('windowStart' in data) {
      state = { count: data.count, windowStart: data.windowStart };
    } else {
      state = { ...state, count: state.count + data.count.increment };
    }
    return {};
  });
  const deleteMany = vi.fn(async () => ({ count: 0 }));
  return {
    client: { rateLimit: { findUnique, create, update, deleteMany } },
    get state() {
      return state;
    },
    findUnique,
    create,
    update,
    deleteMany,
  };
}

describe('checkRateLimit', () => {
  it('cria registro na primeira chamada (allowed)', async () => {
    const p = makePrisma();
    const now = new Date('2026-04-13T12:00:00Z');
    const r = await checkRateLimit('k1', 3, 60_000, now, p.client);
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(2);
    expect(p.create).toHaveBeenCalled();
  });

  it('incrementa count nas chamadas seguintes dentro da janela', async () => {
    const now = new Date('2026-04-13T12:00:00Z');
    const p = makePrisma({ count: 1, windowStart: now });
    const later = new Date(now.getTime() + 10_000);
    const r = await checkRateLimit('k1', 3, 60_000, later, p.client);
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(1);
    expect(p.update).toHaveBeenCalledWith({
      where: { key: 'k1' },
      data: { count: { increment: 1 } },
    });
  });

  it('bloqueia quando count >= max', async () => {
    const now = new Date('2026-04-13T12:00:00Z');
    const p = makePrisma({ count: 3, windowStart: now });
    const later = new Date(now.getTime() + 10_000);
    const r = await checkRateLimit('k1', 3, 60_000, later, p.client);
    expect(r.allowed).toBe(false);
    expect(r.retryAfter).toBeGreaterThan(0);
    expect(r.remaining).toBe(0);
  });

  it('retryAfter reflete tempo restante até fim da janela', async () => {
    const now = new Date('2026-04-13T12:00:00Z');
    const p = makePrisma({ count: 5, windowStart: now });
    const later = new Date(now.getTime() + 10_000); // 10s dentro de 60s
    const r = await checkRateLimit('k1', 5, 60_000, later, p.client);
    expect(r.allowed).toBe(false);
    expect(r.retryAfter).toBe(50);
  });

  it('reinicia contagem quando janela expirou', async () => {
    const old = new Date('2026-04-13T12:00:00Z');
    const p = makePrisma({ count: 5, windowStart: old });
    const muchLater = new Date(old.getTime() + 120_000); // 120s depois, janela de 60s
    const r = await checkRateLimit('k1', 5, 60_000, muchLater, p.client);
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(4);
    expect(p.update).toHaveBeenCalledWith({
      where: { key: 'k1' },
      data: { count: 1, windowStart: muchLater },
    });
  });

  it('chaves distintas não se interferem', async () => {
    const p = makePrisma();
    const now = new Date('2026-04-13T12:00:00Z');
    await checkRateLimit('a', 2, 60_000, now, p.client);
    // Reset mock para segunda key isolada:
    const p2 = makePrisma();
    const r = await checkRateLimit('b', 2, 60_000, now, p2.client);
    expect(r.allowed).toBe(true);
  });
});

describe('cleanupExpiredRateLimits', () => {
  it('deleta registros com windowStart mais antigo que o cutoff', async () => {
    const p = makePrisma();
    p.deleteMany.mockResolvedValueOnce({ count: 7 });
    const now = new Date('2026-04-13T12:00:00Z');
    const result = await cleanupExpiredRateLimits(24 * 60 * 60 * 1000, now, p.client);
    expect(result).toBe(7);
    expect(p.deleteMany).toHaveBeenCalledWith({
      where: { windowStart: { lt: new Date('2026-04-12T12:00:00Z') } },
    });
  });
});
