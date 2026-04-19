import { vi, type Mock } from 'vitest';
import { fakeUser, fakeMember } from '@/test/helpers';

const { createMockPrisma } = await vi.hoisted(() => import('@/test/mocks/prisma'));

vi.mock('@/lib/prisma', () => ({
  prisma: createMockPrisma(),
}));

vi.mock('@/lib/permissions', () => ({
  requireCampaignAccess: vi.fn(),
}));

import { prisma } from '@/lib/prisma';
import { requireCampaignAccess } from '@/lib/permissions';
import { loadMoreActivity } from './activity';

const mockPrisma = prisma as unknown as Record<string, Record<string, Mock>>;

beforeEach(() => {
  vi.clearAllMocks();
  (requireCampaignAccess as Mock).mockResolvedValue({
    user: fakeUser(),
    member: fakeMember(),
  });
});

function fakeLog(id: string) {
  return {
    id,
    action: 'PAYMENT_UPDATED',
    entity: 'Payment',
    entityId: 'participant-1',
    details: { from: 'PENDING', to: 'PAID_PIX' },
    user: { name: 'Usuário Teste' },
    createdAt: new Date('2026-04-01'),
  };
}

describe('loadMoreActivity', () => {
  it('retorna hasMore: false quando ≤ PAGE_SIZE', async () => {
    const logs = Array.from({ length: 5 }, (_, i) => fakeLog(`log-${i}`));
    mockPrisma.auditLog.findMany.mockResolvedValue(logs);

    const result = await loadMoreActivity('campaign-1');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.hasMore).toBe(false);
      expect(result.data.items).toHaveLength(5);
    }
  });

  it('retorna hasMore: true quando > PAGE_SIZE', async () => {
    const logs = Array.from({ length: 21 }, (_, i) => fakeLog(`log-${i}`));
    mockPrisma.auditLog.findMany.mockResolvedValue(logs);

    const result = await loadMoreActivity('campaign-1');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.hasMore).toBe(true);
      expect(result.data.items).toHaveLength(20);
    }
  });

  it('usa cursor + skip quando cursor fornecido', async () => {
    mockPrisma.auditLog.findMany.mockResolvedValue([]);

    await loadMoreActivity('campaign-1', 'cursor-id');

    const call = mockPrisma.auditLog.findMany.mock.calls[0][0];
    expect(call.cursor).toEqual({ id: 'cursor-id' });
    expect(call.skip).toBe(1);
  });

  it('mapeia campos corretamente para ActivityEntry', async () => {
    mockPrisma.auditLog.findMany.mockResolvedValue([fakeLog('log-1')]);

    const result = await loadMoreActivity('campaign-1');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const item = result.data.items[0];

    expect(item.id).toBe('log-1');
    expect(item.action).toBe('PAYMENT_UPDATED');
    expect(item.entity).toBe('Payment');
    expect(item.entityId).toBe('participant-1');
    expect(item.userName).toBe('Usuário Teste');
    expect(item.createdAt).toBeInstanceOf(Date);
  });
});
