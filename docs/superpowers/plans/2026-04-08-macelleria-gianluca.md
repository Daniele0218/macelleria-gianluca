# Macelleria Gianluca — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, production-ready expense management app for a butcher shop, deployable on Vercel with Supabase backend.

**Architecture:** React SPA (Vite + TypeScript) communicating directly with Supabase via client SDK. No custom backend. Mobile-first responsive design with Shopify-inspired warm theme and dark mode toggle. Five main sections: Revenues (home), Expenses, Dashboard, Suppliers, Settings.

**Tech Stack:** React 18, Vite 6, TypeScript 5, TailwindCSS 3, Supabase JS v2, Recharts, Lucide React, date-fns, papaparse, react-hot-toast, react-router-dom v6.

**Design spec:** `docs/superpowers/specs/2026-04-08-macelleria-gianluca-design.md`

**IMPORTANT — Ready for end-user:** The app must be 100% functional after deploy. The end user (Gianluca, non-technical) only does: (1) run schema.sql in Supabase SQL editor, (2) deploy to Vercel with 2 env vars. Everything else must work out of the box.

---

## File Structure

```
macelleria-gianluca/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── .env.example
├── .gitignore
├── schema.sql                         # Supabase DDL + seed data
├── README.md                          # Setup guide for non-technical user
├── vercel.json                        # Vercel config (SPA rewrites)
├── public/
│   └── favicon.svg
├── src/
│   ├── main.tsx                       # React entry point
│   ├── App.tsx                        # Router + ThemeProvider + Toaster
│   ├── lib/
│   │   ├── supabase.ts               # Supabase client init
│   │   ├── types.ts                   # DB row types + app types
│   │   ├── constants.ts              # Categories, subcategories, VAT rates
│   │   └── formatters.ts            # Currency, date, number formatters (Italian)
│   ├── hooks/
│   │   ├── useTheme.ts               # Dark/light mode with localStorage
│   │   ├── useRevenues.ts            # CRUD daily revenues
│   │   ├── useExpenses.ts            # CRUD expenses
│   │   ├── useEmployees.ts           # CRUD employees
│   │   ├── useSalaryPayments.ts      # CRUD salary payments
│   │   └── useDashboard.ts           # Aggregate queries for dashboard
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx          # Shell: sidebar (desktop) + bottom nav (mobile)
│   │   │   ├── BottomNav.tsx          # Mobile bottom tab bar
│   │   │   ├── Sidebar.tsx            # Desktop sidebar
│   │   │   └── ThemeToggle.tsx        # Light/dark switch
│   │   ├── ui/
│   │   │   ├── Card.tsx               # Reusable card with optional colored left border
│   │   │   ├── Button.tsx             # Primary/secondary/danger variants
│   │   │   ├── Input.tsx              # Input with label, euro prefix, validation
│   │   │   ├── Select.tsx             # Dropdown select
│   │   │   ├── DateNav.tsx            # Date selector with prev/next arrows
│   │   │   ├── Modal.tsx              # Confirmation/form modal
│   │   │   ├── EmptyState.tsx         # Empty state placeholder
│   │   │   └── Spinner.tsx            # Loading spinner
│   │   ├── revenues/
│   │   │   └── RevenueForm.tsx        # Cash + POS input + save
│   │   ├── expenses/
│   │   │   ├── ExpenseForm.tsx        # Category-driven expense form
│   │   │   └── ExpenseList.tsx        # Filterable expense list with delete
│   │   ├── dashboard/
│   │   │   ├── PeriodToggle.tsx       # Day/Week/Month toggle buttons
│   │   │   ├── DailyView.tsx          # Daily summary cards + expense breakdown
│   │   │   ├── WeeklyView.tsx         # Bar chart + weekly summary
│   │   │   └── MonthlyView.tsx        # Line chart + pie chart + monthly summary
│   │   ├── suppliers/
│   │   │   ├── SupplierList.tsx       # Ranked supplier list with totals
│   │   │   └── SupplierDetail.tsx     # Single supplier movement list
│   │   └── settings/
│   │       ├── EmployeeManager.tsx    # Add/edit/toggle employees
│   │       ├── SalaryManager.tsx      # Monthly salary/INPS/TFR registration
│   │       └── ExportData.tsx         # CSV + JSON export
│   ├── pages/
│   │   ├── RevenuesPage.tsx           # Home — daily revenue entry
│   │   ├── ExpensesPage.tsx           # Expense entry + list
│   │   ├── DashboardPage.tsx          # Analytics dashboard
│   │   ├── SuppliersPage.tsx          # Supplier overview
│   │   └── SettingsPage.tsx           # Employees, salaries, export, settings
│   └── styles/
│       └── index.css                  # Tailwind directives + CSS custom properties
```

---

## Task 1: Project Scaffolding & Configuration

**Files:**
- Create: `package.json`, `index.html`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`, `.env.example`, `.gitignore`, `vercel.json`, `public/favicon.svg`, `src/main.tsx`, `src/styles/index.css`

- [ ] **Step 1: Initialize Vite project**

```bash
cd /c/Users/danie/OneDrive/Desktop/gianluca
npm create vite@latest . -- --template react-ts
```

Select: React, TypeScript

- [ ] **Step 2: Install all dependencies**

```bash
npm install @supabase/supabase-js react-router-dom recharts lucide-react papaparse date-fns react-hot-toast
npm install -D tailwindcss postcss autoprefixer @types/papaparse
npx tailwindcss init -p
```

- [ ] **Step 3: Configure tailwind.config.js**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#FAF8F5',
          dark: '#1A1A1A',
        },
        card: {
          DEFAULT: '#FFFFFF',
          dark: '#303030',
        },
        border: {
          DEFAULT: '#E7E5E4',
          dark: '#404040',
        },
        header: '#292524',
        subdued: {
          DEFAULT: '#616161',
          dark: '#8C8C8C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 4: Write src/styles/index.css with Tailwind directives and CSS vars**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

@layer base {
  :root {
    --color-surface: #FAF8F5;
    --color-card: #FFFFFF;
    --color-border: #E7E5E4;
    --color-text: #1A1A1A;
    --color-subdued: #616161;
    --color-header: #292524;
    --color-success: #16A34A;
    --color-info: #2563EB;
    --color-danger: #DC2626;
    --color-warning: #D97706;
  }

  .dark {
    --color-surface: #1A1A1A;
    --color-card: #303030;
    --color-border: #404040;
    --color-text: #E3E3E6;
    --color-subdued: #8C8C8C;
    --color-header: #292524;
  }

  body {
    @apply bg-[var(--color-surface)] text-[var(--color-text)] font-sans antialiased;
    transition: background-color 0.2s, color 0.2s;
  }
}
```

- [ ] **Step 5: Create .env.example**

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

- [ ] **Step 6: Update .gitignore**

```
node_modules/
dist/
.env
.env.local
.superpowers/
.DS_Store
*.log
```

- [ ] **Step 7: Create vercel.json for SPA routing**

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

- [ ] **Step 8: Create favicon.svg**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🥩</text></svg>
```

- [ ] **Step 9: Update index.html title and meta**

Set `<title>Macelleria Gianluca</title>` and add viewport meta for mobile.

- [ ] **Step 10: Write minimal src/main.tsx**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 11: Write placeholder App.tsx**

```tsx
export default function App() {
  return <div className="p-4"><h1 className="text-2xl font-bold">Macelleria Gianluca</h1></div>;
}
```

- [ ] **Step 12: Verify dev server starts**

```bash
npm run dev
```

Expected: App runs at localhost:5173 with "Macelleria Gianluca" heading on cream background.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite + React + TypeScript + TailwindCSS project"
```

---

## Task 2: Supabase Schema & Core Lib Files

**Files:**
- Create: `schema.sql`, `src/lib/supabase.ts`, `src/lib/types.ts`, `src/lib/constants.ts`, `src/lib/formatters.ts`

- [ ] **Step 1: Write schema.sql**

```sql
-- Macelleria Gianluca — Database Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New query)

-- 1. Daily Revenues
CREATE TABLE daily_revenues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date UNIQUE NOT NULL,
  cash_amount numeric(10,2) NOT NULL DEFAULT 0,
  pos_amount numeric(10,2) NOT NULL DEFAULT 0,
  note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER daily_revenues_updated_at
  BEFORE UPDATE ON daily_revenues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 2. Expenses
CREATE TABLE expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  category text NOT NULL,
  subcategory text NOT NULL,
  amount numeric(10,2) NOT NULL,
  amount_net numeric(10,2) NOT NULL,
  vat_rate integer NOT NULL DEFAULT 22,
  note text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_category_date ON expenses(category, date);
CREATE INDEX idx_expenses_subcategory_date ON expenses(subcategory, date);

-- 3. Employees
CREATE TABLE employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  monthly_salary numeric(10,2) NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Seed default employees
INSERT INTO employees (name, monthly_salary, is_active) VALUES
  ('Gianluca', 0, true),
  ('Giacomo', 0, true),
  ('Aurora', 0, true);

-- 4. Salary Payments
CREATE TABLE salary_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  month date NOT NULL,
  type text NOT NULL CHECK (type IN ('stipendio', 'inps', 'tfr')),
  amount numeric(10,2) NOT NULL,
  note text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, month, type)
);

CREATE INDEX idx_salary_payments_month ON salary_payments(month);
CREATE INDEX idx_salary_payments_employee ON salary_payments(employee_id);

-- Disable RLS (private app, no auth)
ALTER TABLE daily_revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on daily_revenues" ON daily_revenues FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on employees" ON employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on salary_payments" ON salary_payments FOR ALL USING (true) WITH CHECK (true);
```

- [ ] **Step 2: Write src/lib/supabase.ts**

```ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
```

- [ ] **Step 3: Write src/lib/types.ts**

```ts
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
```

- [ ] **Step 4: Write src/lib/constants.ts**

```ts
import { ExpenseCategory } from './types';

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
  { key: 'stipendio', label: 'Stipendio' },
  { key: 'inps', label: 'Contributi INPS' },
  { key: 'tfr', label: 'TFR' },
] as const;

export function getCategoryConfig(key: ExpenseCategory): CategoryConfig {
  return CATEGORIES.find((c) => c.key === key)!;
}

export function getVatRate(category: ExpenseCategory): number {
  return getCategoryConfig(category).vatRate;
}

export function calcNetAmount(gross: number, vatRate: number): number {
  return Math.round((gross / (1 + vatRate / 100)) * 100) / 100;
}
```

- [ ] **Step 5: Write src/lib/formatters.ts**

```ts
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string): string {
  return format(parseISO(date), 'dd/MM/yyyy');
}

export function formatDateLong(date: string): string {
  return format(parseISO(date), "EEEE d MMMM yyyy", { locale: it });
}

export function formatMonth(date: string): string {
  return format(parseISO(date), 'MMMM yyyy', { locale: it });
}

export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
}

export function getWeekDays(monday: Date): Date[] {
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}
```

- [ ] **Step 6: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 7: Commit**

```bash
git add schema.sql src/lib/
git commit -m "feat: add Supabase schema, types, constants, and formatters"
```

---

## Task 3: Theme System & Layout Components

**Files:**
- Create: `src/hooks/useTheme.ts`, `src/components/layout/ThemeToggle.tsx`, `src/components/layout/BottomNav.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/layout/AppLayout.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write src/hooks/useTheme.ts**

```ts
import { useState, useEffect } from 'react';

export function useTheme() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return { dark, toggle: () => setDark((d) => !d) };
}
```

- [ ] **Step 2: Write src/components/layout/ThemeToggle.tsx**

```tsx
import { Moon, Sun } from 'lucide-react';

interface Props {
  dark: boolean;
  onToggle: () => void;
}

export default function ThemeToggle({ dark, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      className="relative w-12 h-7 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-success)]"
      style={{ backgroundColor: dark ? 'var(--color-success)' : 'var(--color-border)' }}
      aria-label={dark ? 'Passa a modalità chiara' : 'Passa a modalità scura'}
    >
      <span
        className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 flex items-center justify-center"
        style={{ transform: dark ? 'translateX(22px)' : 'translateX(2px)' }}
      >
        {dark ? <Moon size={14} className="text-gray-700" /> : <Sun size={14} className="text-amber-500" />}
      </span>
    </button>
  );
}
```

- [ ] **Step 3: Write src/components/layout/BottomNav.tsx**

```tsx
import { useLocation, useNavigate } from 'react-router-dom';
import { Banknote, ClipboardList, BarChart3, Store, Settings } from 'lucide-react';

const tabs = [
  { path: '/', label: 'Incassi', icon: Banknote },
  { path: '/spese', label: 'Spese', icon: ClipboardList },
  { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { path: '/fornitori', label: 'Fornitori', icon: Store },
  { path: '/altro', label: 'Altro', icon: Settings },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--color-card)] border-t border-[var(--color-border)] md:hidden z-50">
      <div className="flex justify-around items-center h-16 px-1 pb-[env(safe-area-inset-bottom)]">
        {tabs.map(({ path, label, icon: Icon }) => {
          const active = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center justify-center gap-0.5 w-full py-1 transition-colors ${
                active ? 'text-[var(--color-text)]' : 'text-[var(--color-subdued)]'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
              <span className={`text-[10px] ${active ? 'font-semibold' : ''}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
```

- [ ] **Step 4: Write src/components/layout/Sidebar.tsx**

```tsx
import { useLocation, useNavigate } from 'react-router-dom';
import { Banknote, ClipboardList, BarChart3, Store, Users, Download, Settings } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const links = [
  { path: '/', label: 'Incassi', icon: Banknote },
  { path: '/spese', label: 'Spese', icon: ClipboardList },
  { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { path: '/fornitori', label: 'Fornitori', icon: Store },
  { path: '/altro', label: 'Operai', icon: Users },
  { path: '/altro/export', label: 'Export', icon: Download },
  { path: '/altro/impostazioni', label: 'Impostazioni', icon: Settings },
];

interface Props {
  dark: boolean;
  onToggleTheme: () => void;
}

export default function Sidebar({ dark, onToggleTheme }: Props) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="hidden md:flex flex-col w-56 bg-[var(--color-card)] border-r border-[var(--color-border)] h-screen sticky top-0">
      <div className="p-5 border-b border-[var(--color-border)]">
        <h1 className="text-base font-bold text-[var(--color-text)]">🥩 Macelleria</h1>
        <p className="text-xs text-[var(--color-subdued)] mt-0.5">Gianluca</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ path, label, icon: Icon }) => {
          const active = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
          return (
            <button
              key={path + label}
              onClick={() => navigate(path)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-[var(--color-success)]/10 text-[var(--color-success)] font-semibold'
                  : 'text-[var(--color-subdued)] hover:bg-[var(--color-border)]/50'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-[var(--color-border)] flex items-center justify-between">
        <span className="text-xs text-[var(--color-subdued)]">{dark ? 'Scuro' : 'Chiaro'}</span>
        <ThemeToggle dark={dark} onToggle={onToggleTheme} />
      </div>
    </aside>
  );
}
```

- [ ] **Step 5: Write src/components/layout/AppLayout.tsx**

```tsx
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import ThemeToggle from './ThemeToggle';

interface Props {
  dark: boolean;
  onToggleTheme: () => void;
}

export default function AppLayout({ dark, onToggleTheme }: Props) {
  return (
    <div className="flex min-h-screen">
      <Sidebar dark={dark} onToggleTheme={onToggleTheme} />
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="md:hidden bg-header text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-stone-400">Macelleria Gianluca</p>
            <h1 className="text-base font-bold">Gestionale</h1>
          </div>
          <ThemeToggle dark={dark} onToggle={onToggleTheme} />
        </header>
        <main className="flex-1 pb-20 md:pb-0">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Update src/App.tsx with router and layout**

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useTheme } from './hooks/useTheme';
import AppLayout from './components/layout/AppLayout';

function Placeholder({ title }: { title: string }) {
  return <div className="p-6"><h2 className="text-xl font-bold">{title}</h2></div>;
}

export default function App() {
  const { dark, toggle } = useTheme();

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: dark ? '#303030' : '#FFFFFF',
            color: dark ? '#E3E3E6' : '#1A1A1A',
            border: `1px solid ${dark ? '#404040' : '#E7E5E4'}`,
          },
        }}
      />
      <Routes>
        <Route element={<AppLayout dark={dark} onToggleTheme={toggle} />}>
          <Route path="/" element={<Placeholder title="Incassi" />} />
          <Route path="/spese" element={<Placeholder title="Spese" />} />
          <Route path="/dashboard" element={<Placeholder title="Dashboard" />} />
          <Route path="/fornitori" element={<Placeholder title="Fornitori" />} />
          <Route path="/altro" element={<Placeholder title="Altro" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 7: Verify navigation works**

```bash
npm run dev
```

Expected: App shows with warm cream background, dark header on mobile, sidebar on desktop. All 5 nav tabs work. Theme toggle switches light/dark. Bottom nav visible on mobile only.

- [ ] **Step 8: Commit**

```bash
git add src/
git commit -m "feat: add theme system, layout shell, and navigation (mobile + desktop)"
```

---

## Task 4: UI Components Library

**Files:**
- Create: `src/components/ui/Card.tsx`, `src/components/ui/Button.tsx`, `src/components/ui/Input.tsx`, `src/components/ui/Select.tsx`, `src/components/ui/DateNav.tsx`, `src/components/ui/Modal.tsx`, `src/components/ui/EmptyState.tsx`, `src/components/ui/Spinner.tsx`

- [ ] **Step 1: Write all UI components**

Each component follows the warm Shopify theme. All use CSS variables for dark mode support. See design spec for exact colors. Components:

- **Card.tsx**: Wrapper with `bg-[var(--color-card)]`, optional `borderColor` prop for left accent. Rounded-xl, border.
- **Button.tsx**: Variants — `primary` (bg-header text-white / dark: bg-white text-black), `secondary` (bg-transparent border), `danger` (bg-red-600 text-white). Min height 44px for touch. Loading state with spinner.
- **Input.tsx**: Label + input. Optional `prefix` prop (for "€"). Error state with red border. Uses CSS var colors.
- **Select.tsx**: Label + native select dropdown. Same styling as Input.
- **DateNav.tsx**: Shows formatted date in center, "← Ieri" / "Domani →" buttons on sides. Props: `date: Date`, `onChange: (date: Date) => void`. Uses `addDays` from date-fns.
- **Modal.tsx**: Overlay + centered card. Props: `open`, `onClose`, `title`, `children`, `actions`. Closes on backdrop click. Animates in with opacity + scale.
- **EmptyState.tsx**: Centered text with icon. Props: `icon`, `title`, `description`.
- **Spinner.tsx**: Simple CSS spinner centered in container.

Each file should be self-contained, ~30-80 lines. Full code must be written — no placeholders.

- [ ] **Step 2: Verify components render**

Create a temporary test route or modify placeholder page to render each component. Verify they look correct in both light and dark mode.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/
git commit -m "feat: add reusable UI component library (Card, Button, Input, Select, DateNav, Modal, EmptyState, Spinner)"
```

---

## Task 5: Revenue CRUD Hook & Revenue Page

**Files:**
- Create: `src/hooks/useRevenues.ts`, `src/components/revenues/RevenueForm.tsx`, `src/pages/RevenuesPage.tsx`
- Modify: `src/App.tsx` (replace placeholder route)

- [ ] **Step 1: Write src/hooks/useRevenues.ts**

```ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { DailyRevenue } from '../lib/types';
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
```

- [ ] **Step 2: Write src/components/revenues/RevenueForm.tsx**

Full form component with:
- Two large input fields for cash and POS amounts (€ prefix, numeric)
- Auto-calculated total displayed in gold gradient card
- Note text field (optional)
- Save button (calls upsert)
- If revenue exists for date, pre-fills the values
- Loading state while saving
- Green-tinted card for cash, blue-tinted card for POS, gold card for total
- All touch-friendly (44px+ tap targets)

- [ ] **Step 3: Write src/pages/RevenuesPage.tsx**

Page with DateNav at top, RevenueForm below. Passes date state + useRevenues hook data to form.

- [ ] **Step 4: Wire into App.tsx router**

Replace placeholder for `/` route with `<RevenuesPage />`.

- [ ] **Step 5: Test manually**

Navigate to home page. Change dates. Enter amounts. Save. Navigate away and back — values should persist. Test on narrow viewport (375px).

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useRevenues.ts src/components/revenues/ src/pages/RevenuesPage.tsx src/App.tsx
git commit -m "feat: add revenue entry page with cash/POS form and date navigation"
```

---

## Task 6: Expense CRUD Hook & Expense Page

**Files:**
- Create: `src/hooks/useExpenses.ts`, `src/components/expenses/ExpenseForm.tsx`, `src/components/expenses/ExpenseList.tsx`, `src/pages/ExpensesPage.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write src/hooks/useExpenses.ts**

Hook providing:
- `expenses`: array of Expense for a date range
- `loading`: boolean
- `addExpense(data)`: inserts with calculated amount_net
- `deleteExpense(id)`: deletes with toast feedback
- `fetchByDateRange(from, to)`: for dashboard/export queries
- `fetchByCategory(category, from, to)`: filtered fetch

- [ ] **Step 2: Write src/components/expenses/ExpenseForm.tsx**

Dynamic form:
- Date selector (default today)
- Category dropdown (from CATEGORIES constant)
- When category selected: show subcategory dropdown OR free text, based on `freeText` flag
- Amount input with € prefix
- VAT rate auto-set from category, shown as badge (editable on tap)
- Note field (optional, required for "varie")
- "Aggiungi Spesa" button
- After submit, form resets but keeps date and category for fast entry

- [ ] **Step 3: Write src/components/expenses/ExpenseList.tsx**

List showing expenses for the current date:
- Grouped by category with colored left border
- Each item: subcategory, amount, note (truncated)
- Delete button (trash icon) → confirmation Modal
- Category filter chips at top
- Search bar for subcategory/note text
- EmptyState when no expenses

- [ ] **Step 4: Write src/pages/ExpensesPage.tsx**

Page layout: ExpenseForm at top, ExpenseList below. Shared date state. Filter state managed here.

- [ ] **Step 5: Wire into App.tsx, test manually**

Test: add expenses for different categories, check subcategory dynamic behavior, delete an expense, filter by category, search.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useExpenses.ts src/components/expenses/ src/pages/ExpensesPage.tsx src/App.tsx
git commit -m "feat: add expense entry page with category-driven form, list, filters, and delete"
```

---

## Task 7: Dashboard — Daily, Weekly, Monthly Views

**Files:**
- Create: `src/hooks/useDashboard.ts`, `src/components/dashboard/PeriodToggle.tsx`, `src/components/dashboard/DailyView.tsx`, `src/components/dashboard/WeeklyView.tsx`, `src/components/dashboard/MonthlyView.tsx`, `src/pages/DashboardPage.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write src/hooks/useDashboard.ts**

Aggregation hook providing:
- `fetchDaily(date)`: returns DashboardSummary + expense breakdown by category + revenue split
- `fetchWeekly(monday)`: returns per-day revenue array (for bar chart), total expenses by category, weekly DashboardSummary
- `fetchMonthly(year, month)`: returns per-week revenue (for line chart), expense distribution (for pie chart), monthly DashboardSummary, salary totals by employee

Queries combine `daily_revenues`, `expenses`, and `salary_payments` tables.

- [ ] **Step 2: Write PeriodToggle.tsx**

3 buttons: Giorno / Settimana / Mese. Active button has bg-header text-white (light) or bg-white text-black (dark). Props: `value: PeriodView`, `onChange`.

- [ ] **Step 3: Write DailyView.tsx**

- 3 summary cards (income green, expense red, margin green/red)
- Revenue breakdown: cash vs POS with bar visualization
- Expense list grouped by category with amounts

- [ ] **Step 4: Write WeeklyView.tsx**

- Week navigation (prev/next arrows)
- Recharts BarChart: stacked bars per day (cash green, POS blue), 6 days mon-sat
- Expense table by category with totals
- 3 summary cards (total income, total expenses, weekly profit)
- Cash vs POS percentage split

- [ ] **Step 5: Write MonthlyView.tsx**

- Month navigation (prev/next arrows)
- Recharts LineChart: weekly revenue trend
- Recharts PieChart: expense distribution by category
- Summary cards: gross revenue, total expenses, net profit
- Salary detail per employee (if any)

- [ ] **Step 6: Write DashboardPage.tsx**

PeriodToggle at top, renders DailyView/WeeklyView/MonthlyView based on selection. Date navigation per each view. Default to weekly view.

- [ ] **Step 7: Wire into router, test with sample data**

Add sample data via Supabase or app, verify all 3 views render correctly. Check charts are responsive on mobile.

- [ ] **Step 8: Commit**

```bash
git add src/hooks/useDashboard.ts src/components/dashboard/ src/pages/DashboardPage.tsx src/App.tsx
git commit -m "feat: add dashboard with daily/weekly/monthly views, charts, and analytics"
```

---

## Task 8: Suppliers Page

**Files:**
- Create: `src/components/suppliers/SupplierList.tsx`, `src/components/suppliers/SupplierDetail.tsx`, `src/pages/SuppliersPage.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write SupplierList.tsx**

- Fetches expenses, groups by subcategory (unique supplier names)
- Sorted by total amount descending
- Period filter: "Questa settimana" / "Questo mese" / custom range
- Total card at top
- Each supplier row: name, category badge, total amount, number of transactions
- Click → shows SupplierDetail

- [ ] **Step 2: Write SupplierDetail.tsx**

- Back button
- Supplier name + total in header
- List of all movements: date, amount, note
- Sorted by date descending

- [ ] **Step 3: Write SuppliersPage.tsx**

Manages view state (list vs detail). Renders either SupplierList or SupplierDetail.

- [ ] **Step 4: Wire into router, test**

Add expenses for different suppliers, verify supplier list groups correctly, totals are accurate, detail view shows correct movements.

- [ ] **Step 5: Commit**

```bash
git add src/components/suppliers/ src/pages/SuppliersPage.tsx src/App.tsx
git commit -m "feat: add supplier overview page with totals and movement detail"
```

---

## Task 9: Employee Management & Salary Payments

**Files:**
- Create: `src/hooks/useEmployees.ts`, `src/hooks/useSalaryPayments.ts`, `src/components/settings/EmployeeManager.tsx`, `src/components/settings/SalaryManager.tsx`

- [ ] **Step 1: Write src/hooks/useEmployees.ts**

CRUD hook:
- `employees`: active employees list
- `allEmployees`: including inactive
- `addEmployee(name, salary)`: insert
- `updateSalary(id, salary)`: update monthly_salary
- `toggleActive(id, active)`: toggle is_active
- Toast feedback on all operations

- [ ] **Step 2: Write src/hooks/useSalaryPayments.ts**

CRUD hook:
- `payments`: salary payments for a given month
- `upsertPayment(employeeId, month, type, amount)`: upsert with conflict on (employee_id, month, type)
- `fetchMonthTotal(month)`: total salary expenses for a month
- `deletePayment(id)`: delete

- [ ] **Step 3: Write EmployeeManager.tsx**

- List of employees: name, monthly salary, active toggle
- Inline salary editing (click amount → input → save on blur/enter)
- "Aggiungi Operaio" button → inline form (name + salary)
- Active/inactive toggle switch per employee
- Inactive employees shown in separate "Disattivati" section, dimmed

- [ ] **Step 4: Write SalaryManager.tsx**

- Month selector at top
- For each active employee: card with 3 input fields (Stipendio pre-filled from monthly_salary, INPS, TFR)
- "Registra Pagamenti" button — upserts all payments for the month
- Shows existing payments if already registered (edit mode)
- Total monthly salaries card at bottom

- [ ] **Step 5: Test manually**

Add/edit employees, register salary payments, verify totals appear correctly.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useEmployees.ts src/hooks/useSalaryPayments.ts src/components/settings/
git commit -m "feat: add employee management and monthly salary payment registration"
```

---

## Task 10: Settings Page & Data Export

**Files:**
- Create: `src/components/settings/ExportData.tsx`, `src/pages/SettingsPage.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write src/components/settings/ExportData.tsx**

- Date range picker (from/to)
- 4 export buttons:
  1. "Spese (CSV)" — columns: Data;Categoria;Sottocategoria;Importo;IVA%;Importo Netto;Nota. Separator `;`, UTF-8 BOM for Excel.
  2. "Incassi (CSV)" — columns: Data;Cassa;POS;Totale
  3. "Fornitori (CSV)" — columns: Fornitore;Categoria;Totale Periodo;N. Movimenti
  4. "Report Completo (CSV)" — all expenses + revenues + profit in one file
- "Backup JSON" button — dumps all 4 tables as JSON
- Uses papaparse for CSV generation
- Files download with `macelleria_[type]_[from]_[to].csv` naming

Implementation detail for CSV with Excel compatibility:
```ts
const BOM = '\uFEFF';
const csv = BOM + Papa.unparse(data, { delimiter: ';' });
const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
```

- [ ] **Step 2: Write src/pages/SettingsPage.tsx**

3 sections with vertical tabs or accordion:
1. Operai (EmployeeManager)
2. Stipendi (SalaryManager)
3. Export Dati (ExportData)

Mobile: stacked sections. Desktop: tab navigation within page.

- [ ] **Step 3: Wire into router**

Replace placeholder for `/altro` route with `<SettingsPage />`.

- [ ] **Step 4: Test exports**

Add sample data, export each type, open CSV in Excel — verify columns, separators, Italian number format, accented characters.

- [ ] **Step 5: Commit**

```bash
git add src/components/settings/ExportData.tsx src/pages/SettingsPage.tsx src/App.tsx
git commit -m "feat: add settings page with employee management, salary payments, and data export"
```

---

## Task 11: Polish, Testing & Production Readiness

**Files:**
- Modify: Various components for polish
- Create: `README.md`

- [ ] **Step 1: Use frontend-design skill for UI polish**

Invoke `frontend-design` skill to review and enhance:
- Color consistency across all pages
- Spacing and alignment
- Touch target sizes
- Dark mode consistency
- Empty states for all pages
- Loading skeletons
- Responsive behavior at 375px, 768px, 1024px, 1440px

- [ ] **Step 2: Test all CRUD flows end-to-end**

Checklist:
- [ ] Add revenue for today → saves → persists on reload
- [ ] Navigate dates → loads correct revenue
- [ ] Add expense for each category → correct VAT auto-set
- [ ] Delete expense → confirmation modal → deleted
- [ ] Dashboard daily view → correct totals
- [ ] Dashboard weekly view → bar chart renders, totals match
- [ ] Dashboard monthly view → line + pie charts render
- [ ] Supplier list → correct grouping and totals
- [ ] Supplier detail → correct movements
- [ ] Add/edit employee → persists
- [ ] Toggle employee active/inactive → reflects in UI
- [ ] Register salary payments → persists
- [ ] Export CSV spese → opens in Excel correctly
- [ ] Export CSV incassi → opens in Excel correctly
- [ ] Export CSV fornitori → opens in Excel correctly
- [ ] Export report completo → all data present
- [ ] Backup JSON → valid JSON with all tables
- [ ] Dark mode toggle → all pages look correct
- [ ] Mobile responsive → all pages usable at 375px

- [ ] **Step 3: Write README.md**

```markdown
# Macelleria Gianluca — Gestionale Spese

Gestionale spese per macelleria. Registra incassi giornalieri, spese per categoria,
stipendi operai. Dashboard con grafici e export in CSV/Excel.

## Setup (5 minuti)

### 1. Database (Supabase)

1. Vai su [supabase.com](https://supabase.com) e accedi al tuo progetto
2. Clicca **SQL Editor** nel menu a sinistra
3. Clicca **New query**
4. Copia e incolla TUTTO il contenuto del file `schema.sql`
5. Clicca **Run** (il bottone verde)
6. Dovresti vedere "Success" — le tabelle sono create!

### 2. Deploy (Vercel)

1. Vai su [vercel.com](https://vercel.com) e accedi
2. Clicca **Add New > Project**
3. Importa il repository da GitHub
4. Prima di cliccare Deploy, vai in **Environment Variables** e aggiungi:
   - `VITE_SUPABASE_URL` = `https://kqkgmdoscetlybpwqyqp.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = (la tua anon/publishable key da Supabase > Settings > API)
5. Clicca **Deploy**
6. Attendi 1-2 minuti. Quando vedi "Ready", clicca il link per aprire l'app!

### 3. Usa l'app

- **Incassi**: pagina principale. Inserisci cassa e POS del giorno.
- **Spese**: aggiungi spese per categoria (fornitori, gestione, ecc.)
- **Dashboard**: vedi grafici e riepiloghi giorno/settimana/mese
- **Fornitori**: controlla quanto hai speso per ogni fornitore
- **Altro**: gestisci operai, stipendi, e scarica report in Excel

## Sviluppo locale

\```bash
npm install
cp .env.example .env   # poi inserisci le tue credenziali Supabase
npm run dev
\```
```

Note: Remove the backslashes before the triple backticks — they are only to escape in this plan document.

- [ ] **Step 4: Build and verify production build**

```bash
npm run build
npm run preview
```

Expected: Production build completes without errors. Preview works correctly.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: polish UI, add README, production-ready build"
```

---

## Summary

| Task | What it builds | Dependencies |
|------|---------------|--------------|
| 1 | Project scaffold (Vite + TW + config) | None |
| 2 | DB schema + lib files (types, constants, formatters) | Task 1 |
| 3 | Theme + layout (sidebar, bottom nav, dark mode) | Task 1 |
| 4 | UI component library (Card, Button, Input, etc.) | Task 3 |
| 5 | Revenue page (home — cash + POS entry) | Tasks 2, 4 |
| 6 | Expense page (category form + list + delete) | Tasks 2, 4 |
| 7 | Dashboard (daily/weekly/monthly + charts) | Tasks 5, 6 |
| 8 | Supplier page (totals + detail) | Task 6 |
| 9 | Employee + salary management | Tasks 2, 4 |
| 10 | Settings page + CSV/JSON export | Tasks 6, 9 |
| 11 | Polish, testing, README, production build | All |

**Parallel opportunities:** Tasks 3+2 can run in parallel. Tasks 5+6+9 can run in parallel after 4 is done. Task 7 needs 5+6. Task 8 needs 6.
