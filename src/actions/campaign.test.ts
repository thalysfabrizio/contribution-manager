import { vi, type Mock } from 'vitest';
import { fakeUser, fakeMember, fakeCampaign, fakeFormData } from '@/test/helpers';

const { createMockPrisma } = await vi.hoisted(() => import('@/test/mocks/prisma'));

vi.mock('@/lib/prisma', () => ({
  prisma: createMockPrisma(),
}));

vi.mock('@/lib/permissions', () => ({
  getSessionUser: vi.fn(),
  requireCampaignOwner: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

vi.mock('@/generated/prisma/client', () => ({
  CampaignRole: { OWNER: 'OWNER', MEMBER: 'MEMBER' },
}));

import { prisma } from '@/lib/prisma';
import { getSessionUser, requireCampaignOwner } from '@/lib/permissions';
import { revalidatePath } from 'next/cache';
import { createCampaign, updateCampaign, deleteCampaign, updateTemplates, updateBranding } from './campaign';

const mockPrisma = prisma as unknown as Record<string, Record<string, Mock>>;

beforeEach(() => {
  vi.clearAllMocks();
  (getSessionUser as Mock).mockResolvedValue(fakeUser());
  (requireCampaignOwner as Mock).mockResolvedValue({
    user: fakeUser(),
    member: fakeMember(),
  });
});

const validFormData = () =>
  fakeFormData({
    name: 'Campanha Nova',
    description: 'Descrição',
    pixKey: 'pix@teste.com',
    monthlyValue: '50',
    startMonth: '2026-01-01',
    endMonth: '2026-12-01',
    paymentDayStart: '10',
    paymentDayEnd: '15',
  });

describe('createCampaign', () => {
  it('cria campanha + CampaignMember OWNER', async () => {
    const campaign = fakeCampaign({ id: 'new-campaign' });
    mockPrisma.campaign.create.mockResolvedValue(campaign);
    mockPrisma.campaignMember.create.mockResolvedValue({});
    mockPrisma.auditLog.create.mockResolvedValue({});

    await expect(createCampaign(validFormData())).rejects.toThrow('NEXT_REDIRECT');

    expect(mockPrisma.campaign.create).toHaveBeenCalled();
    expect(mockPrisma.campaignMember.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ role: 'OWNER' }),
      }),
    );
  });

  it('converte monthlyValue para centavos', async () => {
    mockPrisma.campaign.create.mockResolvedValue(fakeCampaign());
    mockPrisma.campaignMember.create.mockResolvedValue({});
    mockPrisma.auditLog.create.mockResolvedValue({});

    await expect(createCampaign(validFormData())).rejects.toThrow('NEXT_REDIRECT');

    const call = mockPrisma.campaign.create.mock.calls[0][0];
    expect(call.data.monthlyValue).toBe(5000); // 50 * 100
  });

  it('cria auditLog CAMPAIGN_CREATED', async () => {
    mockPrisma.campaign.create.mockResolvedValue(fakeCampaign());
    mockPrisma.campaignMember.create.mockResolvedValue({});
    mockPrisma.auditLog.create.mockResolvedValue({});

    await expect(createCampaign(validFormData())).rejects.toThrow('NEXT_REDIRECT');

    const auditCall = mockPrisma.auditLog.create.mock.calls[0][0];
    expect(auditCall.data.action).toBe('CAMPAIGN_CREATED');
  });

  it('faz redirect para /campaigns/{id}', async () => {
    mockPrisma.campaign.create.mockResolvedValue(fakeCampaign({ id: 'abc123' }));
    mockPrisma.campaignMember.create.mockResolvedValue({});
    mockPrisma.auditLog.create.mockResolvedValue({});

    await expect(createCampaign(validFormData())).rejects.toThrow('NEXT_REDIRECT:/campaigns/abc123');
  });

  it('envolve as três operações em uma transação única', async () => {
    mockPrisma.campaign.create.mockResolvedValue(fakeCampaign());
    mockPrisma.campaignMember.create.mockResolvedValue({});
    mockPrisma.auditLog.create.mockRejectedValue(new Error('audit falhou'));

    await expect(createCampaign(validFormData())).rejects.toThrow('audit falhou');

    const tx = (prisma as unknown as { $transaction: Mock }).$transaction;
    expect(tx).toHaveBeenCalledTimes(1);
    expect(typeof tx.mock.calls[0][0]).toBe('function');
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe('updateCampaign', () => {
  it('exige OWNER e atualiza campanha', async () => {
    mockPrisma.campaign.update.mockResolvedValue({});
    mockPrisma.auditLog.create.mockResolvedValue({});

    await updateCampaign('campaign-1', validFormData());

    expect(requireCampaignOwner).toHaveBeenCalledWith('campaign-1');
    expect(mockPrisma.campaign.update).toHaveBeenCalled();
  });

  it('cria auditLog CAMPAIGN_EDITED', async () => {
    mockPrisma.campaign.update.mockResolvedValue({});
    mockPrisma.auditLog.create.mockResolvedValue({});

    await updateCampaign('campaign-1', validFormData());

    const auditCall = mockPrisma.auditLog.create.mock.calls[0][0];
    expect(auditCall.data.action).toBe('CAMPAIGN_EDITED');
  });
});

describe('deleteCampaign', () => {
  it('exige OWNER, deleta e redirect para /campaigns', async () => {
    mockPrisma.campaign.delete.mockResolvedValue({});

    await expect(deleteCampaign('campaign-1')).rejects.toThrow('NEXT_REDIRECT:/campaigns');
    expect(requireCampaignOwner).toHaveBeenCalledWith('campaign-1');
    expect(mockPrisma.campaign.delete).toHaveBeenCalledWith({ where: { id: 'campaign-1' } });
  });
});

describe('updateTemplates', () => {
  it('exige OWNER e atualiza templates', async () => {
    mockPrisma.campaign.update.mockResolvedValue({});

    const templates = { charge: 'Olá', reminder: 'Lembrete', overdue: 'Atrasado', thanks: 'Obrigado' };
    await updateTemplates('campaign-1', templates);

    expect(requireCampaignOwner).toHaveBeenCalledWith('campaign-1');
    expect(mockPrisma.campaign.update).toHaveBeenCalledWith({
      where: { id: 'campaign-1' },
      data: { templates },
    });
  });
});

describe('updateBranding', () => {
  it('exige OWNER e converte strings vazias para null', async () => {
    mockPrisma.campaign.update.mockResolvedValue({});
    mockPrisma.auditLog.create.mockResolvedValue({});

    const fd = fakeFormData({
      orgName: '',
      logoUrl: '',
      bannerUrl: '',
      accentColor: '',
      messageSignature: '',
    });

    await updateBranding('campaign-1', fd);

    const call = mockPrisma.campaign.update.mock.calls[0][0];
    expect(call.data.orgName).toBeNull();
    expect(call.data.logoUrl).toBeNull();
    expect(call.data.bannerUrl).toBeNull();
    expect(call.data.accentColor).toBeNull();
    expect(call.data.messageSignature).toBeNull();
  });
});
