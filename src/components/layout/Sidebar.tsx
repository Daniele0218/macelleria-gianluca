import { useLocation, useNavigate } from 'react-router-dom';
import { Banknote, ClipboardList, BarChart3, Store, Users, Download, Settings } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const links = [
  { path: '/', label: 'Incassi', icon: Banknote },
  { path: '/spese', label: 'Spese', icon: ClipboardList },
  { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { path: '/fornitori', label: 'Fornitori', icon: Store },
  { path: '/altro', label: 'Operai', icon: Users },
  { path: '/altro#export', label: 'Export', icon: Download },
  { path: '/altro#impostazioni', label: 'Impostazioni', icon: Settings },
];

interface Props {
  dark: boolean;
  onToggleTheme: () => void;
}

export default function Sidebar({ dark, onToggleTheme }: Props) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="hidden md:flex flex-col w-56 bg-[var(--color-card)] border-r border-[var(--color-border)] h-screen sticky top-0 shrink-0">
      <div className="p-5 border-b border-[var(--color-border)]">
        <h1 className="text-base font-bold text-[var(--color-text)]">🥩 Macelleria</h1>
        <p className="text-xs text-[var(--color-subdued)] mt-0.5">Gianluca</p>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map(({ path, label, icon: Icon }) => {
          const basePath = path.split('#')[0];
          const active = basePath === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(basePath);
          return (
            <button
              key={path + label}
              onClick={() => navigate(path)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-green-600/10 text-green-600 font-semibold'
                  : 'text-[var(--color-subdued)] hover:bg-[var(--color-border)]/50'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-[var(--color-border)] flex items-center justify-between">
        <span className="text-xs text-[var(--color-subdued)]">{dark ? 'Scuro' : 'Chiaro'}</span>
        <ThemeToggle dark={dark} onToggle={onToggleTheme} />
      </div>
    </aside>
  );
}
