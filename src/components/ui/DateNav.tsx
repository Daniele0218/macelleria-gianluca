import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { addDays } from 'date-fns';
import { formatDateLong, formatDateShort, toISODate } from '../../lib/formatters';

interface Props {
  date: Date;
  onChange: (date: Date) => void;
  label?: string;
}

export default function DateNav({ date, onChange, label }: Props) {
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleDateClick = () => {
    // Trigger the hidden native date picker
    dateInputRef.current?.showPicker();
  };

  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const [year, month, day] = e.target.value.split('-').map(Number);
      onChange(new Date(year, month - 1, day));
    }
  };

  return (
    <div className="flex items-center justify-between bg-[var(--color-card)] border-b border-[var(--color-border)] px-4 py-2.5">
      <button
        onClick={() => onChange(addDays(date, -1))}
        className="flex items-center gap-1 text-sm font-medium text-[var(--color-subdued)] hover:text-[var(--color-text)] px-2 py-1.5 rounded-lg hover:bg-[var(--color-border)]/30 transition-colors min-h-[36px]"
      >
        <ChevronLeft size={18} />
        <span className="hidden sm:inline">Ieri</span>
      </button>

      {/* Clickable date area with hidden native date picker */}
      <button
        onClick={handleDateClick}
        className="flex items-center gap-2 text-center px-3 py-1.5 rounded-lg hover:bg-[var(--color-border)]/30 transition-colors cursor-pointer relative"
      >
        <Calendar size={16} className="text-[var(--color-success)]" />
        <div>
          {label && <p className="text-[10px] uppercase tracking-wider text-[var(--color-subdued)] font-medium">{label}</p>}
          <p className="text-sm font-semibold text-[var(--color-text)] capitalize hidden sm:block">
            {formatDateLong(date)}
          </p>
          <p className="text-sm font-semibold text-[var(--color-text)] sm:hidden">
            {formatDateShort(date)}
          </p>
        </div>
        {/* Hidden native date input */}
        <input
          ref={dateInputRef}
          type="date"
          value={toISODate(date)}
          onChange={handleDateInput}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          style={{ position: 'absolute', top: 0, left: 0 }}
        />
      </button>

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
