import { useState } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import DateNav from '../components/ui/DateNav';
import ExpenseForm from '../components/expenses/ExpenseForm';
import ExpenseList from '../components/expenses/ExpenseList';

export default function ExpensesPage() {
  const [date, setDate] = useState(new Date());
  const { expenses, loading, add, remove } = useExpenses(date);

  return (
    <div>
      <DateNav date={date} onChange={setDate} label="Spese del giorno" />
      <div className="p-4 space-y-4">
        <ExpenseForm onAdd={add} />
        <ExpenseList expenses={expenses} loading={loading} onDelete={remove} />
      </div>
    </div>
  );
}
