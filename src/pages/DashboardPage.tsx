import { useState } from 'react';
import type { PeriodView } from '../lib/types';
import PeriodToggle from '../components/dashboard/PeriodToggle';
import DailyView from '../components/dashboard/DailyView';
import WeeklyView from '../components/dashboard/WeeklyView';
import MonthlyView from '../components/dashboard/MonthlyView';

export default function DashboardPage() {
  const [period, setPeriod] = useState<PeriodView>('week');

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold text-[var(--color-text)]">Dashboard</h2>
      <PeriodToggle value={period} onChange={setPeriod} />
      {period === 'day' && <DailyView />}
      {period === 'week' && <WeeklyView />}
      {period === 'month' && <MonthlyView />}
    </div>
  );
}
