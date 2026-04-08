import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { DashboardSummary } from '../../lib/types';
import { formatCurrency } from '../../lib/formatters';

interface Props {
  summary: DashboardSummary;
}

export default function SummaryCards({ summary }: Props) {
  const marginPositive = summary.margin >= 0;
  const totalOut = summary.totalExpenses + summary.totalSalaries;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* Revenue */}
      <div className="rounded-xl border border-green-200 dark:border-green-800 overflow-hidden">
        <div className="bg-green-50 dark:bg-green-900/20 px-4 py-3">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-green-700 dark:text-green-400">
            Incassi
          </p>
          <p className="text-2xl font-bold text-green-800 dark:text-green-300 mt-1">
            {formatCurrency(summary.totalRevenue)}
          </p>
          <div className="flex gap-3 mt-2 text-xs text-green-600/70 dark:text-green-400/70">
            <span>Cassa: {formatCurrency(summary.totalCash)}</span>
            <span>POS: {formatCurrency(summary.totalPos)}</span>
          </div>
        </div>
      </div>

      {/* Expenses */}
      <div className="rounded-xl border border-red-200 dark:border-red-800 overflow-hidden">
        <div className="bg-red-50 dark:bg-red-900/20 px-4 py-3">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-red-700 dark:text-red-400">
            Uscite Totali
          </p>
          <p className="text-2xl font-bold text-red-800 dark:text-red-300 mt-1">
            {formatCurrency(totalOut)}
          </p>
          <div className="flex flex-col gap-0.5 mt-2 text-xs text-red-600/70 dark:text-red-400/70">
            {summary.totalExpenses > 0 && <span>Spese: {formatCurrency(summary.totalExpenses)}</span>}
            {summary.totalSalaries > 0 && <span>Stipendi: {formatCurrency(summary.totalSalaries)}</span>}
          </div>
        </div>
      </div>

      {/* Margin */}
      <div className={`rounded-xl border overflow-hidden ${marginPositive ? 'border-amber-200 dark:border-amber-800' : 'border-red-300 dark:border-red-700'}`}>
        <div className={`px-4 py-3 ${marginPositive ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
          <p className={`text-[11px] uppercase tracking-wider font-semibold ${marginPositive ? 'text-amber-700 dark:text-amber-400' : 'text-red-700 dark:text-red-400'}`}>
            Margine
          </p>
          <div className="flex items-center gap-2 mt-1">
            {marginPositive ? (
              summary.margin > 0 ? <TrendingUp size={20} className="text-green-600" /> : <Minus size={20} className="text-amber-600" />
            ) : (
              <TrendingDown size={20} className="text-red-600" />
            )}
            <p className={`text-2xl font-bold ${marginPositive ? 'text-amber-900 dark:text-amber-200' : 'text-red-800 dark:text-red-300'}`}>
              {formatCurrency(summary.margin)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
