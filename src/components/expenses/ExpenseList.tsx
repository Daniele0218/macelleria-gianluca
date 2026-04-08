import { useState } from 'react';
import { Trash2, Search, ClipboardList } from 'lucide-react';
import type { Expense, ExpenseCategory } from '../../lib/types';
import { formatCurrency } from '../../lib/formatters';
import { CATEGORIES, getCategoryConfig, CATEGORY_COLORS } from '../../lib/constants';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import Spinner from '../ui/Spinner';

interface Props {
  expenses: Expense[];
  loading: boolean;
  onDelete: (id: string) => Promise<boolean>;
}

export default function ExpenseList({ expenses, loading, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<ExpenseCategory | ''>('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = expenses.filter((e) => {
    if (filterCat && e.category !== filterCat) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        e.subcategory.toLowerCase().includes(q) ||
        (e.note?.toLowerCase().includes(q) ?? false)
      );
    }
    return true;
  });

  const totalFiltered = filtered.reduce((sum, e) => sum + e.amount, 0);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    await onDelete(deleteId);
    setDeleting(false);
    setDeleteId(null);
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-3">
      {/* Search + Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-subdued)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca spese..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-success)]"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterCat('')}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !filterCat ? 'bg-[var(--color-text)] text-[var(--color-surface)]' : 'bg-[var(--color-border)]/50 text-[var(--color-subdued)]'
            }`}
          >
            Tutte
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setFilterCat(c.key)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filterCat === c.key ? 'bg-[var(--color-text)] text-[var(--color-surface)]' : 'bg-[var(--color-border)]/50 text-[var(--color-subdued)]'
              }`}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Total */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-[var(--color-subdued)]">{filtered.length} spese</span>
          <span className="text-sm font-bold text-red-600">{formatCurrency(totalFiltered)}</span>
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState icon={ClipboardList} title="Nessuna spesa" description={search || filterCat ? 'Nessun risultato per i filtri selezionati' : 'Aggiungi la prima spesa del giorno'} />
      ) : (
        <div className="space-y-2">
          {filtered.map((expense) => {
            const config = getCategoryConfig(expense.category);
            return (
              <Card
                key={expense.id}
                className="p-3 flex items-center gap-3"
                borderColor={CATEGORY_COLORS[expense.category]}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{config.icon}</span>
                    <span className="text-sm font-semibold text-[var(--color-text)] truncate">
                      {expense.subcategory}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-border)]/50 text-[var(--color-subdued)] shrink-0">
                      IVA {expense.vat_rate}%
                    </span>
                  </div>
                  {expense.note && (
                    <p className="text-xs text-[var(--color-subdued)] mt-0.5 truncate">{expense.note}</p>
                  )}
                </div>
                <span className="text-sm font-bold text-red-600 shrink-0">
                  {formatCurrency(expense.amount)}
                </span>
                <button
                  onClick={() => setDeleteId(expense.id)}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--color-subdued)] hover:text-red-600 transition-colors shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Modal */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Elimina spesa"
        actions={
          <>
            <Button variant="secondary" onClick={() => setDeleteId(null)}>Annulla</Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>Elimina</Button>
          </>
        }
      >
        <p className="text-sm text-[var(--color-subdued)]">
          Sei sicuro di voler eliminare questa spesa? L'azione non e' reversibile.
        </p>
      </Modal>
    </div>
  );
}
