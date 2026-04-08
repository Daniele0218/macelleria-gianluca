import type { ExpenseCategory } from './types';

export interface CategoryConfig {
  key: ExpenseCategory;
  label: string;
  icon: string;
  vatRate: number;
  subcategories: string[];
  freeText: boolean;
}

export const CATEGORIES: CategoryConfig[] = [
  {
    key: 'fornitori_carne',
    label: 'Fornitori Carne',
    icon: '🥩',
    vatRate: 10,
    subcategories: ['Amadori', 'CCM', 'SicilPolli', 'Coincialdi', 'Bruno Alimentare'],
    freeText: false,
  },
  {
    key: 'macellazione',
    label: 'Macellazione',
    icon: '🔪',
    vatRate: 10,
    subcategories: [],
    freeText: true,
  },
  {
    key: 'gestione',
    label: 'Spese Gestione',
    icon: '🏢',
    vatRate: 22,
    subcategories: ['Affitto', 'Luce', 'Gas', 'Acqua', 'Manutenzione', 'Commercialista'],
    freeText: false,
  },
  {
    key: 'salumi',
    label: 'Spese Salumi',
    icon: '🧀',
    vatRate: 10,
    subcategories: ['Troina Salumi'],
    freeText: true,
  },
  {
    key: 'varie',
    label: 'Spese Varie',
    icon: '📦',
    vatRate: 22,
    subcategories: [],
    freeText: true,
  },
];

export const SALARY_TYPES = [
  { key: 'stipendio' as const, label: 'Stipendio' },
  { key: 'inps' as const, label: 'Contributi INPS' },
  { key: 'tfr' as const, label: 'TFR' },
];

export function getCategoryConfig(key: ExpenseCategory): CategoryConfig {
  return CATEGORIES.find((c) => c.key === key)!;
}

export function getVatRate(category: ExpenseCategory): number {
  return getCategoryConfig(category).vatRate;
}

export function calcNetAmount(gross: number, vatRate: number): number {
  return Math.round((gross / (1 + vatRate / 100)) * 100) / 100;
}

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  fornitori_carne: '#16A34A',
  macellazione: '#DC2626',
  gestione: '#2563EB',
  salumi: '#D97706',
  varie: '#8B5CF6',
};
