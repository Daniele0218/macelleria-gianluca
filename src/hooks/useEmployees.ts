import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Employee } from '../lib/types';
import toast from 'react-hot-toast';

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at');

    if (error) {
      toast.error('Errore caricamento operai');
      console.error(error);
    }
    setEmployees((data || []) as Employee[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const active = employees.filter((e) => e.is_active);
  const inactive = employees.filter((e) => !e.is_active);

  const add = async (name: string, salary: number) => {
    const { error } = await supabase.from('employees').insert({ name, monthly_salary: salary });
    if (error) {
      if (error.code === '23505') toast.error('Operaio con questo nome esiste già');
      else toast.error('Errore aggiunta operaio');
      return false;
    }
    toast.success('Operaio aggiunto!');
    await fetch();
    return true;
  };

  const updateSalary = async (id: string, salary: number) => {
    const { error } = await supabase.from('employees').update({ monthly_salary: salary }).eq('id', id);
    if (error) {
      toast.error('Errore aggiornamento stipendio');
      return false;
    }
    toast.success('Stipendio aggiornato');
    await fetch();
    return true;
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase.from('employees').update({ is_active: isActive }).eq('id', id);
    if (error) {
      toast.error('Errore aggiornamento stato');
      return false;
    }
    toast.success(isActive ? 'Operaio riattivato' : 'Operaio disattivato');
    await fetch();
    return true;
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (error) {
      toast.error('Errore eliminazione operaio');
      return false;
    }
    toast.success('Operaio eliminato');
    await fetch();
    return true;
  };

  return { employees, active, inactive, loading, add, updateSalary, toggleActive, remove };
}
