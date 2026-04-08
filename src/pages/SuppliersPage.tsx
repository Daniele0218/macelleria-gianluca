import { useState } from 'react';
import SupplierList from '../components/suppliers/SupplierList';
import SupplierDetail from '../components/suppliers/SupplierDetail';

export default function SuppliersPage() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="p-4 overflow-hidden">
      <h2 className="text-lg font-bold text-[var(--color-text)] mb-4">Fornitori</h2>
      {selected ? (
        <SupplierDetail supplier={selected} onBack={() => setSelected(null)} />
      ) : (
        <SupplierList onSelect={setSelected} />
      )}
    </div>
  );
}
