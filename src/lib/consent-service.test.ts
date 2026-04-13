import { vi } from 'vitest';
import { recordConsentIfMissing } from './consent-service';

function makePrismaMock(existing: { consentAt: Date | null } | null) {
  const findUnique = vi.fn().mockResolvedValue(existing);
  const update = vi.fn().mockResolvedValue({});
  return { mock: { user: { findUnique, update } }, findUnique, update };
}

describe('recordConsentIfMissing', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-13T12:00:00.000Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('grava consentAt e consentVersion quando user nunca deu consentimento', async () => {
    const { mock, update } = makePrismaMock({ consentAt: null });
    const result = await recordConsentIfMissing(mock, 'user-1', '1.0');
    expect(result).toBe(true);
    expect(update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        consentAt: new Date('2026-04-13T12:00:00.000Z'),
        consentVersion: '1.0',
      },
    });
  });

  it('não faz update quando consentAt já existe', async () => {
    const { mock, update } = makePrismaMock({ consentAt: new Date('2026-01-01') });
    const result = await recordConsentIfMissing(mock, 'user-1', '1.0');
    expect(result).toBe(false);
    expect(update).not.toHaveBeenCalled();
  });

  it('não faz update quando usuário não existe', async () => {
    const { mock, update } = makePrismaMock(null);
    const result = await recordConsentIfMissing(mock, 'user-inexistente', '1.0');
    expect(result).toBe(false);
    expect(update).not.toHaveBeenCalled();
  });
});
