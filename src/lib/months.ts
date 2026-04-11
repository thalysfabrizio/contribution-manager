export type MonthEntry = {
  date: Date;
  label: string;
};

export function getMonthsFromRange(startMonth: Date, endMonth: Date): MonthEntry[] {
  const months: MonthEntry[] = [];
  let year = startMonth.getUTCFullYear();
  let month = startMonth.getUTCMonth();
  const endYear = endMonth.getUTCFullYear();
  const endMon = endMonth.getUTCMonth();

  while (year < endYear || (year === endYear && month <= endMon)) {
    const date = new Date(Date.UTC(year, month, 1));
    const label = date
      .toLocaleDateString('pt-BR', { month: 'short', year: '2-digit', timeZone: 'UTC' })
      .replace('. de ', '/')
      .replace('.', '');
    months.push({
      date,
      label: label.charAt(0).toUpperCase() + label.slice(1),
    });
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
  }

  return months;
}

export function isSameMonth(a: Date, b: Date) {
  return a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth();
}

export function isCurrentMonth(date: Date) {
  const now = new Date();
  return date.getUTCFullYear() === now.getUTCFullYear() && date.getUTCMonth() === now.getUTCMonth();
}

export function isCampaignEnded(endMonth: Date): boolean {
  const endYear = endMonth.getUTCFullYear();
  const endMon = endMonth.getUTCMonth();
  const firstDayAfterEnd = new Date(Date.UTC(endYear, endMon + 1, 1));
  return new Date() >= firstDayAfterEnd;
}
