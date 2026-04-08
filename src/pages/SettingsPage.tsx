import { useState } from 'react';
import { Users, Wallet, Download } from 'lucide-react';
import EmployeeManager from '../components/settings/EmployeeManager';
import SalaryManager from '../components/settings/SalaryManager';
import ExportData from '../components/settings/ExportData';

type Tab = 'operai' | 'stipendi' | 'export';

const tabs: { key: Tab; label: string; icon: typeof Users }[] = [
  { key: 'operai', label: 'Operai', icon: Users },
  { key: 'stipendi', label: 'Stipendi', icon: Wallet },
  { key: 'export', label: 'Export', icon: Download },
];

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('operai');

  return (
    <div className="p-4 space-y-4 overflow-hidden">
      <h2 className="text-lg font-bold text-[var(--color-text)]">Impostazioni</h2>

      {/* Tab bar */}
      <div className="flex rounded-lg border border-[var(--color-border)] overflow-hidden">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold transition-colors ${
              tab === key
                ? 'bg-[var(--color-text)] text-[var(--color-surface)]'
                : 'bg-[var(--color-card)] text-[var(--color-subdued)] hover:bg-[var(--color-border)]/30'
            }`}
          >
            <Icon size={16} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'operai' && <EmployeeManager />}
      {tab === 'stipendi' && <SalaryManager />}
      {tab === 'export' && <ExportData />}
    </div>
  );
}
