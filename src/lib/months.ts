export type MonthEntry = {
  date: Date;
  label: string;
};

export function getMonthsFromRange(startMonth: Date, endMonth: Date): MonthEntry[] {
  const months: MonthEntry[] = [];
  const current = new Date(startMonth);
  const end = new Date(endMonth);

  while (current <= end) {
    const month = current.getMonth();
    const year = current.getFullYear();
    const label = current
      .toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      .replace('. de ', '/')
      .replace('.', '');
    months.push({
      date: new Date(Date.UTC(year, month, 1)),
      label: label.charAt(0).toUpperCase() + label.slice(1),
    });
    current.setMonth(current.getMonth() + 1);
  }

  return months;
}

export function isSameMonth(a: Date, b: Date) {
  return a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth();
}

export function isCurrentMonth(date: Date) {
  const now = new Date();
  return date.getUTCFullYear() === now.getFullYear() && date.getUTCMonth() === now.getMonth();
}
