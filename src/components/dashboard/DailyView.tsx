import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addDays } from 'date-fns';
import { useDashboard, type DailyData } from '../../hooks/useDashboard';
import { formatDateLong, formatCurrency, formatDateShort } from '../../lib/formatters';
import { getCategoryConfig, CATEGORY_COLORS } from '../../lib/constants';
import SummaryCards from './SummaryCards';
import Card from '../ui/Card';
import Spinner from '../ui/Spinner';

export default function DailyView() {
  const [date, setDate] = useState(new Date());
  const [data, setData] = useState<DailyData | null>(null);
  const { fetchDaily, loading } = useDashboard();

  useEffect(() => {
    fetchDaily(date).then(setData);
  }, [date]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      {/* Date nav */}
      <div className="flex items-center justify-between">
        <button onClick={() => setDate(addDays(date, -1))} className="p-2 rounded-lg hover:bg-[var(--color-border)]/30">
          <ChevronLeft size={20} className="text-[var(--color-subdued)]" />
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-[var(--color-text)] capitalize hidden sm:block">{formatDateLong(date)}</p>
          <p className="text-sm font-semibold text-[var(--color-text)] sm:hidden">{formatDateShort(date)}</p>
        </div>
        <button onClick={() => setDate(addDays(date, 1))} className="p-2 rounded-lg hover:bg-[var(--color-border)]/30">
          <ChevronRight size={20} className="text-[var(--color-subdued)]" />
        </button>
      </div>

      {loading || !data ? <Spinner /> : (
        <>
          <SummaryCards summary={data.summary} />

          {/* Expense breakdown */}
          {data.expenses.length > 0 && (
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">Spese del giorno</h3>
              <div className="space-y-2">
                {data.expenses.map((e) => {
                  const config = getCategoryConfig(e.category);
                  return (
                    <div key={e.id} className="flex items-center justify-between py-1.5 border-b border-[var(--color-border)]/50 last:border-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[e.category] }} />
                        <span className="text-xs">{config.icon}</span>
                        <span className="text-sm text-[var(--color-text)] truncate">{e.subcategory}</span>
                      </div>
                      <span className="text-sm font-semibold text-red-600 shrink-0 ml-2">{formatCurrency(e.amount)}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
