export function fakeUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-1',
    name: 'Usuário Teste',
    email: 'teste@teste.com',
    ...overrides,
  };
}

export function fakeMember(overrides: Record<string, unknown> = {}) {
  return {
    id: 'member-1',
    userId: 'user-1',
    campaignId: 'campaign-1',
    role: 'OWNER' as const,
    joinedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

export function fakeCampaign(overrides: Record<string, unknown> = {}) {
  return {
    id: 'campaign-1',
    name: 'Campanha Teste',
    description: null,
    pixKey: 'pix@teste.com',
    monthlyValue: 5000,
    startMonth: new Date('2026-01-01'),
    endMonth: new Date('2026-12-01'),
    paymentDayStart: 10,
    paymentDayEnd: 15,
    ownerId: 'user-1',
    createdAt: new Date('2026-01-01'),
    ...overrides,
  };
}

export function fakeFormData(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(entries)) {
    fd.append(k, v);
  }
  return fd;
}
