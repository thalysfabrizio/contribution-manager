import { describe, expect, it } from 'vitest';
import { brl, centsToReaisString, reaisToCents } from './format';

describe('brl', () => {
  it('formata zero como R$ 0,00', () => {
    expect(brl(0)).toBe('R$ 0,00');
  });

  it('formata valores em centavos', () => {
    expect(brl(2000)).toBe('R$ 20,00');
    expect(brl(1)).toBe('R$ 0,01');
    expect(brl(123456)).toBe('R$ 1.234,56');
  });

  it('formata milhões corretamente', () => {
    expect(brl(123456789)).toBe('R$ 1.234.567,89');
  });

  it('formata negativo', () => {
    expect(brl(-1500)).toBe('-R$ 15,00');
  });
});

describe('reaisToCents', () => {
  it('converte string com vírgula', () => {
    expect(reaisToCents('20,00')).toBe(2000);
    expect(reaisToCents('0,50')).toBe(50);
  });

  it('converte string com ponto', () => {
    expect(reaisToCents('20.00')).toBe(2000);
    expect(reaisToCents('1234.56')).toBe(123456);
  });

  it('converte número', () => {
    expect(reaisToCents(20)).toBe(2000);
    expect(reaisToCents(0.01)).toBe(1);
  });

  it('retorna 0 para valor inválido', () => {
    expect(reaisToCents('abc')).toBe(0);
    expect(reaisToCents(NaN)).toBe(0);
  });

  it('arredonda para evitar erros de ponto flutuante', () => {
    expect(reaisToCents('19.99')).toBe(1999);
  });
});

describe('centsToReaisString', () => {
  it('converte centavos para string com 2 casas', () => {
    expect(centsToReaisString(2000)).toBe('20.00');
    expect(centsToReaisString(0)).toBe('0.00');
    expect(centsToReaisString(1)).toBe('0.01');
  });
});
