import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEmployees } from '../../hooks/useEmployees';
import { useSalaryPayments } from '../../hooks/useSalaryPayments';
import { formatMonth, formatCurrency, firstOfMonth } from '../../lib/formatters';
import { SALARY_TYPES } from '../../lib/constants';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';

export default function SalaryManager() {
  const [date, setDate] = useState(new Date());
  const monthStr = firstOfMonth(date);
  const { active, loading: empLoading } = useEmployees();
  const { getPayment, saveAll, totalMonth, loading: salLoading } = useSalaryPayments(monthStr);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const prevMonth = () => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
  const nextMonth = () => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));

  const getKey = (empId: string, type: string) => `${empId}_${type}`;

  const getValue = (empId: string, type: 'stipendio' | 'inps' | 'tfr', fallback: number) => {
    const key = getKey(empId, type);
    if (key in values) return values[key];
    const existing = getPayment(empId, type);
    if (existing) return String(existing.amount);
    if (type === 'stipendio' && fallback > 0) return String(fallback);
    return '';
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
    setSaving(false);
  };

  if (empLoading || salLoading) return <Spinner />;

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-[var(--color-text)]">Stipendi Mensili</h3>

      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-[var(--color-border)]/30">
          <ChevronLeft size={20} className="text-[var(--color-subdued)]" />
        </button>
        <p className="text-sm font-semibold text-[var(--color-text)] capitalize">{formatMonth(date)}</p>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-[var(--color-border)]/30">
          <ChevronRight size={20} className="text-[var(--color-subdued)]" />
        </button>
      </div>

      {/* Per employee */}
      {active.map((emp) => (
        <Card key={emp.id} className="p-4">
          <p className="text-sm font-semibold text-[var(--color-text)] mb-3">{emp.name}</p>
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
                    className="w-full pl-6 pr-2 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-success)]"
                    placeholder="0"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}

      {/* Total */}
      {totalMonth > 0 && (
        <Card className="p-3 text-center" gradient="linear-gradient(135deg, #F5F3FF, var(--color-card))">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-purple-700 dark:text-purple-400">Totale Stipendi Mese</p>
          <p className="text-xl font-bold text-purple-700 dark:text-purple-400 mt-1">{formatCurrency(totalMonth)}</p>
        </Card>
      )}

      <Button onClick={handleSave} loading={saving} fullWidth>
        Registra Pagamenti
      </Button>
    </div>
  );
}
