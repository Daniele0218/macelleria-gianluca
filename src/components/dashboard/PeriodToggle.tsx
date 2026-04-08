import type { PeriodView } from '../../lib/types';

interface Props {
  value: PeriodView;
  onChange: (v: PeriodView) => void;
}

const options: { key: PeriodView; label: string }[] = [
  { key: 'day', label: 'Giorno' },
  { key: 'week', label: 'Settimana' },
  { key: 'month', label: 'Mese' },
];

export default function PeriodToggle({ value, onChange }: Props) {
  return (
    <div className="flex rounded-lg border border-[var(--color-border)] overflow-hidden">
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`flex-1 px-4 py-2.5 text-sm font-semibold transition-colors ${
            value === opt.key
              ? 'bg-[var(--color-text)] text-[var(--color-surface)]'
              : 'bg-[var(--color-card)] text-[var(--color-subdued)] hover:bg-[var(--color-border)]/30'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
