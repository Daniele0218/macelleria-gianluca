import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { DailyRevenue } from '../lib/types';
import { toISODate } from '../lib/formatters';
import toast from 'react-hot-toast';

export function useRevenues(date: Date) {
  const [revenue, setRevenue] = useState<DailyRevenue | null>(null);
  const [loading, setLoading] = useState(true);

  const dateStr = toISODate(date);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('daily_revenues')
      .select('*')
      .eq('date', dateStr)
      .maybeSingle();

    if (error) {
      toast.error('Errore caricamento incasso');
      console.error(error);
    }
    setRevenue(data);
    setLoading(false);
  }, [dateStr]);

  useEffect(() => { fetch(); }, [fetch]);

  const upsert = async (cash: number, pos: number, note: string | null) => {
    const { error } = await supabase
      .from('daily_revenues')
      .upsert(
        { date: dateStr, cash_amount: cash, pos_amount: pos, note },
        { onConflict: 'date' }
      );

    if (error) {
      toast.error('Errore salvataggio');
      console.error(error);
      return false;
    }
    toast.success('Incasso salvato!');
    await fetch();
    return true;
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('daily_revenues').delete().eq('id', id);
    if (error) {
      toast.error('Errore eliminazione');
      return false;
    }
    toast.success('Incasso eliminato');
    await fetch();
    return true;
  };

  return { revenue, loading, upsert, remove };
}
