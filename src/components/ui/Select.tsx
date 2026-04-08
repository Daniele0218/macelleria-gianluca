import type { SelectHTMLAttributes } from 'react';

interface Option {
  value: string;
  label: string;
}

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  placeholder?: string;
}

export default function Select({ label, options, placeholder, className = '', ...props }: Props) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-[11px] uppercase tracking-wider font-semibold text-[var(--color-subdued)]">
          {label}
        </label>
      )}
      <select
        className={`
          w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text)]
          px-3 py-3 text-base font-medium appearance-none
          focus:outline-none focus:ring-2 focus:ring-[var(--color-success)] focus:border-transparent
          ${className}
        `}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
