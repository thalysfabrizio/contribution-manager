import { getMonthsFromRange, isSameMonth, isCurrentMonth, isCampaignEnded } from './months';

describe('getMonthsFromRange', () => {
  it('retorna array vazio quando start > end', () => {
    const result = getMonthsFromRange(
      new Date(Date.UTC(2026, 11, 1)),
      new Date(Date.UTC(2026, 0, 1)),
    );
    expect(result).toEqual([]);
  });

  it('retorna 1 entrada quando mesmo mês/ano', () => {
    const result = getMonthsFromRange(
      new Date(Date.UTC(2026, 5, 1)),
      new Date(Date.UTC(2026, 5, 1)),
    );
    expect(result).toHaveLength(1);
  });

  it('retorna 12 entradas para intervalo de 1 ano', () => {
    const result = getMonthsFromRange(
      new Date(Date.UTC(2026, 0, 1)),
      new Date(Date.UTC(2026, 11, 1)),
    );
    expect(result).toHaveLength(12);
  });

  it('datas são UTC dia 1 de cada mês', () => {
    const result = getMonthsFromRange(
      new Date(Date.UTC(2026, 2, 1)),
      new Date(Date.UTC(2026, 4, 1)),
    );
    for (const entry of result) {
      expect(entry.date.getUTCDate()).toBe(1);
    }
    expect(result[0].date.getUTCMonth()).toBe(2); // março
    expect(result[1].date.getUTCMonth()).toBe(3); // abril
    expect(result[2].date.getUTCMonth()).toBe(4); // maio
  });

  it('funciona na virada de ano (dez → jan)', () => {
    const result = getMonthsFromRange(
      new Date(Date.UTC(2025, 10, 1)),
      new Date(Date.UTC(2026, 1, 1)),
    );
    expect(result).toHaveLength(4);
    expect(result[0].date.getUTCFullYear()).toBe(2025);
    expect(result[0].date.getUTCMonth()).toBe(10); // novembro
    expect(result[2].date.getUTCFullYear()).toBe(2026);
    expect(result[2].date.getUTCMonth()).toBe(0); // janeiro
  });

  it('labels têm primeira letra maiúscula', () => {
    const result = getMonthsFromRange(
      new Date(Date.UTC(2026, 0, 1)),
      new Date(Date.UTC(2026, 2, 1)),
    );
    for (const entry of result) {
      expect(entry.label[0]).toBe(entry.label[0].toUpperCase());
    }
  });
});

describe('isSameMonth', () => {
  it('retorna true para mesmo mês UTC', () => {
    const a = new Date(Date.UTC(2026, 3, 1));
    const b = new Date(Date.UTC(2026, 3, 15));
    expect(isSameMonth(a, b)).toBe(true);
  });

  it('retorna false para meses diferentes', () => {
    const a = new Date(Date.UTC(2026, 3, 1));
    const b = new Date(Date.UTC(2026, 4, 1));
    expect(isSameMonth(a, b)).toBe(false);
  });

  it('retorna false para mesmo mês em anos diferentes', () => {
    const a = new Date(Date.UTC(2025, 3, 1));
    const b = new Date(Date.UTC(2026, 3, 1));
    expect(isSameMonth(a, b)).toBe(false);
  });
});

describe('isCurrentMonth', () => {
  it('retorna true para data do mês corrente (UTC)', () => {
    const now = new Date();
    const currentMonthUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    expect(isCurrentMonth(currentMonthUtc)).toBe(true);
  });

  it('retorna false para mês passado', () => {
    const now = new Date();
    const pastMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 2, 1));
    expect(isCurrentMonth(pastMonth)).toBe(false);
  });
});

describe('isCampaignEnded', () => {
  it('retorna false quando endMonth é no futuro', () => {
    const future = new Date(Date.UTC(2099, 11, 1)); // Dez/2099
    expect(isCampaignEnded(future)).toBe(false);
  });

  it('retorna true quando endMonth é no passado distante', () => {
    const past = new Date(Date.UTC(2020, 0, 1)); // Jan/2020
    expect(isCampaignEnded(past)).toBe(true);
  });

  it('campanha é válida durante o mês inteiro do endMonth', () => {
    // Se endMonth é o mês atual, a campanha ainda está ativa
    const now = new Date();
    const currentMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    expect(isCampaignEnded(currentMonth)).toBe(false);
  });

  it('campanha encerra no primeiro dia do mês seguinte ao endMonth', () => {
    // Se endMonth é o mês anterior, a campanha está encerrada
    const now = new Date();
    const lastMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
    expect(isCampaignEnded(lastMonth)).toBe(true);
  });
});
