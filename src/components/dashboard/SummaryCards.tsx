import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { DashboardSummary } from '../../lib/types';
import { formatCurrency } from '../../lib/formatters';
import Card from '../ui/Card';

interface Props {
  summary: DashboardSummary;
}

export default function SummaryCards({ summary }: Props) {
  const marginPositive = summary.margin >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* Revenue */}
      <Card className="p-4" gradient="linear-gradient(135deg, #F0FDF4, var(--color-card))">
        <p className="text-[11px] uppercase tracking-wider font-semibold text-green-700 dark:text-green-400">
          Incassi
        </p>
        <p className="text-2xl font-bold text-green-700 dark:text-green-400 mt-1">
          {formatCurrency(summary.totalRevenue)}
        </p>
        <div className="flex gap-3 mt-2 text-xs text-[var(--color-subdued)]">
          <span>Cassa: {formatCurrency(summary.totalCash)}</span>
          <span>POS: {formatCurrency(summary.totalPos)}</span>
        </div>
      </Card>

      {/* Expenses */}
      <Card className="p-4" gradient="linear-gradient(135deg, #FEF2F2, var(--color-card))">
        <p className="text-[11px] uppercase tracking-wider font-semibold text-red-700 dark:text-red-400">
          Spese
        </p>
        <p className="text-2xl font-bold text-red-700 dark:text-red-400 mt-1">
          {formatCurrency(summary.totalExpenses + summary.totalSalaries)}
        </p>
        {summary.totalSalaries > 0 && (
          <p className="text-xs text-[var(--color-subdued)] mt-2">
            di cui stipendi: {formatCurrency(summary.totalSalaries)}
          </p>
        )}
      </Card>

      {/* Margin */}
      <Card
        className="p-4"
        gradient={marginPositive
          ? 'linear-gradient(135deg, #FEF3C7, #FDE68A)'
          : 'linear-gradient(135deg, #FEF2F2, #FECACA)'
        }
      >
        <p className={`text-[11px] uppercase tracking-wider font-semibold ${marginPositive ? 'text-amber-700' : 'text-red-700'}`}>
          Margine
        </p>
        <div className="flex items-center gap-2 mt-1">
          {marginPositive ? (
            summary.margin > 0 ? <TrendingUp size={20} className="text-green-600" /> : <Minus size={20} className="text-amber-600" />
          ) : (
            <TrendingDown size={20} className="text-red-600" />
          )}
          <p className={`text-2xl font-bold ${marginPositive ? 'text-amber-900' : 'text-red-700'}`}>
            {formatCurrency(summary.margin)}
          </p>
        </div>
      </Card>
    </div>
  );
}
