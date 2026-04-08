import { useState, useEffect } from 'react';
import { ArrowLeft, Store } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Expense } from '../../lib/types';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { CATEGORY_COLORS } from '../../lib/constants';
import Card from '../ui/Card';
import EmptyState from '../ui/EmptyState';
import Spinner from '../ui/Spinner';

interface Props {
  supplier: string;
  onBack: () => void;
}

export default function SupplierDetail({ supplier, onBack }: Props) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('expenses')
        .select('*')
        .eq('subcategory', supplier)
        .order('date', { ascending: false })
        .limit(100);
      setExpenses((data || []) as Expense[]);
      setLoading(false);
    };
    fetch();
  }, [supplier]);

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-3">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm font-medium text-[var(--color-subdued)] hover:text-[var(--color-text)] transition-colors"
      >
        <ArrowLeft size={16} /> Torna ai fornitori
      </button>

      <Card className="p-4" gradient="linear-gradient(135deg, #FEF2F2, var(--color-card))">
        <h2 className="text-lg font-bold text-[var(--color-text)]">{supplier}</h2>
        <p className="text-2xl font-bold text-red-700 dark:text-red-400 mt-1">{formatCurrency(total)}</p>
        <p className="text-xs text-[var(--color-subdued)] mt-1">{expenses.length} movimenti totali</p>
      </Card>

      {loading ? <Spinner /> : expenses.length === 0 ? (
        <EmptyState icon={Store} title="Nessun movimento" />
      ) : (
        <div className="space-y-2">
          {expenses.map((e) => (
            <Card key={e.id} className="p-3 flex items-center justify-between" borderColor={CATEGORY_COLORS[e.category]}>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--color-text)]">{formatDate(e.date)}</p>
                {e.note && <p className="text-xs text-[var(--color-subdued)] truncate">{e.note}</p>}
              </div>
              <span className="text-sm font-bold text-red-600 shrink-0">{formatCurrency(e.amount)}</span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
