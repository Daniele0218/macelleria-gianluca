import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, Check, User, Trash2 } from 'lucide-react';
import { useEmployees } from '../../hooks/useEmployees';
import { supabase } from '../../lib/supabase';
import { formatMonth, formatCurrency, formatDate } from '../../lib/formatters';
import type { SalaryPayment } from '../../lib/types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Spinner from '../ui/Spinner';
import toast from 'react-hot-toast';

type PayMode = 'giornata' | 'mensile';

export default function SalaryManager() {
  const { active, loading: empLoading } = useEmployees();
  const [payMode, setPayMode] = useState<PayMode>('giornata');
  const [selectedEmp, setSelectedEmp] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // History
  const [payments, setPayments] = useState<(SalaryPayment & { employee_name?: string })[]>([]);
  const [histLoading, setHistLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;

  // Load payments for current month
  const loadPayments = async () => {
    setHistLoading(true);
    const { data } = await supabase
      .from('salary_payments')
      .select('*, employees(name)')
      .eq('month', monthStr)
      .order('created_at', { ascending: false });
    const mapped = (data || []).map((d: Record<string, unknown>) => ({
      ...d,
      employee_name: (d.employees as { name: string } | null)?.name || '?',
    })) as (SalaryPayment & { employee_name?: string })[];
    setPayments(mapped);
    setHistLoading(false);
  };

  useEffect(() => { loadPayments(); }, [monthStr]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-select first employee
  useEffect(() => {
    if (active.length > 0 && !selectedEmp) {
      setSelectedEmp(active[0].id);
    }
  }, [active, selectedEmp]);

  // Pre-fill amount from employee salary when selecting monthly
  useEffect(() => {
    if (payMode === 'mensile' && selectedEmp) {
      const emp = active.find(e => e.id === selectedEmp);
      if (emp && emp.monthly_salary > 0) {
        setAmount(String(emp.monthly_salary));
      }
    }
  }, [payMode, selectedEmp, active]);

  const handleSave = async () => {
    if (!selectedEmp || !amount) return;
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;

    setSaving(true);
    const type = payMode === 'giornata' ? 'giornata' : 'stipendio';

    const { error } = await supabase.from('salary_payments').insert({
      employee_id: selectedEmp,
      month: monthStr,
      type,
      amount: amt,
    });

    if (error) {
      toast.error('Errore salvataggio');
      console.error(error);
    } else {
      toast.success('Pagamento registrato!');
      setSaved(true);
      setAmount('');
      setTimeout(() => setSaved(false), 3000);
      await loadPayments();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('salary_payments').delete().eq('id', deleteId);
    if (error) toast.error('Errore eliminazione');
    else { toast.success('Pagamento eliminato'); await loadPayments(); }
    setDeleteId(null);
  };

  const prevMonth = () => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
  const nextMonth = () => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));

  const totalMonth = payments.reduce((s, p) => s + p.amount, 0);
  const selectedEmpName = active.find(e => e.id === selectedEmp)?.name || '';

  if (empLoading) return <Spinner />;

  return (
    <div className="space-y-4 overflow-hidden">
      {/* Feedback */}
      {saved && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700">
          <Check size={18} className="text-green-600" />
          <span className="text-sm font-semibold text-green-800 dark:text-green-300">Pagamento registrato!</span>
        </div>
      )}

      {/* Pay mode toggle */}
      <div className="flex rounded-xl border border-[var(--color-border)] overflow-hidden">
        <button
          onClick={() => { setPayMode('giornata'); setAmount(''); }}
          className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
            payMode === 'giornata' ? 'bg-[var(--color-text)] text-[var(--color-surface)]' : 'bg-[var(--color-card)] text-[var(--color-subdued)]'
          }`}
        >
          Giornata
        </button>
        <button
          onClick={() => { setPayMode('mensile'); setAmount(''); }}
          className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
            payMode === 'mensile' ? 'bg-[var(--color-text)] text-[var(--color-surface)]' : 'bg-[var(--color-card)] text-[var(--color-subdued)]'
          }`}
        >
          Mensile
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

      {/* Simple form — like revenue page */}
      <div className="rounded-xl border border-purple-200 dark:border-purple-800 overflow-hidden">
        <div className="bg-purple-50 dark:bg-purple-900/20 px-4 py-2">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-purple-700 dark:text-purple-400">
            {payMode === 'giornata' ? 'Paga Giornata' : 'Paga Stipendio Mensile'}
          </p>
        </div>
        <div className="bg-white dark:bg-[#252525] p-4 space-y-3">
          {/* Employee select — big buttons */}
          <p className="text-[11px] uppercase tracking-wider font-semibold text-[var(--color-subdued)]">Operaio</p>
          <div className="flex gap-2">
            {active.map((emp) => (
              <button
                key={emp.id}
                onClick={() => setSelectedEmp(emp.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  selectedEmp === emp.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-[var(--color-border)]/30 text-[var(--color-subdued)]'
                }`}
              >
                <User size={14} />
                {emp.name}
              </button>
            ))}
          </div>

          {/* Amount — big input */}
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-[var(--color-subdued)] mb-1">Importo</p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-purple-700 dark:text-purple-400">€</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="text-3xl font-bold bg-transparent border-none outline-none w-full text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600"
              />
            </div>
          </div>

          <Button onClick={handleSave} loading={saving} fullWidth disabled={!selectedEmp || !amount}>
            Registra {payMode === 'giornata' ? 'Giornata' : 'Stipendio'} — {selectedEmpName}
          </Button>
        </div>
      </div>

      {/* Total card */}
      {totalMonth > 0 && (
        <div className="rounded-xl border border-purple-200 dark:border-purple-800 overflow-hidden">
          <div className="bg-purple-50 dark:bg-purple-900/20 px-4 py-3 text-center">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-purple-700 dark:text-purple-400">
              Totale {formatMonth(date)}
            </p>
            <p className="text-2xl font-bold text-purple-800 dark:text-purple-300 mt-1">{formatCurrency(totalMonth)}</p>
          </div>
        </div>
      )}

      {/* Payment history */}
      {histLoading ? <Spinner /> : payments.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider font-semibold text-[var(--color-subdued)]">Pagamenti registrati</p>
          {payments.map((p) => (
            <Card key={p.id} className="p-3 flex items-center gap-3" borderColor="#7C3AED">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--color-text)]">{p.employee_name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-semibold">
                    {p.type === 'giornata' ? 'Giornata' : p.type === 'stipendio' ? 'Stipendio' : p.type.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-subdued)] mt-0.5">{formatDate(p.month)}</p>
              </div>
              <span className="text-sm font-bold text-purple-700 dark:text-purple-400 shrink-0">
                {formatCurrency(p.amount)}
              </span>
              <button
                onClick={() => setDeleteId(p.id)}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--color-subdued)] hover:text-red-600 transition-colors shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </Card>
          ))}
        </div>
      )}

      {/* Delete modal */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Elimina pagamento"
        actions={
          <>
            <Button variant="secondary" onClick={() => setDeleteId(null)}>Annulla</Button>
            <Button variant="danger" onClick={handleDelete}>Elimina</Button>
          </>
        }
      >
        <p className="text-sm text-[var(--color-subdued)]">Sei sicuro di voler eliminare questo pagamento?</p>
      </Modal>
    </div>
  );
}
