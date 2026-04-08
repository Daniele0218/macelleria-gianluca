import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { ExpenseCategory } from '../lib/types';
import type { CategoryConfig } from '../lib/constants';
import { CATEGORIES } from '../lib/constants';
import toast from 'react-hot-toast';

export interface CustomOption {
  id: string;
  type: 'category' | 'subcategory';
  category_key: string | null;
  name: string;
  icon: string;
  vat_rate: number;
}

export function useCustomOptions() {
  const [options, setOptions] = useState<CustomOption[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data, error } = await supabase
      .from('custom_expense_options')
      .select('*')
      .order('created_at');
    if (error) console.error(error);
    setOptions((data || []) as CustomOption[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  // Get all categories: hardcoded + custom
  const getAllCategories = (): CategoryConfig[] => {
    const customCats = options
      .filter((o) => o.type === 'category')
      .map((o): CategoryConfig => ({
        key: `custom_${o.id}` as ExpenseCategory,
        label: o.name,
        icon: o.icon,
        vatRate: o.vat_rate,
        subcategories: options
          .filter((s) => s.type === 'subcategory' && s.category_key === `custom_${o.id}`)
          .map((s) => s.name),
        freeText: true,
      }));
    return [...CATEGORIES, ...customCats];
  };

  // Get subcategories for a category: hardcoded + custom
  const getSubcategoriesFor = (categoryKey: string): string[] => {
    const hardcoded = CATEGORIES.find((c) => c.key === categoryKey);
    const hardcodedSubs = hardcoded?.subcategories || [];
    const customSubs = options
      .filter((o) => o.type === 'subcategory' && o.category_key === categoryKey)
      .map((o) => o.name);
    return [...hardcodedSubs, ...customSubs];
  };

  const addCategory = async (name: string, icon: string, vatRate: number) => {
    const { error } = await supabase.from('custom_expense_options').insert({
      type: 'category',
      name,
      icon,
      vat_rate: vatRate,
    });
    if (error) {
      toast.error('Errore aggiunta categoria');
      return false;
    }
    toast.success('Categoria aggiunta!');
    await fetch();
    return true;
  };

  const addSubcategory = async (categoryKey: string, name: string) => {
    const { error } = await supabase.from('custom_expense_options').insert({
      type: 'subcategory',
      category_key: categoryKey,
      name,
    });
    if (error) {
      toast.error('Errore aggiunta sottocategoria');
      return false;
    }
    toast.success('Sottocategoria aggiunta!');
    await fetch();
    return true;
  };

  return { options, loading, getAllCategories, getSubcategoriesFor, addCategory, addSubcategory };
}
