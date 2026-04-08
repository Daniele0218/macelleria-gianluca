-- =============================================
-- Macelleria Gianluca — Database Schema
-- =============================================
-- ISTRUZIONI: Copia tutto questo file e incollalo
-- in Supabase > SQL Editor > New query > Run
-- =============================================

-- 1. Incassi Giornalieri
CREATE TABLE daily_revenues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date UNIQUE NOT NULL,
  cash_amount numeric(10,2) NOT NULL DEFAULT 0,
  pos_amount numeric(10,2) NOT NULL DEFAULT 0,
  note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trigger per aggiornare updated_at automaticamente
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

-- 2. Spese
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

-- 3. Operai
CREATE TABLE employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  monthly_salary numeric(10,2) NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Operai precaricati
INSERT INTO employees (name, monthly_salary, is_active) VALUES
  ('Gianluca', 0, true),
  ('Giacomo', 0, true),
  ('Aurora', 0, true);

-- 4. Pagamenti Stipendi
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

-- 5. Sicurezza: RLS aperto (app privata senza autenticazione)
ALTER TABLE daily_revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Accesso completo daily_revenues" ON daily_revenues FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Accesso completo expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Accesso completo employees" ON employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Accesso completo salary_payments" ON salary_payments FOR ALL USING (true) WITH CHECK (true);
