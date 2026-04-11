import { vi, type Mock } from 'vitest';
import { fakeUser, fakeMember } from '@/test/helpers';

const { createMockPrisma } = await vi.hoisted(() => import('@/test/mocks/prisma'));

vi.mock('@/lib/prisma', () => ({
  prisma: createMockPrisma(),
}));

vi.mock('@/lib/permissions', () => ({
  requireCampaignOwner: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { prisma } from '@/lib/prisma';
import { requireCampaignOwner } from '@/lib/permissions';
import { inviteMember, removeMember } from './member';

const mockPrisma = prisma as unknown as Record<string, Record<string, Mock>>;

beforeEach(() => {
  vi.clearAllMocks();
  (requireCampaignOwner as Mock).mockResolvedValue({
    user: fakeUser(),
    member: fakeMember(),
  });
});

const campaignId = 'campaign-1';

describe('inviteMember', () => {
  it('exige papel OWNER', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({ id: 'new-user', email: 'novo@teste.com' });
    mockPrisma.campaignMember.create.mockResolvedValue({});
    mockPrisma.auditLog.create.mockResolvedValue({});

    await inviteMember(campaignId, 'novo@teste.com');
    expect(requireCampaignOwner).toHaveBeenCalledWith(campaignId);
  });

  it('adiciona membro existente diretamente → method: direct', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-2', email: 'existente@teste.com' });
    mockPrisma.campaignMember.findUnique.mockResolvedValue(null);
    mockPrisma.campaignMember.create.mockResolvedValue({});
    mockPrisma.auditLog.create.mockResolvedValue({});

    const result = await inviteMember(campaignId, 'existente@teste.com');
    expect(result.method).toBe('direct');
    expect(mockPrisma.campaignMember.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ role: 'MEMBER' }),
      }),
    );
  });

  it('rejeita se já é membro', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-2', email: 'membro@teste.com' });
    mockPrisma.campaignMember.findUnique.mockResolvedValue({ id: 'existing-member' });

    await expect(inviteMember(campaignId, 'membro@teste.com')).rejects.toThrow(
      'Esta pessoa já é membro desta campanha',
    );
  });

  it('cria usuário + membro quando não existe → method: invite', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({ id: 'new-user', email: 'novo@teste.com' });
    mockPrisma.campaignMember.create.mockResolvedValue({});
    mockPrisma.auditLog.create.mockResolvedValue({});

    const result = await inviteMember(campaignId, 'novo@teste.com');
    expect(result.method).toBe('invite');
    expect(mockPrisma.user.create).toHaveBeenCalled();
  });

  it('normaliza email (trim + lowercase)', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({ id: 'new-user', email: 'teste@teste.com' });
    mockPrisma.campaignMember.create.mockResolvedValue({});
    mockPrisma.auditLog.create.mockResolvedValue({});

    await inviteMember(campaignId, 'TESTE@Teste.COM');

    const auditCall = mockPrisma.auditLog.create.mock.calls[0][0];
    expect(auditCall.data.details.email).toBe('teste@teste.com');
  });
});

describe('removeMember', () => {
  it('remove membro com role MEMBER', async () => {
    mockPrisma.campaignMember.findUnique.mockResolvedValue({
      id: 'member-2',
      role: 'MEMBER',
      user: { email: 'membro@teste.com' },
    });
    mockPrisma.campaignMember.delete.mockResolvedValue({});
    mockPrisma.auditLog.create.mockResolvedValue({});

    await removeMember(campaignId, 'member-2');
    expect(mockPrisma.campaignMember.delete).toHaveBeenCalledWith({
      where: { id: 'member-2' },
    });
  });

  it('bloqueia remoção de OWNER', async () => {
    mockPrisma.campaignMember.findUnique.mockResolvedValue({
      id: 'member-1',
      role: 'OWNER',
      user: { email: 'owner@teste.com' },
    });

    await expect(removeMember(campaignId, 'member-1')).rejects.toThrow(
      'Não é possível remover o proprietário',
    );
  });

  it('erro quando membro não encontrado', async () => {
    mockPrisma.campaignMember.findUnique.mockResolvedValue(null);

    await expect(removeMember(campaignId, 'nao-existe')).rejects.toThrow(
      'Membro não encontrado',
    );
  });
});
