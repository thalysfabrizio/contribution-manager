import { vi, type Mock } from 'vitest';
import { fakeUser, fakeMember, fakeCampaign } from '@/test/helpers';

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
import { updatePaymentStatus } from './payment';

const mockPrisma = prisma as unknown as Record<string, Record<string, Mock>>;

beforeEach(() => {
  vi.clearAllMocks();
  (requireCampaignAccess as Mock).mockResolvedValue({
    user: fakeUser(),
    member: fakeMember(),
  });
});

const campaignId = 'campaign-1';
const participantId = 'participant-1';
const month = new Date(Date.UTC(2026, 3, 1));

describe('updatePaymentStatus', () => {
  it('verifica permissão via requireCampaignAccess', async () => {
    mockPrisma.campaign.findUnique.mockResolvedValue(fakeCampaign());
    mockPrisma.payment.findUnique.mockResolvedValue(null);
    mockPrisma.payment.upsert.mockResolvedValue({});
    mockPrisma.auditLog.create.mockResolvedValue({});

    await updatePaymentStatus(campaignId, participantId, month, 'PAID_PIX');
    expect(requireCampaignAccess).toHaveBeenCalledWith(campaignId);
  });

  it('upsert para PAID_PIX com paidAt definido', async () => {
    mockPrisma.campaign.findUnique.mockResolvedValue(fakeCampaign());
    mockPrisma.payment.findUnique.mockResolvedValue(null);
    mockPrisma.payment.upsert.mockResolvedValue({});
    mockPrisma.auditLog.create.mockResolvedValue({});

    await updatePaymentStatus(campaignId, participantId, month, 'PAID_PIX');

    const call = mockPrisma.payment.upsert.mock.calls[0][0];
    expect(call.update.status).toBe('PAID_PIX');
    expect(call.update.paidAt).toBeInstanceOf(Date);
    expect(call.create.paidAt).toBeInstanceOf(Date);
  });

  it('upsert para PAID_CASH com paidAt definido', async () => {
    mockPrisma.campaign.findUnique.mockResolvedValue(fakeCampaign());
    mockPrisma.payment.findUnique.mockResolvedValue(null);
    mockPrisma.payment.upsert.mockResolvedValue({});
    mockPrisma.auditLog.create.mockResolvedValue({});

    await updatePaymentStatus(campaignId, participantId, month, 'PAID_CASH');

    const call = mockPrisma.payment.upsert.mock.calls[0][0];
    expect(call.update.paidAt).toBeInstanceOf(Date);
  });

  it('upsert para LATE com paidAt null', async () => {
    mockPrisma.campaign.findUnique.mockResolvedValue(fakeCampaign());
    mockPrisma.payment.findUnique.mockResolvedValue(null);
    mockPrisma.payment.upsert.mockResolvedValue({});
    mockPrisma.auditLog.create.mockResolvedValue({});

    await updatePaymentStatus(campaignId, participantId, month, 'LATE');

    const call = mockPrisma.payment.upsert.mock.calls[0][0];
    expect(call.update.paidAt).toBeNull();
    expect(call.create.paidAt).toBeNull();
  });

  it('deleta pagamento quando newStatus é PENDING', async () => {
    mockPrisma.campaign.findUnique.mockResolvedValue(fakeCampaign());
    mockPrisma.payment.findUnique.mockResolvedValue({ status: 'PAID_PIX' });
    mockPrisma.payment.deleteMany.mockResolvedValue({ count: 1 });
    mockPrisma.auditLog.create.mockResolvedValue({});

    await updatePaymentStatus(campaignId, participantId, month, 'PENDING');

    expect(mockPrisma.payment.deleteMany).toHaveBeenCalledWith({
      where: { participantId, month },
    });
    expect(mockPrisma.payment.upsert).not.toHaveBeenCalled();
  });

  it('bloqueia campanha encerrada', async () => {
    mockPrisma.campaign.findUnique.mockResolvedValue(
      fakeCampaign({ endMonth: new Date(Date.UTC(2020, 0, 1)) }),
    );

    await expect(
      updatePaymentStatus(campaignId, participantId, month, 'PAID_PIX'),
    ).rejects.toThrow('Campanha encerrada — somente leitura');
  });

  it('permite atualização quando endMonth é o mês atual', async () => {
    const now = new Date();
    const currentMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    mockPrisma.campaign.findUnique.mockResolvedValue(
      fakeCampaign({ endMonth: currentMonth }),
    );
    mockPrisma.payment.findUnique.mockResolvedValue(null);
    mockPrisma.payment.upsert.mockResolvedValue({});
    mockPrisma.auditLog.create.mockResolvedValue({});

    await updatePaymentStatus(campaignId, participantId, month, 'PAID_PIX');
    expect(mockPrisma.payment.upsert).toHaveBeenCalled();
  });

  it('cria auditLog com from/to corretos', async () => {
    mockPrisma.campaign.findUnique.mockResolvedValue(fakeCampaign());
    mockPrisma.payment.findUnique.mockResolvedValue({ status: 'PAID_PIX' });
    mockPrisma.payment.upsert.mockResolvedValue({});
    mockPrisma.auditLog.create.mockResolvedValue({});

    await updatePaymentStatus(campaignId, participantId, month, 'PAID_CASH');

    const auditCall = mockPrisma.auditLog.create.mock.calls[0][0];
    expect(auditCall.data.details.from).toBe('PAID_PIX');
    expect(auditCall.data.details.to).toBe('PAID_CASH');
    expect(auditCall.data.action).toBe('PAYMENT_UPDATED');
  });

  it('previousStatus é PENDING quando pagamento não existe', async () => {
    mockPrisma.campaign.findUnique.mockResolvedValue(fakeCampaign());
    mockPrisma.payment.findUnique.mockResolvedValue(null);
    mockPrisma.payment.upsert.mockResolvedValue({});
    mockPrisma.auditLog.create.mockResolvedValue({});

    await updatePaymentStatus(campaignId, participantId, month, 'PAID_PIX');

    const auditCall = mockPrisma.auditLog.create.mock.calls[0][0];
    expect(auditCall.data.details.from).toBe('PENDING');
  });

  it('valida newStatus via paymentStatusSchema', async () => {
    mockPrisma.campaign.findUnique.mockResolvedValue(fakeCampaign());

    await expect(
      updatePaymentStatus(campaignId, participantId, month, 'INVALIDO' as never),
    ).rejects.toThrow();
  });

  it('chama revalidatePath', async () => {
    mockPrisma.campaign.findUnique.mockResolvedValue(fakeCampaign());
    mockPrisma.payment.findUnique.mockResolvedValue(null);
    mockPrisma.payment.upsert.mockResolvedValue({});
    mockPrisma.auditLog.create.mockResolvedValue({});

    await updatePaymentStatus(campaignId, participantId, month, 'PAID_PIX');

    expect(revalidatePath).toHaveBeenCalledWith(`/campaigns/${campaignId}`);
  });
});
