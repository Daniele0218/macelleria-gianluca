import { type InputHTMLAttributes, forwardRef } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  prefix?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, prefix, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-[11px] uppercase tracking-wider font-semibold text-[var(--color-subdued)]">
            {label}
          </label>
        )}
        <div className="relative">
          {prefix && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-subdued)] font-medium text-sm pointer-events-none">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            className={`
              w-full rounded-lg border bg-[var(--color-card)] text-[var(--color-text)]
              px-3 py-3 text-base font-medium
              placeholder:text-[var(--color-subdued)]/50
              focus:outline-none focus:ring-2 focus:ring-[var(--color-success)] focus:border-transparent
              ${prefix ? 'pl-8' : ''}
              ${error ? 'border-red-500' : 'border-[var(--color-border)]'}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
