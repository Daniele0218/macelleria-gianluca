import { useState } from 'react';
import { Download, Database } from 'lucide-react';
import Papa from 'papaparse';
import { supabase } from '../../lib/supabase';
import { toISODate, formatDate } from '../../lib/formatters';
import { getCategoryConfig } from '../../lib/constants';
import type { Expense, DailyRevenue } from '../../lib/types';
import Card from '../ui/Card';
import Button from '../ui/Button';

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toCSV(data: Record<string, string | number>[]): string {
  // Standard CSV with comma delimiter — works with Google Sheets and Excel
  return Papa.unparse(data, { delimiter: ',' });
}

export default function ExportData() {
  const [from, setFrom] = useState(() => {
    const d = new Date();
    return toISODate(new Date(d.getFullYear(), d.getMonth(), 1));
  });
  const [to, setTo] = useState(() => toISODate(new Date()));
  const [exporting, setExporting] = useState('');

  const exportSpese = async () => {
    setExporting('spese');
    const { data } = await supabase.from('expenses').select('*').gte('date', from).lte('date', to).order('date');
    const rows = ((data || []) as Expense[]).map((e) => ({
      Data: formatDate(e.date),
      Categoria: getCategoryConfig(e.category).label,
      Sottocategoria: e.subcategory,
      Importo: e.amount,
      'IVA%': e.vat_rate,
      'Importo Netto': e.amount_net,
      Nota: e.note || '',
    }));
    downloadFile(toCSV(rows), `macelleria_spese_${from}_${to}.csv`, 'text/csv;charset=utf-8');
    setExporting('');
  };

  const exportIncassi = async () => {
    setExporting('incassi');
    const { data } = await supabase.from('daily_revenues').select('*').gte('date', from).lte('date', to).order('date');
    const rows = ((data || []) as DailyRevenue[]).map((r) => ({
      Data: formatDate(r.date),
      Cassa: r.cash_amount,
      POS: r.pos_amount,
      Totale: r.cash_amount + r.pos_amount,
    }));
    downloadFile(toCSV(rows), `macelleria_incassi_${from}_${to}.csv`, 'text/csv;charset=utf-8');
    setExporting('');
  };

  const exportFornitori = async () => {
    setExporting('fornitori');
    const { data } = await supabase.from('expenses').select('*').gte('date', from).lte('date', to);
    const map = new Map<string, { total: number; count: number; category: string }>();
    ((data || []) as Expense[]).forEach((e) => {
      const existing = map.get(e.subcategory);
      if (existing) { existing.total += e.amount; existing.count++; }
      else map.set(e.subcategory, { total: e.amount, count: 1, category: e.category });
    });
    const rows = Array.from(map.entries())
      .sort((a, b) => b[1].total - a[1].total)
      .map(([name, v]) => ({
        Fornitore: name,
        Categoria: getCategoryConfig(v.category as Expense['category']).label,
        'Totale Periodo': v.total,
        'N. Movimenti': v.count,
      }));
    downloadFile(toCSV(rows), `macelleria_fornitori_${from}_${to}.csv`, 'text/csv;charset=utf-8');
    setExporting('');
  };

  const exportCompleto = async () => {
    setExporting('completo');
    const [expRes, revRes, salRes] = await Promise.all([
      supabase.from('expenses').select('*').gte('date', from).lte('date', to).order('date'),
      supabase.from('daily_revenues').select('*').gte('date', from).lte('date', to).order('date'),
      supabase.from('salary_payments').select('*, employees(name)').gte('month', from).lte('month', to),
    ]);

    const rows: Record<string, string | number>[] = [];

    ((revRes.data || []) as DailyRevenue[]).forEach((r) => {
      rows.push({ Data: formatDate(r.date), Tipo: 'Entrata', Categoria: 'Incasso Cassa', Descrizione: 'Contanti', Importo: r.cash_amount });
      rows.push({ Data: formatDate(r.date), Tipo: 'Entrata', Categoria: 'Incasso POS', Descrizione: 'Carte', Importo: r.pos_amount });
    });

    ((expRes.data || []) as Expense[]).forEach((e) => {
      rows.push({
        Data: formatDate(e.date), Tipo: 'Uscita',
        Categoria: getCategoryConfig(e.category).label,
        Descrizione: e.subcategory,
        Importo: e.amount,
      });
    });

    interface SalaryRow { amount: number; month: string; type: string; employees: { name: string } | null }
    ((salRes.data || []) as SalaryRow[]).forEach((s) => {
      rows.push({
        Data: formatDate(s.month), Tipo: 'Uscita',
        Categoria: 'Stipendi',
        Descrizione: `${s.employees?.name || '?'} - ${s.type}`,
        Importo: s.amount,
      });
    });

    downloadFile(toCSV(rows), `macelleria_completo_${from}_${to}.csv`, 'text/csv;charset=utf-8');
    setExporting('');
  };

  const exportBackup = async () => {
    setExporting('backup');
    const [rev, exp, emp, sal] = await Promise.all([
      supabase.from('daily_revenues').select('*'),
      supabase.from('expenses').select('*'),
      supabase.from('employees').select('*'),
      supabase.from('salary_payments').select('*'),
    ]);
    const backup = {
      exported_at: new Date().toISOString(),
      daily_revenues: rev.data || [],
      expenses: exp.data || [],
      employees: emp.data || [],
      salary_payments: sal.data || [],
    };
    downloadFile(JSON.stringify(backup, null, 2), `macelleria_backup_${toISODate(new Date())}.json`, 'application/json');
    setExporting('');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-[var(--color-text)]">Export Dati</h3>

      {/* Date range */}
      <Card className="p-4">
        <p className="text-[11px] uppercase tracking-wider font-semibold text-[var(--color-subdued)] mb-2">Periodo</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-[var(--color-subdued)]">Da</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text)] text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-[var(--color-subdued)]">A</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text)] text-sm"
            />
          </div>
        </div>
      </Card>

      {/* Export buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Button variant="secondary" onClick={exportSpese} loading={exporting === 'spese'} fullWidth>
          <Download size={16} /> Spese (CSV)
        </Button>
        <Button variant="secondary" onClick={exportIncassi} loading={exporting === 'incassi'} fullWidth>
          <Download size={16} /> Incassi (CSV)
        </Button>
        <Button variant="secondary" onClick={exportFornitori} loading={exporting === 'fornitori'} fullWidth>
          <Download size={16} /> Fornitori (CSV)
        </Button>
        <Button variant="secondary" onClick={exportCompleto} loading={exporting === 'completo'} fullWidth>
          <Download size={16} /> Report Completo
        </Button>
      </div>

      <Button variant="secondary" onClick={exportBackup} loading={exporting === 'backup'} fullWidth>
        <Database size={16} /> Backup Completo (JSON)
      </Button>
    </div>
  );
}
