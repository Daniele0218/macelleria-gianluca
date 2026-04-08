import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import ThemeToggle from './ThemeToggle';

interface Props {
  dark: boolean;
  onToggleTheme: () => void;
}

export default function AppLayout({ dark, onToggleTheme }: Props) {
  return (
    <div className="flex min-h-screen">
      <Sidebar dark={dark} onToggleTheme={onToggleTheme} />
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="md:hidden bg-[#292524] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-stone-400 font-medium">Macelleria Gianluca</p>
            <h1 className="text-base font-bold leading-tight">Gestionale</h1>
          </div>
          <ThemeToggle dark={dark} onToggle={onToggleTheme} />
        </header>
        <main className="flex-1 pb-20 md:pb-0">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
