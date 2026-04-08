import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}

export default function Modal({ open, onClose, title, children, actions }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Content */}
      <div className="relative bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
          <h3 className="text-base font-bold text-[var(--color-text)]">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--color-border)]/50 text-[var(--color-subdued)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-4">{children}</div>
        {actions && (
          <div className="flex justify-end gap-2 p-4 border-t border-[var(--color-border)]">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
