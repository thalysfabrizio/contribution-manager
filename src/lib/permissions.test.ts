import { vi, type Mock } from 'vitest';

vi.mock('./auth', () => ({
  auth: vi.fn(),
}));

const { createMockPrisma } = await vi.hoisted(() => import('@/test/mocks/prisma'));

vi.mock('./prisma', () => ({
  prisma: createMockPrisma(),
}));

import { auth } from './auth';
import { prisma } from './prisma';
import { getSessionUser, requireCampaignAccess, requireCampaignOwner } from './permissions';

const mockAuth = auth as Mock;
const mockPrisma = prisma as unknown as Record<string, Record<string, Mock>>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getSessionUser', () => {
  it('retorna usuário quando sessão válida', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'user-1', name: 'Teste', email: 'teste@teste.com' },
    });

    const user = await getSessionUser();
    expect(user.id).toBe('user-1');
    expect(user.name).toBe('Teste');
  });

  it('lança "Não autorizado" quando sessão ausente', async () => {
    mockAuth.mockResolvedValue(null);

    await expect(getSessionUser()).rejects.toThrow('Não autorizado');
  });

  it('lança "Não autorizado" quando user.id ausente', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'Teste' } });

    await expect(getSessionUser()).rejects.toThrow('Não autorizado');
  });
});

describe('requireCampaignAccess', () => {
  beforeEach(() => {
    mockAuth.mockResolvedValue({
      user: { id: 'user-1', name: 'Teste', email: 'teste@teste.com' },
    });
  });

  it('retorna user + member quando membro existe', async () => {
    mockPrisma.campaignMember.findUnique.mockResolvedValue({
      id: 'member-1',
      role: 'OWNER',
    });

    const result = await requireCampaignAccess('campaign-1');
    expect(result.user.id).toBe('user-1');
    expect(result.member.role).toBe('OWNER');
  });

  it('lança "Sem acesso a esta campanha" quando não é membro', async () => {
    mockPrisma.campaignMember.findUnique.mockResolvedValue(null);

    await expect(requireCampaignAccess('campaign-1')).rejects.toThrow(
      'Sem acesso a esta campanha',
    );
  });
});

describe('requireCampaignOwner', () => {
  beforeEach(() => {
    mockAuth.mockResolvedValue({
      user: { id: 'user-1', name: 'Teste', email: 'teste@teste.com' },
    });
  });

  it('retorna quando role é OWNER', async () => {
    mockPrisma.campaignMember.findUnique.mockResolvedValue({
      id: 'member-1',
      role: 'OWNER',
    });

    const result = await requireCampaignOwner('campaign-1');
    expect(result.member.role).toBe('OWNER');
  });

  it('lança erro quando role é MEMBER', async () => {
    mockPrisma.campaignMember.findUnique.mockResolvedValue({
      id: 'member-2',
      role: 'MEMBER',
    });

    await expect(requireCampaignOwner('campaign-1')).rejects.toThrow(
      'Apenas o proprietário pode realizar esta ação',
    );
  });
});
