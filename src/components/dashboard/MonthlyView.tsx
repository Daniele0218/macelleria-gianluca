import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useDashboard, type MonthlyData } from '../../hooks/useDashboard';
import { formatMonth, formatCurrency } from '../../lib/formatters';
import SummaryCards from './SummaryCards';
import Card from '../ui/Card';
import Spinner from '../ui/Spinner';

export default function MonthlyView() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [data, setData] = useState<MonthlyData | null>(null);
  const { fetchMonthly, loading } = useDashboard();

  useEffect(() => {
    fetchMonthly(year, month).then(setData);
  }, [year, month]); // eslint-disable-line react-hooks/exhaustive-deps

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  const dateForLabel = new Date(year, month, 1);

  return (
    <div className="space-y-4">
      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-[var(--color-border)]/30">
          <ChevronLeft size={20} className="text-[var(--color-subdued)]" />
        </button>
        <p className="text-sm font-semibold text-[var(--color-text)] capitalize">
          {formatMonth(dateForLabel)}
        </p>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-[var(--color-border)]/30">
          <ChevronRight size={20} className="text-[var(--color-subdued)]" />
        </button>
      </div>

      {loading || !data ? <Spinner /> : (
        <>
          <SummaryCards summary={data.summary} />

          {/* Revenue line chart */}
          {data.weeklyRevenues.length > 0 && (
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">Andamento Incassi</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.weeklyRevenues}>
                    <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--color-subdued)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--color-subdued)' }} tickFormatter={(v) => `€${v}`} width={55} />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
                    />
                    <Line type="monotone" dataKey="total" stroke="#16A34A" strokeWidth={2.5} dot={{ fill: '#16A34A', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {/* Pie chart */}
          {data.expensesByCategory.length > 0 && (
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">Distribuzione Spese</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.expensesByCategory}
                      dataKey="total"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`}
                      labelLine={false}
                      fontSize={11}
                    >
                      {data.expensesByCategory.map((entry) => (
                        <Cell key={entry.category} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
                    />
                    <Legend formatter={(value) => value} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
