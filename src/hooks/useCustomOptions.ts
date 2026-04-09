import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { ExpenseCategory } from '../lib/types';
import type { CategoryConfig } from '../lib/constants';
import { CATEGORIES } from '../lib/constants';
import toast from 'react-hot-toast';

export interface CustomOption {
  id: string;
  type: 'category' | 'subcategory' | 'hidden_category' | 'hidden_subcategory';
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

  // Hidden sets for fast lookup
  const hiddenCategories = new Set(
    options.filter((o) => o.type === 'hidden_category').map((o) => o.category_key || o.name)
  );
  const hiddenSubcategories = new Set(
    options.filter((o) => o.type === 'hidden_subcategory').map((o) => `${o.category_key}::${o.name}`)
  );

  // Get all categories: hardcoded (not hidden) + custom
  const getAllCategories = (): CategoryConfig[] => {
    const visibleHardcoded = CATEGORIES.filter((c) => !hiddenCategories.has(c.key));
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
    return [...visibleHardcoded, ...customCats];
  };

  // Get subcategories for a category: hardcoded (not hidden) + custom
  const getSubcategoriesFor = (categoryKey: string): string[] => {
    const hardcoded = CATEGORIES.find((c) => c.key === categoryKey);
    const hardcodedSubs = (hardcoded?.subcategories || []).filter(
      (s) => !hiddenSubcategories.has(`${categoryKey}::${s}`)
    );
    const customSubs = options
      .filter((o) => o.type === 'subcategory' && o.category_key === categoryKey)
      .map((o) => o.name);
    return [...hardcodedSubs, ...customSubs];
  };

  const addCategory = async (name: string, icon: string, vatRate: number) => {
    const { error } = await supabase.from('custom_expense_options').insert({
      type: 'category', name, icon, vat_rate: vatRate,
    });
    if (error) { toast.error('Errore aggiunta categoria'); return false; }
    toast.success('Categoria aggiunta!');
    await fetch();
    return true;
  };

  const addSubcategory = async (categoryKey: string, name: string) => {
    const { error } = await supabase.from('custom_expense_options').insert({
      type: 'subcategory', category_key: categoryKey, name,
    });
    if (error) { toast.error('Errore aggiunta sottocategoria'); return false; }
    toast.success('Sottocategoria aggiunta!');
    await fetch();
    return true;
  };

  const removeCategory = async (categoryKey: string) => {
    if (categoryKey.startsWith('custom_')) {
      // Custom category: delete from DB
      const id = categoryKey.replace('custom_', '');
      await supabase.from('custom_expense_options').delete().eq('category_key', categoryKey);
      const { error } = await supabase.from('custom_expense_options').delete().eq('id', id);
      if (error) { toast.error('Errore eliminazione'); return false; }
    } else {
      // Hardcoded category: mark as hidden
      const { error } = await supabase.from('custom_expense_options').insert({
        type: 'hidden_category', category_key: categoryKey, name: categoryKey,
      });
      if (error) { toast.error('Errore eliminazione'); return false; }
    }
    toast.success('Categoria eliminata!');
    await fetch();
    return true;
  };

  const removeSubcategory = async (categoryKey: string, name: string) => {
    // Check if it's a custom subcategory
    const isCustom = options.some(
      (o) => o.type === 'subcategory' && o.category_key === categoryKey && o.name === name
    );
    if (isCustom) {
      // Delete custom subcategory
      const { error } = await supabase
        .from('custom_expense_options')
        .delete()
        .eq('type', 'subcategory')
        .eq('category_key', categoryKey)
        .eq('name', name);
      if (error) { toast.error('Errore eliminazione'); return false; }
    } else {
      // Hide hardcoded subcategory
      const { error } = await supabase.from('custom_expense_options').insert({
        type: 'hidden_subcategory', category_key: categoryKey, name,
      });
      if (error) { toast.error('Errore eliminazione'); return false; }
    }
    toast.success('Sottocategoria eliminata!');
    await fetch();
    return true;
  };

  // Restore a hidden category/subcategory
  const restoreCategory = async (categoryKey: string) => {
    const { error } = await supabase
      .from('custom_expense_options')
      .delete()
      .eq('type', 'hidden_category')
      .eq('category_key', categoryKey);
    if (error) { toast.error('Errore ripristino'); return false; }
    toast.success('Categoria ripristinata!');
    await fetch();
    return true;
  };

  // Any category/subcategory can be deleted
  const canDeleteCategory = (key: string): boolean => !!key;
  const canDeleteSubcategory = (categoryKey: string, name: string): boolean => !!categoryKey && !!name && name !== '__other__' && name !== '__new__';

  // Get hidden categories for restore option
  const getHiddenCategories = (): { key: string; label: string }[] => {
    return CATEGORIES
      .filter((c) => hiddenCategories.has(c.key))
      .map((c) => ({ key: c.key, label: `${c.icon} ${c.label}` }));
  };

  return {
    options, loading, getAllCategories, getSubcategoriesFor,
    addCategory, addSubcategory, removeCategory, removeSubcategory,
    canDeleteCategory, canDeleteSubcategory,
    getHiddenCategories, restoreCategory,
  };
}
