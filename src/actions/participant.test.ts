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
import { addParticipant, editParticipant, removeParticipant, searchPersonByPhone } from './participant';

const mockPrisma = prisma as unknown as Record<string, Record<string, Mock>>;

beforeEach(() => {
  vi.clearAllMocks();
  (requireCampaignAccess as Mock).mockResolvedValue({
    user: fakeUser(),
    member: fakeMember(),
  });
});

const campaignId = 'campaign-1';

describe('addParticipant', () => {
  it('cria Person nova + Participant quando telefone novo', async () => {
    mockPrisma.person.findUnique.mockResolvedValue(null);
    mockPrisma.person.create.mockResolvedValue({ id: 'person-1', name: 'João', phone: '11934567890' });
    mockPrisma.participant.findUnique.mockResolvedValue(null);
    mockPrisma.participant.create.mockResolvedValue({ id: 'participant-1' });
    mockPrisma.auditLog.create.mockResolvedValue({});

    await addParticipant(campaignId, fakeFormData({ name: 'João', phone: '11934567890' }));

    expect(mockPrisma.person.create).toHaveBeenCalled();
    expect(mockPrisma.participant.create).toHaveBeenCalled();
  });

  it('reutiliza Person existente quando telefone já cadastrado', async () => {
    mockPrisma.person.findUnique.mockResolvedValue({ id: 'person-1', name: 'João', phone: '11934567890' });
    mockPrisma.participant.findUnique.mockResolvedValue(null);
    mockPrisma.participant.create.mockResolvedValue({ id: 'participant-1' });
    mockPrisma.auditLog.create.mockResolvedValue({});

    await addParticipant(campaignId, fakeFormData({ name: 'João', phone: '11934567890' }));

    expect(mockPrisma.person.create).not.toHaveBeenCalled();
    expect(mockPrisma.participant.create).toHaveBeenCalled();
  });

  it('normaliza telefone removendo não-dígitos', async () => {
    mockPrisma.person.findUnique.mockResolvedValue(null);
    mockPrisma.person.create.mockResolvedValue({ id: 'person-1', name: 'João', phone: '11934567890' });
    mockPrisma.participant.findUnique.mockResolvedValue(null);
    mockPrisma.participant.create.mockResolvedValue({ id: 'participant-1' });
    mockPrisma.auditLog.create.mockResolvedValue({});

    await addParticipant(campaignId, fakeFormData({ name: 'João', phone: '(11) 93456-7890' }));

    expect(mockPrisma.person.findUnique).toHaveBeenCalledWith({
      where: { phone: '11934567890' },
    });
  });

  it('rejeita duplicado na mesma campanha', async () => {
    mockPrisma.person.findUnique.mockResolvedValue({ id: 'person-1', name: 'João', phone: '11934567890' });
    mockPrisma.participant.findUnique.mockResolvedValue({ id: 'existing' });

    const result = await addParticipant(
      campaignId,
      fakeFormData({ name: 'João', phone: '11934567890' }),
    );
    expect(result).toEqual({
      ok: false,
      error: 'Esta pessoa já participa desta campanha',
      code: undefined,
    });
  });

  it('cria auditLog PARTICIPANT_ADDED', async () => {
    mockPrisma.person.findUnique.mockResolvedValue(null);
    mockPrisma.person.create.mockResolvedValue({ id: 'person-1', name: 'João', phone: '11934567890' });
    mockPrisma.participant.findUnique.mockResolvedValue(null);
    mockPrisma.participant.create.mockResolvedValue({ id: 'participant-1' });
    mockPrisma.auditLog.create.mockResolvedValue({});

    await addParticipant(campaignId, fakeFormData({ name: 'João', phone: '11934567890' }));

    const auditCall = mockPrisma.auditLog.create.mock.calls[0][0];
    expect(auditCall.data.action).toBe('PARTICIPANT_ADDED');
  });

  it('executa as operações dentro de uma transação', async () => {
    mockPrisma.person.findUnique.mockResolvedValue(null);
    mockPrisma.person.create.mockResolvedValue({ id: 'person-1', name: 'João', phone: '11934567890' });
    mockPrisma.participant.findUnique.mockResolvedValue(null);
    mockPrisma.participant.create.mockResolvedValue({ id: 'participant-1' });
    mockPrisma.auditLog.create.mockRejectedValue(new Error('audit falhou'));

    const result = await addParticipant(
      campaignId,
      fakeFormData({ name: 'João', phone: '11934567890' }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('audit falhou');

    const tx = (prisma as unknown as { $transaction: Mock }).$transaction;
    expect(tx).toHaveBeenCalledTimes(1);
    expect(typeof tx.mock.calls[0][0]).toBe('function');
  });
});

describe('editParticipant', () => {
  it('atualiza Person vinculada', async () => {
    mockPrisma.participant.findFirst.mockResolvedValue({ personId: 'person-1' });
    mockPrisma.person.update.mockResolvedValue({});
    mockPrisma.auditLog.create.mockResolvedValue({});

    await editParticipant(campaignId, 'participant-1', fakeFormData({ name: 'Maria', phone: '11934567890' }));

    expect(mockPrisma.participant.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'participant-1', campaignId } }),
    );
    expect(mockPrisma.person.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'person-1' },
        data: { name: 'Maria', phone: '11934567890' },
      }),
    );
  });

  it('erro quando participante não pertence à campanha', async () => {
    mockPrisma.participant.findFirst.mockResolvedValue(null);

    const result = await editParticipant(
      campaignId,
      'de-outra-campanha',
      fakeFormData({ name: 'Maria', phone: '11934567890' }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Participante não encontrado');
  });
});

describe('removeParticipant', () => {
  it('deleta e cria auditLog com nome', async () => {
    mockPrisma.participant.findFirst.mockResolvedValue({
      id: 'participant-1',
      person: { name: 'João' },
    });
    mockPrisma.participant.delete.mockResolvedValue({});
    mockPrisma.auditLog.create.mockResolvedValue({});

    await removeParticipant(campaignId, 'participant-1');

    expect(mockPrisma.participant.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'participant-1', campaignId } }),
    );
    expect(mockPrisma.participant.delete).toHaveBeenCalledWith({ where: { id: 'participant-1' } });
    const auditCall = mockPrisma.auditLog.create.mock.calls[0][0];
    expect(auditCall.data.details.name).toBe('João');
  });

  it('erro quando participante não pertence à campanha', async () => {
    mockPrisma.participant.findFirst.mockResolvedValue(null);

    const result = await removeParticipant(campaignId, 'de-outra-campanha');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Participante não encontrado');
  });
});

describe('searchPersonByPhone', () => {
  it('retorna person quando encontrada em campanha do user', async () => {
    mockPrisma.person.findFirst.mockResolvedValue({ name: 'João', phone: '11934567890' });

    const result = await searchPersonByPhone(campaignId, '11934567890');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toEqual({ name: 'João', phone: '11934567890' });
  });

  it('retorna null quando telefone < 10 dígitos', async () => {
    const result = await searchPersonByPhone(campaignId, '123456789');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toBeNull();
    expect(mockPrisma.person.findFirst).not.toHaveBeenCalled();
  });

  it('retorna null quando person não está em nenhuma campanha do user', async () => {
    mockPrisma.person.findFirst.mockResolvedValue(null);

    const result = await searchPersonByPhone(campaignId, '11934567890');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toBeNull();
  });
});
