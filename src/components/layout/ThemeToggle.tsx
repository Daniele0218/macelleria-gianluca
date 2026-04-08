import { Moon, Sun } from 'lucide-react';

interface Props {
  dark: boolean;
  onToggle: () => void;
}

export default function ThemeToggle({ dark, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      className="relative w-12 h-7 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-success)]"
      style={{ backgroundColor: dark ? 'var(--color-success)' : 'var(--color-border)' }}
      aria-label={dark ? 'Passa a modalità chiara' : 'Passa a modalità scura'}
    >
      <span
        className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 flex items-center justify-center"
        style={{ transform: dark ? 'translateX(22px)' : 'translateX(2px)' }}
      >
        {dark ? <Moon size={14} className="text-gray-700" /> : <Sun size={14} className="text-amber-500" />}
      </span>
    </button>
  );
}
