import { useState, useEffect } from 'react';
import { Banknote, CreditCard, Receipt } from 'lucide-react';
import type { DailyRevenue } from '../../lib/types';
import { formatNumber } from '../../lib/formatters';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface Props {
  revenue: DailyRevenue | null;
  loading: boolean;
  onSave: (cash: number, pos: number, note: string | null) => Promise<boolean>;
}

export default function RevenueForm({ revenue, loading, onSave }: Props) {
  const [cash, setCash] = useState('');
  const [pos, setPos] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (revenue) {
      setCash(revenue.cash_amount > 0 ? String(revenue.cash_amount) : '');
      setPos(revenue.pos_amount > 0 ? String(revenue.pos_amount) : '');
      setNote(revenue.note || '');
    } else {
      setCash('');
      setPos('');
      setNote('');
    }
  }, [revenue]);

  const cashNum = parseFloat(cash) || 0;
  const posNum = parseFloat(pos) || 0;
  const total = cashNum + posNum;

  const handleSave = async () => {
    setSaving(true);
    await onSave(cashNum, posNum, note.trim() || null);
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-[var(--color-border)]/30 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {/* Cassa - Green tinted */}
      <Card className="p-4" gradient="linear-gradient(135deg, #F0FDF4, var(--color-card))">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <label className="text-[11px] uppercase tracking-wider font-semibold text-green-700 dark:text-green-400">
              Incasso Cassa
            </label>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg text-[var(--color-subdued)]">€</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={cash}
                onChange={(e) => setCash(e.target.value)}
                placeholder="0,00"
                className="text-3xl font-bold bg-transparent border-none outline-none w-full text-[var(--color-text)] placeholder:text-[var(--color-border)]"
              />
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
            <Banknote size={20} className="text-green-600" />
          </div>
        </div>
      </Card>

      {/* POS - Blue tinted */}
      <Card className="p-4" gradient="linear-gradient(135deg, #EFF6FF, var(--color-card))">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <label className="text-[11px] uppercase tracking-wider font-semibold text-blue-700 dark:text-blue-400">
              Incasso POS
            </label>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg text-[var(--color-subdued)]">€</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={pos}
                onChange={(e) => setPos(e.target.value)}
                placeholder="0,00"
                className="text-3xl font-bold bg-transparent border-none outline-none w-full text-[var(--color-text)] placeholder:text-[var(--color-border)]"
              />
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
            <CreditCard size={20} className="text-blue-600" />
          </div>
        </div>
      </Card>

      {/* Total - Gold gradient */}
      <Card className="p-4 text-center" gradient="linear-gradient(135deg, #FEF3C7, #FDE68A)">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Receipt size={16} className="text-amber-700" />
          <label className="text-[11px] uppercase tracking-wider font-semibold text-amber-700">
            Totale Giorno
          </label>
        </div>
        <p className="text-4xl font-extrabold text-amber-900">
          € {formatNumber(total)}
        </p>
      </Card>

      {/* Note */}
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Nota (opzionale)..."
        rows={2}
        className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text)] px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-success)] placeholder:text-[var(--color-subdued)]/50"
      />

      {/* Save */}
      <Button onClick={handleSave} loading={saving} fullWidth>
        {revenue ? 'Aggiorna Incasso' : 'Salva Incasso'}
      </Button>
    </div>
  );
}
