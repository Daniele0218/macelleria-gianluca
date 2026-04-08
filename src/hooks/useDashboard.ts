import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { DashboardSummary, Expense, DailyRevenue } from '../lib/types';
import { toISODate, getMonday, getSaturday, getWeekDays } from '../lib/formatters';
import toast from 'react-hot-toast';

export interface DailyData {
  summary: DashboardSummary;
  expenses: Expense[];
  revenue: DailyRevenue | null;
}

export interface WeeklyData {
  summary: DashboardSummary;
  dailyRevenues: { date: string; cash: number; pos: number; dayName: string }[];
  expensesByCategory: { category: string; label: string; total: number; color: string }[];
}

export interface MonthlyData {
  summary: DashboardSummary;
  weeklyRevenues: { week: string; total: number }[];
  expensesByCategory: { category: string; label: string; total: number; color: string }[];
}

import { CATEGORIES, CATEGORY_COLORS } from '../lib/constants';
import { formatDayName } from '../lib/formatters';

export function useDashboard() {
  const [loading, setLoading] = useState(false);

  const fetchDaily = async (date: Date): Promise<DailyData> => {
    setLoading(true);
    const dateStr = toISODate(date);
    // Salary payments are stored as first-of-month, so query the month this date belongs to
    const monthFirst = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;

    const [revRes, expRes, salRes] = await Promise.all([
      supabase.from('daily_revenues').select('*').eq('date', dateStr).maybeSingle(),
      supabase.from('expenses').select('*').eq('date', dateStr).order('created_at', { ascending: false }),
      supabase.from('salary_payments').select('amount').eq('month', monthFirst),
    ]);

    if (revRes.error) toast.error('Errore caricamento incassi');
    if (expRes.error) toast.error('Errore caricamento spese');

    const revenue = revRes.data;
    const expenses = (expRes.data || []) as Expense[];
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const totalSalaries = (salRes.data || []).reduce((s, e) => s + e.amount, 0);
    const totalRevenue = (revenue?.cash_amount || 0) + (revenue?.pos_amount || 0);

    setLoading(false);
    return {
      summary: {
        totalRevenue,
        totalCash: revenue?.cash_amount || 0,
        totalPos: revenue?.pos_amount || 0,
        totalExpenses,
        totalSalaries,
        margin: totalRevenue - totalExpenses - totalSalaries,
      },
      expenses,
      revenue,
    };
  };

  const fetchWeekly = async (date: Date): Promise<WeeklyData> => {
    setLoading(true);
    const monday = getMonday(date);
    const saturday = getSaturday(monday);
    const from = toISODate(monday);
    const to = toISODate(saturday);

    const [revRes, expRes, salRes] = await Promise.all([
      supabase.from('daily_revenues').select('*').gte('date', from).lte('date', to).order('date'),
      supabase.from('expenses').select('*').gte('date', from).lte('date', to),
      // Salary payments are stored as first-of-month — query the month(s) this week belongs to
      supabase.from('salary_payments').select('amount').eq('month', `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-01`),
    ]);

    const revenues = (revRes.data || []) as DailyRevenue[];
    const expenses = (expRes.data || []) as Expense[];
    const salaries = salRes.data || [];

    const days = getWeekDays(monday);
    const dailyRevenues = days.map((d) => {
      const ds = toISODate(d);
      const rev = revenues.find((r) => r.date === ds);
      return {
        date: ds,
        cash: rev?.cash_amount || 0,
        pos: rev?.pos_amount || 0,
        dayName: formatDayName(d),
      };
    });

    const catTotals = new Map<string, number>();
    expenses.forEach((e) => {
      catTotals.set(e.category, (catTotals.get(e.category) || 0) + e.amount);
    });
    const expensesByCategory = CATEGORIES.filter((c) => catTotals.has(c.key)).map((c) => ({
      category: c.key,
      label: c.label,
      total: catTotals.get(c.key) || 0,
      color: CATEGORY_COLORS[c.key],
    }));

    const totalRevenue = dailyRevenues.reduce((s, d) => s + d.cash + d.pos, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const totalSalaries = salaries.reduce((s, e) => s + e.amount, 0);

    setLoading(false);
    return {
      summary: {
        totalRevenue,
        totalCash: dailyRevenues.reduce((s, d) => s + d.cash, 0),
        totalPos: dailyRevenues.reduce((s, d) => s + d.pos, 0),
        totalExpenses,
        totalSalaries,
        margin: totalRevenue - totalExpenses - totalSalaries,
      },
      dailyRevenues,
      expensesByCategory,
    };
  };

  const fetchMonthly = async (year: number, month: number): Promise<MonthlyData> => {
    setLoading(true);
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const from = toISODate(firstDay);
    const to = toISODate(lastDay);
    const monthFirst = `${year}-${String(month + 1).padStart(2, '0')}-01`;

    const [revRes, expRes, salRes] = await Promise.all([
      supabase.from('daily_revenues').select('*').gte('date', from).lte('date', to).order('date'),
      supabase.from('expenses').select('*').gte('date', from).lte('date', to),
      supabase.from('salary_payments').select('amount').eq('month', monthFirst),
    ]);

    const revenues = (revRes.data || []) as DailyRevenue[];
    const expenses = (expRes.data || []) as Expense[];
    const salaries = salRes.data || [];

    // Group revenues by week
    const weekMap = new Map<string, number>();
    revenues.forEach((r) => {
      const d = new Date(r.date);
      const mon = getMonday(d);
      const weekLabel = `Sett. ${toISODate(mon).slice(5)}`;
      const total = r.cash_amount + r.pos_amount;
      weekMap.set(weekLabel, (weekMap.get(weekLabel) || 0) + total);
    });
    const weeklyRevenues = Array.from(weekMap.entries()).map(([week, total]) => ({ week, total }));

    const catTotals = new Map<string, number>();
    expenses.forEach((e) => {
      catTotals.set(e.category, (catTotals.get(e.category) || 0) + e.amount);
    });
    const expensesByCategory = CATEGORIES.filter((c) => catTotals.has(c.key)).map((c) => ({
      category: c.key,
      label: c.label,
      total: catTotals.get(c.key) || 0,
      color: CATEGORY_COLORS[c.key],
    }));

    const totalRevenue = revenues.reduce((s, r) => s + r.cash_amount + r.pos_amount, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const totalSalaries = salaries.reduce((s, e) => s + e.amount, 0);

    setLoading(false);
    return {
      summary: {
        totalRevenue,
        totalCash: revenues.reduce((s, r) => s + r.cash_amount, 0),
        totalPos: revenues.reduce((s, r) => s + r.pos_amount, 0),
        totalExpenses,
        totalSalaries,
        margin: totalRevenue - totalExpenses - totalSalaries,
      },
      weeklyRevenues,
      expensesByCategory,
    };
  };

  return { fetchDaily, fetchWeekly, fetchMonthly, loading };
}
