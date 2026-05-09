import { vi, type Mock } from 'vitest';
import { fakeUser, fakeMember, fakeFormData } from '@/test/helpers';

const { createMockPrisma } = await vi.hoisted(() => import('@/test/mocks/prisma'));

vi.mock('@/lib/prisma', () => ({
  prisma: createMockPrisma(),
}));

vi.mock('@/lib/permissions', () => ({
  requireCampaignAccess: vi.fn(),
  requireCampaignOwner: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { prisma } from '@/lib/prisma';
import { requireCampaignAccess, requireCampaignOwner } from '@/lib/permissions';
import { createEvent, deleteEvent, updateEvent } from './event';

const mockPrisma = prisma as unknown as Record<string, Record<string, Mock>>;
const campaignId = 'campaign-1';
const eventId = 'event-1';

beforeEach(() => {
  vi.clearAllMocks();
  (requireCampaignAccess as Mock).mockResolvedValue({
    user: fakeUser(),
    member: fakeMember(),
  });
  (requireCampaignOwner as Mock).mockResolvedValue({
    user: fakeUser(),
    member: fakeMember(),
  });
});

describe('createEvent', () => {
  it('cria evento com auditLog', async () => {
    mockPrisma.event.create.mockResolvedValue({ id: eventId });
    mockPrisma.auditLog.create.mockResolvedValue({});

    const result = await createEvent(
      campaignId,
      fakeFormData({
        name: 'Festa Junina',
        eventDate: '2026-06-15',
        status: 'PLANNED',
      }),
    );

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.eventId).toBe(eventId);
    expect(mockPrisma.event.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          campaignId,
          name: 'Festa Junina',
          status: 'PLANNED',
        }),
      }),
    );
    const auditCall = mockPrisma.auditLog.create.mock.calls[0][0];
    expect(auditCall.data.action).toBe('EVENT_CREATED');
  });

  it('rejeita nome vazio', async () => {
    const result = await createEvent(
      campaignId,
      fakeFormData({ name: '', eventDate: '2026-06-15' }),
    );
    expect(result.ok).toBe(false);
    expect(mockPrisma.event.create).not.toHaveBeenCalled();
  });
});

describe('updateEvent', () => {
  it('atualiza evento existente', async () => {
    mockPrisma.event.findUnique.mockResolvedValue({ campaignId });
    mockPrisma.event.update.mockResolvedValue({});
    mockPrisma.auditLog.create.mockResolvedValue({});

    const result = await updateEvent(
      eventId,
      fakeFormData({
        name: 'Festa atualizada',
        eventDate: '2026-06-20',
        status: 'ONGOING',
      }),
    );

    expect(result.ok).toBe(true);
    expect(mockPrisma.event.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: eventId },
        data: expect.objectContaining({
          name: 'Festa atualizada',
          status: 'ONGOING',
        }),
      }),
    );
  });

  it('rejeita evento inexistente', async () => {
    mockPrisma.event.findUnique.mockResolvedValue(null);
    const result = await updateEvent(
      'inexistente',
      fakeFormData({ name: 'X', eventDate: '2026-06-15' }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Evento não encontrado');
  });
});

describe('deleteEvent', () => {
  it('exige OWNER e remove evento', async () => {
    mockPrisma.event.findUnique.mockResolvedValue({ campaignId, name: 'Festa' });
    mockPrisma.event.delete.mockResolvedValue({});
    mockPrisma.auditLog.create.mockResolvedValue({});

    const result = await deleteEvent(eventId);

    expect(result.ok).toBe(true);
    expect(requireCampaignOwner).toHaveBeenCalledWith(campaignId);
    expect(mockPrisma.event.delete).toHaveBeenCalledWith({ where: { id: eventId } });
    const auditCall = mockPrisma.auditLog.create.mock.calls[0][0];
    expect(auditCall.data.action).toBe('EVENT_REMOVED');
    expect(auditCall.data.details.name).toBe('Festa');
  });

  it('falha quando usuário não é OWNER', async () => {
    mockPrisma.event.findUnique.mockResolvedValue({ campaignId, name: 'Festa' });
    (requireCampaignOwner as Mock).mockRejectedValue(
      new Error('Apenas o proprietário pode realizar esta ação'),
    );

    const result = await deleteEvent(eventId);
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.error).toBe('Apenas o proprietário pode realizar esta ação');
  });
});
