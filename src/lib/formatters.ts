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

export function formatDateLong(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, "EEEE d MMMM yyyy", { locale: it });
}

export function formatDateShort(date: Date): string {
  return format(date, 'dd/MM/yyyy');
}

export function formatMonth(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMMM yyyy', { locale: it });
}

export function formatDayName(date: Date): string {
  return format(date, 'EEE', { locale: it });
}

export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function firstOfMonth(date: Date): string {
  return format(new Date(date.getFullYear(), date.getMonth(), 1), 'yyyy-MM-dd');
}

export function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getSaturday(monday: Date): Date {
  const d = new Date(monday);
  d.setDate(monday.getDate() + 5);
  return d;
}

export function getWeekDays(monday: Date): Date[] {
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}
