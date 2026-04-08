import { useState, useEffect } from 'react';
import { Store, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Expense, SupplierSummary, ExpenseCategory } from '../../lib/types';
import { formatCurrency, toISODate, getMonday, getSaturday } from '../../lib/formatters';
import { getCategoryConfig, CATEGORY_COLORS } from '../../lib/constants';
import Card from '../ui/Card';
import EmptyState from '../ui/EmptyState';
import Spinner from '../ui/Spinner';

interface Props {
  onSelect: (supplier: string) => void;
}

type PeriodFilter = 'week' | 'month';

export default function SupplierList({ onSelect }: Props) {
  const [suppliers, setSuppliers] = useState<SupplierSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodFilter>('month');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const now = new Date();
      let from: string, to: string;

      if (period === 'week') {
        const mon = getMonday(now);
        from = toISODate(mon);
        to = toISODate(getSaturday(mon));
      } else {
        from = toISODate(new Date(now.getFullYear(), now.getMonth(), 1));
        to = toISODate(new Date(now.getFullYear(), now.getMonth() + 1, 0));
      }

      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .gte('date', from)
        .lte('date', to);

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      const expenses = (data || []) as Expense[];
      const map = new Map<string, SupplierSummary>();
      expenses.forEach((e) => {
        const key = e.subcategory;
        const existing = map.get(key);
        if (existing) {
          existing.total += e.amount;
          existing.count += 1;
        } else {
          map.set(key, {
            name: e.subcategory,
            category: e.category as ExpenseCategory,
            total: e.amount,
            count: 1,
          });
        }
      });

      const sorted = Array.from(map.values()).sort((a, b) => b.total - a.total);
      setSuppliers(sorted);
      setLoading(false);
    };
    fetch();
  }, [period]);

  const total = suppliers.reduce((s, sup) => s + sup.total, 0);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-3">
      {/* Period filter */}
      <div className="flex rounded-lg border border-[var(--color-border)] overflow-hidden">
        <button
          onClick={() => setPeriod('week')}
          className={`flex-1 px-4 py-2 text-sm font-semibold transition-colors ${
            period === 'week' ? 'bg-[var(--color-text)] text-[var(--color-surface)]' : 'bg-[var(--color-card)] text-[var(--color-subdued)]'
          }`}
        >
          Settimana
        </button>
        <button
          onClick={() => setPeriod('month')}
          className={`flex-1 px-4 py-2 text-sm font-semibold transition-colors ${
            period === 'month' ? 'bg-[var(--color-text)] text-[var(--color-surface)]' : 'bg-[var(--color-card)] text-[var(--color-subdued)]'
          }`}
        >
          Mese
        </button>
      </div>

      {/* Total */}
      {suppliers.length > 0 && (
        <Card className="p-4 text-center" gradient="linear-gradient(135deg, #FEF2F2, var(--color-card))">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-red-700 dark:text-red-400">Totale Spese</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-400 mt-1">{formatCurrency(total)}</p>
          <p className="text-xs text-[var(--color-subdued)] mt-1">{suppliers.length} fornitori</p>
        </Card>
      )}

      {/* List */}
      {suppliers.length === 0 ? (
        <EmptyState icon={Store} title="Nessun fornitore" description="Le spese registrate appariranno qui raggruppate per fornitore" />
      ) : (
        <div className="space-y-2">
          {suppliers.map((sup) => {
            const config = getCategoryConfig(sup.category);
            return (
              <Card
                key={sup.name}
                className="p-3 flex items-center gap-3"
                borderColor={CATEGORY_COLORS[sup.category]}
                onClick={() => onSelect(sup.name)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{config.icon}</span>
                    <span className="text-sm font-semibold text-[var(--color-text)] truncate">{sup.name}</span>
                  </div>
                  <p className="text-xs text-[var(--color-subdued)] mt-0.5">{sup.count} movimenti</p>
                </div>
                <span className="text-sm font-bold text-red-600 shrink-0">{formatCurrency(sup.total)}</span>
                <ChevronRight size={16} className="text-[var(--color-subdued)] shrink-0" />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
