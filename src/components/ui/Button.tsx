import type { ReactNode } from 'react';
import Spinner from './Spinner';

interface Props {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
}: Props) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-[10px] px-5 font-semibold text-[15px] min-h-[44px] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-[#292524] text-white hover:bg-[#1c1917] focus:ring-stone-500 dark:bg-white dark:text-black dark:hover:bg-stone-100',
    secondary: 'bg-transparent border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-border)]/30 focus:ring-stone-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading ? <Spinner size={18} /> : children}
    </button>
  );
}
