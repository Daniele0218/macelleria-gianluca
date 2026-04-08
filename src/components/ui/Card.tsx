import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  borderColor?: string;
  gradient?: string;
  onClick?: () => void;
}

export default function Card({ children, className = '', borderColor, gradient, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-xl border border-[var(--color-border)]
        ${gradient ? '' : 'bg-[var(--color-card)]'}
        ${borderColor ? 'border-l-4' : ''}
        ${onClick ? 'cursor-pointer hover:shadow-sm active:scale-[0.99] transition-transform' : ''}
        ${className}
      `}
      style={{
        borderLeftColor: borderColor,
        background: gradient,
      }}
    >
      {children}
    </div>
  );
}
