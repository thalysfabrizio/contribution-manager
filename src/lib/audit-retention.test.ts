import { RETENTION_MONTHS, getCutoffDate } from './audit-retention';

describe('audit-retention', () => {
  it('RETENTION_MONTHS é 24 (política LGPD documentada)', () => {
    expect(RETENTION_MONTHS).toBe(24);
  });

  it('getCutoffDate retorna data 24 meses anterior a now', () => {
    const now = new Date(Date.UTC(2026, 5, 15, 12, 0, 0));
    const cutoff = getCutoffDate(now);
    expect(cutoff.getUTCFullYear()).toBe(2024);
    expect(cutoff.getUTCMonth()).toBe(5);
    expect(cutoff.getUTCDate()).toBe(15);
  });

  it('getCutoffDate lida com virada de ano', () => {
    const now = new Date(Date.UTC(2026, 1, 10));
    const cutoff = getCutoffDate(now);
    expect(cutoff.getUTCFullYear()).toBe(2024);
    expect(cutoff.getUTCMonth()).toBe(1);
  });
});
