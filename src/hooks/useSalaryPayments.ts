import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { SalaryPayment } from '../lib/types';
import toast from 'react-hot-toast';

export function useSalaryPayments(month: string) {
  const [payments, setPayments] = useState<SalaryPayment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('salary_payments')
      .select('*')
      .eq('month', month);

    if (error) {
      toast.error('Errore caricamento pagamenti');
      console.error(error);
    }
    setPayments((data || []) as SalaryPayment[]);
    setLoading(false);
  }, [month]);

  useEffect(() => { fetch(); }, [fetch]);

  const upsert = async (employeeId: string, type: 'stipendio' | 'inps' | 'tfr', amount: number) => {
    const { error } = await supabase
      .from('salary_payments')
      .upsert(
        { employee_id: employeeId, month, type, amount },
        { onConflict: 'employee_id,month,type' }
      );
    if (error) {
      toast.error('Errore salvataggio pagamento');
      console.error(error);
      return false;
    }
    return true;
  };

  const saveAll = async (data: { employeeId: string; type: 'stipendio' | 'inps' | 'tfr'; amount: number }[]) => {
    const filtered = data.filter((d) => d.amount > 0);
    if (filtered.length === 0) {
      toast.error('Nessun importo da salvare');
      return false;
    }
    for (const d of filtered) {
      const ok = await upsert(d.employeeId, d.type, d.amount);
      if (!ok) return false;
    }
    toast.success('Pagamenti registrati!');
    await fetch();
    return true;
  };

  const getPayment = (employeeId: string, type: 'stipendio' | 'inps' | 'tfr') => {
    return payments.find((p) => p.employee_id === employeeId && p.type === type);
  };

  const totalMonth = payments.reduce((s, p) => s + p.amount, 0);

  return { payments, loading, saveAll, getPayment, totalMonth, refetch: fetch };
}
