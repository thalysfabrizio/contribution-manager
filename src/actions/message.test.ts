import { vi, type Mock } from 'vitest';
import { fakeUser, fakeMember } from '@/test/helpers';

const { createMockPrisma } = await vi.hoisted(() => import('@/test/mocks/prisma'));

vi.mock('@/lib/prisma', () => ({
  prisma: createMockPrisma(),
}));

vi.mock('@/lib/permissions', () => ({
  requireCampaignAccess: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { prisma } from '@/lib/prisma';
import { requireCampaignAccess } from '@/lib/permissions';
import { revalidatePath } from 'next/cache';
import { confirmMessageSent } from './message';

const mockPrisma = prisma as unknown as Record<string, Record<string, Mock>>;

beforeEach(() => {
  vi.clearAllMocks();
  (requireCampaignAccess as Mock).mockResolvedValue({
    user: fakeUser(),
    member: fakeMember(),
  });
});

describe('confirmMessageSent', () => {
  it('verifica permissão via requireCampaignAccess', async () => {
    mockPrisma.auditLog.create.mockResolvedValue({});

    await confirmMessageSent('campaign-1', 'participant-1', 'charge');
    expect(requireCampaignAccess).toHaveBeenCalledWith('campaign-1');
  });

  it('cria auditLog MESSAGE_SENT com templateType', async () => {
    mockPrisma.auditLog.create.mockResolvedValue({});

    await confirmMessageSent('campaign-1', 'participant-1', 'reminder');

    const auditCall = mockPrisma.auditLog.create.mock.calls[0][0];
    expect(auditCall.data.action).toBe('MESSAGE_SENT');
    expect(auditCall.data.details.templateType).toBe('reminder');
    expect(auditCall.data.entityId).toBe('participant-1');
  });

  it('chama revalidatePath', async () => {
    mockPrisma.auditLog.create.mockResolvedValue({});

    await confirmMessageSent('campaign-1', 'participant-1', 'charge');
    expect(revalidatePath).toHaveBeenCalledWith('/campaigns/campaign-1');
  });
});
