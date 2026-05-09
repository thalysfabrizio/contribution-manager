import { vi, type Mock } from 'vitest';
import { fakeUser, fakeMember, fakeFormData } from '@/test/helpers';

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
import {
  addEventTransaction,
  removeEventTransaction,
} from './event-transaction';

const mockPrisma = prisma as unknown as Record<string, Record<string, Mock>>;
const campaignId = 'campaign-1';
const eventId = 'event-1';

beforeEach(() => {
  vi.clearAllMocks();
  (requireCampaignAccess as Mock).mockResolvedValue({
    user: fakeUser(),
    member: fakeMember(),
  });
});

describe('addEventTransaction', () => {
  it('registra despesa em centavos com auditLog', async () => {
    mockPrisma.event.findUnique.mockResolvedValue({ campaignId });
    mockPrisma.eventTransaction.create.mockResolvedValue({ id: 'tx-1' });
    mockPrisma.auditLog.create.mockResolvedValue({});

    const result = await addEventTransaction(
      eventId,
      fakeFormData({
        kind: 'EXPENSE',
        amount: '300.50',
        description: 'Ingredientes',
        occurredAt: '2026-06-10',
      }),
    );

    expect(result.ok).toBe(true);
    expect(mockPrisma.eventTransaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          eventId,
          kind: 'EXPENSE',
          amount: 30050,
          description: 'Ingredientes',
        }),
      }),
    );
    const auditCall = mockPrisma.auditLog.create.mock.calls[0][0];
    expect(auditCall.data.action).toBe('EVENT_TRANSACTION_ADDED');
  });

  it('aceita vírgula como separador decimal', async () => {
    mockPrisma.event.findUnique.mockResolvedValue({ campaignId });
    mockPrisma.eventTransaction.create.mockResolvedValue({ id: 'tx-1' });
    mockPrisma.auditLog.create.mockResolvedValue({});

    await addEventTransaction(
      eventId,
      fakeFormData({
        kind: 'INCOME',
        amount: '1200,00',
        description: 'Vendas',
        occurredAt: '2026-06-15',
      }),
    );

    expect(mockPrisma.eventTransaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ amount: 120000, kind: 'INCOME' }),
      }),
    );
  });

  it('rejeita valor zero ou negativo', async () => {
    mockPrisma.event.findUnique.mockResolvedValue({ campaignId });

    const result = await addEventTransaction(
      eventId,
      fakeFormData({
        kind: 'EXPENSE',
        amount: '0',
        description: 'Teste',
        occurredAt: '2026-06-10',
      }),
    );
    expect(result.ok).toBe(false);
    expect(mockPrisma.eventTransaction.create).not.toHaveBeenCalled();
  });

  it('rejeita evento inexistente', async () => {
    mockPrisma.event.findUnique.mockResolvedValue(null);

    const result = await addEventTransaction(
      'inexistente',
      fakeFormData({
        kind: 'EXPENSE',
        amount: '10',
        description: 'X',
        occurredAt: '2026-06-10',
      }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Evento não encontrado');
  });
});

describe('removeEventTransaction', () => {
  it('remove transação e cria auditLog com detalhes', async () => {
    mockPrisma.eventTransaction.findUnique.mockResolvedValue({
      eventId,
      description: 'Ingredientes',
      kind: 'EXPENSE',
      amount: 30050,
      event: { campaignId },
    });
    mockPrisma.eventTransaction.delete.mockResolvedValue({});
    mockPrisma.auditLog.create.mockResolvedValue({});

    const result = await removeEventTransaction('tx-1');

    expect(result.ok).toBe(true);
    expect(mockPrisma.eventTransaction.delete).toHaveBeenCalledWith({
      where: { id: 'tx-1' },
    });
    const auditCall = mockPrisma.auditLog.create.mock.calls[0][0];
    expect(auditCall.data.action).toBe('EVENT_TRANSACTION_REMOVED');
    expect(auditCall.data.details.description).toBe('Ingredientes');
  });

  it('falha quando transação não existe', async () => {
    mockPrisma.eventTransaction.findUnique.mockResolvedValue(null);

    const result = await removeEventTransaction('inexistente');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Lançamento não encontrado');
  });
});
