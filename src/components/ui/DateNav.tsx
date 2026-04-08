import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { addDays } from 'date-fns';
import { formatDateLong, formatDateShort } from '../../lib/formatters';

interface Props {
  date: Date;
  onChange: (date: Date) => void;
  label?: string;
}

export default function DateNav({ date, onChange, label }: Props) {
  return (
    <div className="flex items-center justify-between bg-[var(--color-card)] border-b border-[var(--color-border)] px-4 py-2.5">
      <button
        onClick={() => onChange(addDays(date, -1))}
        className="flex items-center gap-1 text-sm font-medium text-[var(--color-subdued)] hover:text-[var(--color-text)] px-2 py-1.5 rounded-lg hover:bg-[var(--color-border)]/30 transition-colors min-h-[36px]"
      >
        <ChevronLeft size={18} />
        <span className="hidden sm:inline">Ieri</span>
      </button>
      <div className="flex items-center gap-2 text-center">
        <Calendar size={16} className="text-[var(--color-subdued)]" />
        <div>
          {label && <p className="text-[10px] uppercase tracking-wider text-[var(--color-subdued)] font-medium">{label}</p>}
          <p className="text-sm font-semibold text-[var(--color-text)] capitalize hidden sm:block">
            {formatDateLong(date)}
          </p>
          <p className="text-sm font-semibold text-[var(--color-text)] sm:hidden">
            {formatDateShort(date)}
          </p>
        </div>
      </div>
      <button
        onClick={() => onChange(addDays(date, 1))}
        className="flex items-center gap-1 text-sm font-medium text-[var(--color-subdued)] hover:text-[var(--color-text)] px-2 py-1.5 rounded-lg hover:bg-[var(--color-border)]/30 transition-colors min-h-[36px]"
      >
        <span className="hidden sm:inline">Domani</span>
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
