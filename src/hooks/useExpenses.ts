import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Expense, ExpenseCategory } from '../lib/types';
import { toISODate } from '../lib/formatters';
import { calcNetAmount, getVatRate } from '../lib/constants';
import toast from 'react-hot-toast';

export function useExpenses(date: Date) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const dateStr = toISODate(date);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('date', dateStr)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Errore caricamento spese');
      console.error(error);
    }
    setExpenses(data || []);
    setLoading(false);
  }, [dateStr]);

  useEffect(() => { fetch(); }, [fetch]);

  const add = async (data: {
    category: ExpenseCategory;
    subcategory: string;
    amount: number;
    vatRate?: number;
    note?: string | null;
  }) => {
    const vat = data.vatRate ?? getVatRate(data.category);
    const amountNet = calcNetAmount(data.amount, vat);

    const { error } = await supabase.from('expenses').insert({
      date: dateStr,
      category: data.category,
      subcategory: data.subcategory,
      amount: data.amount,
      amount_net: amountNet,
      vat_rate: vat,
      note: data.note || null,
    });

    if (error) {
      toast.error('Errore aggiunta spesa');
      console.error(error);
      return false;
    }
    toast.success('Spesa aggiunta!');
    await fetch();
    return true;
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) {
      toast.error('Errore eliminazione');
      return false;
    }
    toast.success('Spesa eliminata');
    await fetch();
    return true;
  };

  return { expenses, loading, add, remove, refetch: fetch };
}

export function useExpensesByRange() {
  const [loading, setLoading] = useState(false);

  const fetchRange = async (from: string, to: string): Promise<Expense[]> => {
    setLoading(true);
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .gte('date', from)
      .lte('date', to)
      .order('date', { ascending: false });

    setLoading(false);
    if (error) {
      toast.error('Errore caricamento spese');
      console.error(error);
      return [];
    }
    return data || [];
  };

  return { fetchRange, loading };
}
