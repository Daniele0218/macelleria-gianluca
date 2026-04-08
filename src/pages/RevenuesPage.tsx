import { useState } from 'react';
import { useRevenues } from '../hooks/useRevenues';
import DateNav from '../components/ui/DateNav';
import RevenueForm from '../components/revenues/RevenueForm';

export default function RevenuesPage() {
  const [date, setDate] = useState(new Date());
  const { revenue, loading, upsert } = useRevenues(date);

  return (
    <div>
      <DateNav date={date} onChange={setDate} label="Incasso giornaliero" />
      <RevenueForm
        revenue={revenue}
        loading={loading}
        onSave={upsert}
      />
    </div>
  );
}
