import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, CalendarDays } from 'lucide-react';
import { useEmployees } from '../../hooks/useEmployees';
import { useSalaryPayments } from '../../hooks/useSalaryPayments';
import { formatMonth, formatCurrency, firstOfMonth } from '../../lib/formatters';
import { SALARY_TYPES } from '../../lib/constants';
import { supabase } from '../../lib/supabase';
import type { SalaryPayment } from '../../lib/types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';

type ViewMode = 'register' | 'history';

export default function SalaryManager() {
  const [date, setDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('register');
  const monthStr = firstOfMonth(date);
  const { active, loading: empLoading } = useEmployees();
  const { getPayment, saveAll, totalMonth, loading: salLoading } = useSalaryPayments(monthStr);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<(SalaryPayment & { employee_name?: string })[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const prevMonth = () => { setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1)); setValues({}); };
  const nextMonth = () => { setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1)); setValues({}); };

  // Load payment history for this month
  useEffect(() => {
    if (viewMode === 'history') {
      const loadHistory = async () => {
        setHistoryLoading(true);
        const { data } = await supabase
          .from('salary_payments')
          .select('*, employees(name)')
          .eq('month', monthStr)
          .order('created_at', { ascending: false });
        const mapped = (data || []).map((d: Record<string, unknown>) => ({
          ...d,
          employee_name: (d.employees as { name: string } | null)?.name || '?',
        })) as (SalaryPayment & { employee_name?: string })[];
        setHistory(mapped);
        setHistoryLoading(false);
      };
      loadHistory();
    }
  }, [viewMode, monthStr]);

  const getKey = (empId: string, type: string) => `${empId}_${type}`;

  const getValue = (empId: string, type: 'stipendio' | 'inps' | 'tfr', fallback: number) => {
    const key = getKey(empId, type);
    if (key in values) return values[key];
    const existing = getPayment(empId, type);
    if (existing) return String(existing.amount);
    if (type === 'stipendio' && fallback > 0) return String(fallback);
    return '';
  };

  const isPaid = (empId: string, type: 'stipendio' | 'inps' | 'tfr') => {
    return !!getPayment(empId, type);
  };

  const handleSave = async () => {
    setSaving(true);
    const data: { employeeId: string; type: 'stipendio' | 'inps' | 'tfr'; amount: number }[] = [];
    active.forEach((emp) => {
      SALARY_TYPES.forEach(({ key }) => {
        const val = parseFloat(getValue(emp.id, key, emp.monthly_salary)) || 0;
        if (val > 0) {
          data.push({ employeeId: emp.id, type: key, amount: val });
        }
      });
    });
    await saveAll(data);
    setValues({});
    setSaving(false);
  };

  if (empLoading || salLoading) return <Spinner />;

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-[var(--color-text)]">Stipendi</h3>

      {/* View mode toggle */}
      <div className="flex rounded-lg border border-[var(--color-border)] overflow-hidden">
        <button
          onClick={() => setViewMode('register')}
          className={`flex-1 px-4 py-2.5 text-sm font-semibold transition-colors ${
            viewMode === 'register' ? 'bg-[var(--color-text)] text-[var(--color-surface)]' : 'bg-[var(--color-card)] text-[var(--color-subdued)]'
          }`}
        >
          Registra
        </button>
        <button
          onClick={() => setViewMode('history')}
          className={`flex-1 px-4 py-2.5 text-sm font-semibold transition-colors ${
            viewMode === 'history' ? 'bg-[var(--color-text)] text-[var(--color-surface)]' : 'bg-[var(--color-card)] text-[var(--color-subdued)]'
          }`}
        >
          Riepilogo
        </button>
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-[var(--color-border)]/30">
          <ChevronLeft size={20} className="text-[var(--color-subdued)]" />
        </button>
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-purple-600" />
          <p className="text-sm font-semibold text-[var(--color-text)] capitalize">{formatMonth(date)}</p>
        </div>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-[var(--color-border)]/30">
          <ChevronRight size={20} className="text-[var(--color-subdued)]" />
        </button>
      </div>

      {/* Total card always visible */}
      <div className="rounded-xl border border-purple-200 dark:border-purple-800 overflow-hidden">
        <div className="bg-purple-50 dark:bg-purple-900/20 px-4 py-3 text-center">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-purple-700 dark:text-purple-400">Totale Stipendi — {formatMonth(date)}</p>
          <p className="text-2xl font-bold text-purple-800 dark:text-purple-300 mt-1">{formatCurrency(totalMonth)}</p>
          {totalMonth > 0 && (
            <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">
              Incluso nella Dashboard come uscita
            </p>
          )}
        </div>
      </div>

      {viewMode === 'register' ? (
        <>
          {/* Per employee registration */}
          {active.map((emp) => (
            <Card key={emp.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-[var(--color-text)]">{emp.name}</p>
                {/* Payment status badges */}
                <div className="flex gap-1">
                  {SALARY_TYPES.map(({ key, label }) => (
                    <span
                      key={key}
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${
                        isPaid(emp.id, key)
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-[var(--color-border)]/50 text-[var(--color-subdued)]'
                      }`}
                    >
                      {isPaid(emp.id, key) && <Check size={8} className="inline mr-0.5" />}
                      {label.split(' ')[0]}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {SALARY_TYPES.map(({ key, label }) => (
                  <div key={key} className="space-y-1">
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-[var(--color-subdued)]">
                      {label}
                    </label>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-[var(--color-subdued)]">€</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        value={getValue(emp.id, key, emp.monthly_salary)}
                        onChange={(e) => setValues({ ...values, [getKey(emp.id, key)]: e.target.value })}
                        className={`w-full pl-6 pr-2 py-2 text-sm rounded-lg border bg-[var(--color-card)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          isPaid(emp.id, key) ? 'border-green-300 dark:border-green-700' : 'border-[var(--color-border)]'
                        }`}
                        placeholder="0"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}

          <Button onClick={handleSave} loading={saving} fullWidth>
            Registra Pagamenti
          </Button>
        </>
      ) : (
        /* History / Riepilogo view */
        historyLoading ? <Spinner /> : (
          <div className="space-y-2">
            {history.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-sm text-[var(--color-subdued)]">Nessun pagamento registrato per {formatMonth(date)}</p>
              </Card>
            ) : (
              <>
                {/* Group by employee */}
                {active.map((emp) => {
                  const empPayments = history.filter((h) => h.employee_id === emp.id);
                  if (empPayments.length === 0) return null;
                  const empTotal = empPayments.reduce((s, p) => s + p.amount, 0);
                  return (
                    <Card key={emp.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-[var(--color-text)]">{emp.name}</p>
                        <p className="text-sm font-bold text-purple-700 dark:text-purple-400">{formatCurrency(empTotal)}</p>
                      </div>
                      <div className="space-y-1">
                        {empPayments.map((p) => (
                          <div key={p.id} className="flex items-center justify-between py-1 border-b border-[var(--color-border)]/30 last:border-0">
                            <div className="flex items-center gap-2">
                              <Check size={14} className="text-green-600" />
                              <span className="text-xs text-[var(--color-subdued)] capitalize">{p.type}</span>
                            </div>
                            <span className="text-xs font-semibold text-[var(--color-text)]">{formatCurrency(p.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  );
                })}
              </>
            )}
          </div>
        )
      )}
    </div>
  );
}
