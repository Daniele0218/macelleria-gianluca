import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useDashboard, type WeeklyData } from '../../hooks/useDashboard';
import { getMonday, formatDateShort, formatCurrency } from '../../lib/formatters';
import SummaryCards from './SummaryCards';
import Card from '../ui/Card';
import Spinner from '../ui/Spinner';

export default function WeeklyView() {
  const [monday, setMonday] = useState(() => getMonday(new Date()));
  const [data, setData] = useState<WeeklyData | null>(null);
  const { fetchWeekly, loading } = useDashboard();

  useEffect(() => {
    fetchWeekly(monday).then(setData);
  }, [monday]); // eslint-disable-line react-hooks/exhaustive-deps

  const prevWeek = () => {
    const d = new Date(monday);
    d.setDate(d.getDate() - 7);
    setMonday(d);
  };
  const nextWeek = () => {
    const d = new Date(monday);
    d.setDate(d.getDate() + 7);
    setMonday(d);
  };

  const sat = new Date(monday);
  sat.setDate(monday.getDate() + 5);

  return (
    <div className="space-y-4">
      {/* Week nav */}
      <div className="flex items-center justify-between">
        <button onClick={prevWeek} className="p-2 rounded-lg hover:bg-[var(--color-border)]/30">
          <ChevronLeft size={20} className="text-[var(--color-subdued)]" />
        </button>
        <p className="text-sm font-semibold text-[var(--color-text)]">
          {formatDateShort(monday)} — {formatDateShort(sat)}
        </p>
        <button onClick={nextWeek} className="p-2 rounded-lg hover:bg-[var(--color-border)]/30">
          <ChevronRight size={20} className="text-[var(--color-subdued)]" />
        </button>
      </div>

      {loading || !data ? <Spinner /> : (
        <>
          <SummaryCards summary={data.summary} />

          {/* Bar chart */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">Incassi Settimanali</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.dailyRevenues}>
                  <XAxis dataKey="dayName" tick={{ fontSize: 12, fill: 'var(--color-subdued)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--color-subdued)' }} tickFormatter={(v) => `€${v}`} width={55} />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
                  />
                  <Legend formatter={(v) => v === 'cash' ? 'Cassa' : 'POS'} />
                  <Bar dataKey="cash" stackId="a" fill="#16A34A" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="pos" stackId="a" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Expenses by category */}
          {data.expensesByCategory.length > 0 && (
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">Spese per Categoria</h3>
              <div className="space-y-2">
                {data.expensesByCategory.map((cat) => (
                  <div key={cat.category} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: cat.color }} />
                      <span className="text-sm text-[var(--color-text)]">{cat.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-red-600">{formatCurrency(cat.total)}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
