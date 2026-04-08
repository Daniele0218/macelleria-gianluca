import { useState, useEffect } from 'react';
import { Banknote, CreditCard, Receipt, Check } from 'lucide-react';
import type { DailyRevenue } from '../../lib/types';
import { formatNumber } from '../../lib/formatters';
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
  const [saved, setSaved] = useState(false);

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
    setSaved(false);
  }, [revenue]);

  const cashNum = parseFloat(cash) || 0;
  const posNum = parseFloat(pos) || 0;
  const total = cashNum + posNum;

  const handleSave = async () => {
    setSaving(true);
    const ok = await onSave(cashNum, posNum, note.trim() || null);
    setSaving(false);
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
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
      {/* Saved feedback banner */}
      {saved && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700">
          <Check size={18} className="text-green-600" />
          <span className="text-sm font-semibold text-green-800 dark:text-green-300">Incasso salvato con successo!</span>
        </div>
      )}

      {/* Cassa */}
      <div className="rounded-xl border border-green-200 dark:border-green-800 overflow-hidden">
        <div className="bg-green-50 dark:bg-green-900/20 px-4 py-2 flex items-center justify-between">
          <label className="text-[11px] uppercase tracking-wider font-semibold text-green-700 dark:text-green-400">
            Incasso Cassa (Contanti)
          </label>
          <Banknote size={18} className="text-green-600" />
        </div>
        <div className="bg-white dark:bg-[#252525] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-green-700 dark:text-green-400">€</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={cash}
              onChange={(e) => setCash(e.target.value)}
              placeholder="0,00"
              className="text-3xl font-bold bg-transparent border-none outline-none w-full text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600"
            />
          </div>
        </div>
      </div>

      {/* POS */}
      <div className="rounded-xl border border-blue-200 dark:border-blue-800 overflow-hidden">
        <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 flex items-center justify-between">
          <label className="text-[11px] uppercase tracking-wider font-semibold text-blue-700 dark:text-blue-400">
            Incasso POS (Carte)
          </label>
          <CreditCard size={18} className="text-blue-600" />
        </div>
        <div className="bg-white dark:bg-[#252525] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-blue-700 dark:text-blue-400">€</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={pos}
              onChange={(e) => setPos(e.target.value)}
              placeholder="0,00"
              className="text-3xl font-bold bg-transparent border-none outline-none w-full text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600"
            />
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="rounded-xl border border-amber-300 dark:border-amber-700 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Receipt size={16} className="text-amber-700 dark:text-amber-400" />
          <label className="text-[11px] uppercase tracking-wider font-semibold text-amber-700 dark:text-amber-400">
            Totale Giorno
          </label>
        </div>
        <p className="text-4xl font-extrabold text-amber-900 dark:text-amber-200">
          € {formatNumber(total)}
        </p>
      </div>

      {/* Note */}
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Nota (opzionale)..."
        rows={2}
        className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text)] px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-[var(--color-subdued)]/50"
      />

      {/* Save */}
      <Button onClick={handleSave} loading={saving} fullWidth>
        {revenue ? 'Aggiorna Incasso' : 'Salva Incasso'}
      </Button>
    </div>
  );
}
