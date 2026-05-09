export function brl(cents: number): string {
  const negative = cents < 0;
  const abs = Math.abs(cents);
  const integer = Math.floor(abs / 100);
  const fraction = abs % 100;
  const integerStr = integer
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const fractionStr = fraction.toString().padStart(2, '0');
  return `${negative ? '-' : ''}R$ ${integerStr},${fractionStr}`;
}

export function reaisToCents(reais: string | number): number {
  const value = typeof reais === 'string' ? parseFloat(reais.replace(',', '.')) : reais;
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100);
}

export function centsToReaisString(cents: number): string {
  return (cents / 100).toFixed(2);
}
