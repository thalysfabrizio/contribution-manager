'use client';

interface MonthYearPickerProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const MONTHS = [
  { value: '01', label: 'Janeiro' },
  { value: '02', label: 'Fevereiro' },
  { value: '03', label: 'Março' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Maio' },
  { value: '06', label: 'Junho' },
  { value: '07', label: 'Julho' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
];

const selectClass =
  'w-full rounded-lg border border-border bg-app px-3 py-2.5 text-base text-text-primary transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary';

export function MonthYearPicker({ name, label, value, onChange, required }: MonthYearPickerProps) {
  const [year, month] = value ? value.split('-') : ['', ''];

  const currentYear = new Date().getUTCFullYear();
  const yearSet = new Set<number>();
  for (let y = currentYear - 1; y <= currentYear + 5; y++) yearSet.add(y);
  if (year) yearSet.add(parseInt(year, 10));
  const years = [...yearSet].sort((a, b) => a - b);

  const update = (nextMonth: string, nextYear: string) => {
    onChange(nextMonth && nextYear ? `${nextYear}-${nextMonth}` : '');
  };

  const monthId = `${name}-month`;
  const yearId = `${name}-year`;

  return (
    <div className="space-y-1.5">
      <span className="block text-sm font-medium text-text-secondary" id={`${name}-label`}>
        {label}
      </span>
      <div className="select-group grid grid-cols-2 gap-2">
        <select
          id={monthId}
          aria-label={`${label} — mês`}
          value={month}
          onChange={(e) => update(e.target.value, year)}
          required={required}
          className={selectClass}
        >
          <option value="">Mês</option>
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <select
          id={yearId}
          aria-label={`${label} — ano`}
          value={year}
          onChange={(e) => update(month, e.target.value)}
          required={required}
          className={selectClass}
        >
          <option value="">Ano</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <p className="validation-hint text-xs text-danger col-span-2">Preencha este campo</p>
      </div>
      <input type="hidden" name={name} value={value} />
    </div>
  );
}
