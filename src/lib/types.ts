export interface DailyRevenue {
  id: string;
  date: string;
  cash_amount: number;
  pos_amount: number;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  subcategory: string;
  amount: number;
  amount_net: number;
  vat_rate: number;
  note: string | null;
  created_at: string;
}

export interface Employee {
  id: string;
  name: string;
  monthly_salary: number;
  is_active: boolean;
  created_at: string;
}

export interface SalaryPayment {
  id: string;
  employee_id: string;
  month: string;
  type: 'stipendio' | 'inps' | 'tfr';
  amount: number;
  note: string | null;
  created_at: string;
}

export type ExpenseCategory =
  | 'fornitori_carne'
  | 'macellazione'
  | 'gestione'
  | 'salumi'
  | 'varie';

export type PeriodView = 'day' | 'week' | 'month';

export interface DashboardSummary {
  totalRevenue: number;
  totalCash: number;
  totalPos: number;
  totalExpenses: number;
  totalSalaries: number;
  margin: number;
}

export interface SupplierSummary {
  name: string;
  category: ExpenseCategory;
  total: number;
  count: number;
}
