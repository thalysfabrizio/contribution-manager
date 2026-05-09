import { vi, type Mock } from 'vitest';

const { createMockPrisma } = await vi.hoisted(() => import('@/test/mocks/prisma'));

vi.mock('./prisma', () => ({
  prisma: createMockPrisma(),
}));

import { prisma } from './prisma';
import { getCampaignFinancialSummary } from './queries';

const mockPrisma = prisma as unknown as Record<string, Record<string, Mock>>;
const campaignId = 'campaign-1';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getCampaignFinancialSummary', () => {
  it('soma contribuições pagas (PIX + cash) e desconta despesas', async () => {
    mockPrisma.campaign.findUnique.mockResolvedValue({
      monthlyValue: 5000,
      participants: [
        {
          payments: [
            { status: 'PAID_PIX' },
            { status: 'PAID_CASH' },
            { status: 'PENDING' },
            { status: 'LATE' },
          ],
        },
        {
          payments: [{ status: 'PAID_PIX' }],
        },
      ],
    });
    mockPrisma.eventTransaction.groupBy.mockResolvedValue([
      { kind: 'EXPENSE', _sum: { amount: 30000 } },
      { kind: 'INCOME', _sum: { amount: 120000 } },
    ]);

    const result = await getCampaignFinancialSummary(campaignId);

    expect(result.contributionsReceived).toBe(15000);
    expect(result.eventsExpense).toBe(30000);
    expect(result.eventsIncome).toBe(120000);
    expect(result.eventsNet).toBe(90000);
    expect(result.cashBalance).toBe(105000);
  });

  it('saldo negativo quando despesas superam contribuições + receitas', async () => {
    mockPrisma.campaign.findUnique.mockResolvedValue({
      monthlyValue: 5000,
      participants: [{ payments: [{ status: 'PAID_PIX' }] }],
    });
    mockPrisma.eventTransaction.groupBy.mockResolvedValue([
      { kind: 'EXPENSE', _sum: { amount: 50000 } },
    ]);

    const result = await getCampaignFinancialSummary(campaignId);

    expect(result.contributionsReceived).toBe(5000);
    expect(result.eventsExpense).toBe(50000);
    expect(result.eventsIncome).toBe(0);
    expect(result.eventsNet).toBe(-50000);
    expect(result.cashBalance).toBe(-45000);
  });

  it('zera tudo quando campanha não existe', async () => {
    mockPrisma.campaign.findUnique.mockResolvedValue(null);
    mockPrisma.eventTransaction.groupBy.mockResolvedValue([]);

    const result = await getCampaignFinancialSummary(campaignId);

    expect(result).toEqual({
      contributionsReceived: 0,
      eventsExpense: 0,
      eventsIncome: 0,
      eventsNet: 0,
      cashBalance: 0,
    });
  });

  it('lida com aggregate vazio retornando zeros para eventos', async () => {
    mockPrisma.campaign.findUnique.mockResolvedValue({
      monthlyValue: 2000,
      participants: [{ payments: [{ status: 'PAID_CASH' }] }],
    });
    mockPrisma.eventTransaction.groupBy.mockResolvedValue([]);

    const result = await getCampaignFinancialSummary(campaignId);

    expect(result.contributionsReceived).toBe(2000);
    expect(result.eventsExpense).toBe(0);
    expect(result.eventsIncome).toBe(0);
    expect(result.cashBalance).toBe(2000);
  });
});
