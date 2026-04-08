import { useLocation, useNavigate } from 'react-router-dom';
import { Banknote, ClipboardList, BarChart3, Store, Settings } from 'lucide-react';

const tabs = [
  { path: '/', label: 'Incassi', icon: Banknote },
  { path: '/spese', label: 'Spese', icon: ClipboardList },
  { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { path: '/fornitori', label: 'Fornitori', icon: Store },
  { path: '/altro', label: 'Altro', icon: Settings },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--color-card)] border-t border-[var(--color-border)] md:hidden z-50">
      <div className="flex justify-around items-center h-16 px-1" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {tabs.map(({ path, label, icon: Icon }) => {
          const active = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center justify-center gap-0.5 w-full py-1 transition-colors ${
                active ? 'text-[var(--color-text)]' : 'text-[var(--color-subdued)]'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
              <span className={`text-[10px] ${active ? 'font-semibold' : ''}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
