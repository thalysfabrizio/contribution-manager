import { vi } from 'vitest';
import { hashEmail, exportAccountData, deleteAccount } from './account';
import type { PrismaClient } from '@/generated/prisma/client';

describe('hashEmail', () => {
  it('gera o mesmo hash para o mesmo email + salt', () => {
    const a = hashEmail('user@example.com', 'secret');
    const b = hashEmail('user@example.com', 'secret');
    expect(a).toBe(b);
  });

  it('é case-insensitive no email', () => {
    const lower = hashEmail('user@example.com', 'secret');
    const upper = hashEmail('USER@EXAMPLE.COM', 'secret');
    expect(lower).toBe(upper);
  });

  it('muda quando o salt muda', () => {
    const a = hashEmail('user@example.com', 'salt-1');
    const b = hashEmail('user@example.com', 'salt-2');
    expect(a).not.toBe(b);
  });

  it('retorna hex de 64 caracteres (sha-256)', () => {
    const h = hashEmail('user@example.com', 'secret');
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });
});

function makePrisma() {
  const userFindUnique = vi.fn();
  const userDelete = vi.fn().mockResolvedValue({});
  const campaignFindMany = vi.fn().mockResolvedValue([]);
  const campaignMemberFindMany = vi.fn().mockResolvedValue([]);
  const auditLogFindMany = vi.fn().mockResolvedValue([]);
  const auditLogUpdateMany = vi.fn().mockResolvedValue({ count: 0 });
  const $transaction = vi.fn(async (ops: Promise<unknown>[]) => Promise.all(ops));
  const client = {
    user: { findUnique: userFindUnique, delete: userDelete },
    campaign: { findMany: campaignFindMany },
    campaignMember: { findMany: campaignMemberFindMany },
    auditLog: { findMany: auditLogFindMany, updateMany: auditLogUpdateMany },
    $transaction,
  } as unknown as PrismaClient;
  return {
    client,
    userFindUnique,
    userDelete,
    campaignFindMany,
    campaignMemberFindMany,
    auditLogFindMany,
    auditLogUpdateMany,
    $transaction,
  };
}

describe('exportAccountData', () => {
  it('retorna null quando usuário não existe', async () => {
    const p = makePrisma();
    p.userFindUnique.mockResolvedValue(null);
    const result = await exportAccountData(p.client, 'missing');
    expect(result).toBeNull();
  });

  it('agrega user + campaigns + memberships + auditLogs', async () => {
    const p = makePrisma();
    p.userFindUnique.mockResolvedValue({
      id: 'u1',
      name: 'User',
      email: 'u@example.com',
      emailVerified: new Date('2026-01-01'),
      image: null,
      createdAt: new Date('2026-01-01'),
      consentAt: new Date('2026-01-01'),
      consentVersion: '1.0',
    });
    p.campaignFindMany.mockResolvedValue([{ id: 'c1', name: 'C1' }]);
    p.campaignMemberFindMany.mockResolvedValue([{ id: 'm1' }]);
    p.auditLogFindMany.mockResolvedValue([{ id: 'a1' }]);

    const result = await exportAccountData(p.client, 'u1');
    expect(result).not.toBeNull();
    expect(result!.user.id).toBe('u1');
    expect(result!.campaigns).toHaveLength(1);
    expect(result!.memberships).toHaveLength(1);
    expect(result!.auditLogs).toHaveLength(1);
    expect(result!.schemaVersion).toBe(1);
    expect(typeof result!.exportedAt).toBe('string');
  });

  it('filtra campanhas apenas do owner informado', async () => {
    const p = makePrisma();
    p.userFindUnique.mockResolvedValue({
      id: 'u1',
      name: null,
      email: 'u@example.com',
      emailVerified: null,
      image: null,
      createdAt: new Date(),
      consentAt: null,
      consentVersion: null,
    });
    await exportAccountData(p.client, 'u1');
    expect(p.campaignFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { ownerId: 'u1' } }),
    );
  });
});

describe('deleteAccount', () => {
  it('anonimiza audit logs e deleta user em transação', async () => {
    const p = makePrisma();
    await deleteAccount(p.client, 'u1', 'User@Example.com', 'salt');
    expect(p.$transaction).toHaveBeenCalled();
    expect(p.auditLogUpdateMany).toHaveBeenCalledWith({
      where: { userId: 'u1' },
      data: { actorEmailHash: hashEmail('user@example.com', 'salt') },
    });
    expect(p.userDelete).toHaveBeenCalledWith({ where: { id: 'u1' } });
  });
});
