import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { ExpenseCategory } from '../../lib/types';
import { CATEGORIES, getCategoryConfig, getVatRate } from '../../lib/constants';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Input from '../ui/Input';

interface Props {
  onAdd: (data: {
    category: ExpenseCategory;
    subcategory: string;
    amount: number;
    vatRate?: number;
    note?: string | null;
  }) => Promise<boolean>;
}

export default function ExpenseForm({ onAdd }: Props) {
  const [category, setCategory] = useState<ExpenseCategory | ''>('');
  const [subcategory, setSubcategory] = useState('');
  const [freeText, setFreeText] = useState('');
  const [amount, setAmount] = useState('');
  const [vatRate, setVatRate] = useState<number>(22);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const config = category ? getCategoryConfig(category) : null;

  const handleCategoryChange = (value: string) => {
    const cat = value as ExpenseCategory;
    setCategory(cat);
    setSubcategory('');
    setFreeText('');
    if (cat) {
      setVatRate(getVatRate(cat));
    }
  };

  // Determine the subcategory value to submit
  const getSubcategoryValue = (): string => {
    if (!config) return '';
    // If there's a dropdown and user selected something
    if (config.subcategories.length > 0 && subcategory && subcategory !== '__other__') {
      return subcategory;
    }
    // If freeText is filled (for freeText categories or "Altro" option)
    if (freeText.trim()) {
      return freeText.trim();
    }
    // If category has no subcategories and no freeText, use category label
    if (config.subcategories.length === 0 && !config.freeText) {
      return config.label;
    }
    // If user selected category with subcategories but didn't pick one, use category label
    if (config.subcategories.length > 0 && !subcategory) {
      return config.label;
    }
    return '';
  };

  const canSubmit = !!category && !!amount && parseFloat(amount) > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const sub = getSubcategoryValue();
    const amt = parseFloat(amount);

    setSaving(true);
    const ok = await onAdd({
      category: category as ExpenseCategory,
      subcategory: sub || config!.label,
      amount: amt,
      vatRate,
      note: note.trim() || null,
    });
    if (ok) {
      setSubcategory('');
      setFreeText('');
      setAmount('');
      setNote('');
    }
    setSaving(false);
  };

  const categoryOptions = CATEGORIES.map((c) => ({
    value: c.key,
    label: `${c.icon} ${c.label}`,
  }));

  const subcategoryOptions = config?.subcategories.map((s) => ({
    value: s,
    label: s,
  })) || [];

  const showFreeText = config?.freeText;
  const showSubDropdown = config && config.subcategories.length > 0;

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">Nuova Spesa</h3>
      <div className="space-y-3">
        <Select
          label="Categoria"
          options={categoryOptions}
          placeholder="Seleziona categoria..."
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
        />

        {showSubDropdown && (
          <Select
            label="Sottocategoria"
            options={[
              ...subcategoryOptions,
              ...(showFreeText ? [{ value: '__other__', label: '+ Altro...' }] : []),
            ]}
            placeholder="Seleziona..."
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
          />
        )}

        {showFreeText && (!showSubDropdown || subcategory === '__other__') && (
          <Input
            label={showSubDropdown ? 'Specifica' : 'Descrizione'}
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            placeholder="Es: nome fornitore..."
          />
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Importo"
            prefix="€"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0,00"
          />
          <div className="space-y-1.5">
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-[var(--color-subdued)]">
              IVA
            </label>
            <div className="flex rounded-lg border border-[var(--color-border)] overflow-hidden h-[46px]">
              <button
                type="button"
                onClick={() => setVatRate(10)}
                className={`flex-1 text-sm font-semibold transition-colors ${
                  vatRate === 10
                    ? 'bg-green-600 text-white'
                    : 'bg-[var(--color-card)] text-[var(--color-subdued)]'
                }`}
              >
                10%
              </button>
              <button
                type="button"
                onClick={() => setVatRate(22)}
                className={`flex-1 text-sm font-semibold transition-colors ${
                  vatRate === 22
                    ? 'bg-blue-600 text-white'
                    : 'bg-[var(--color-card)] text-[var(--color-subdued)]'
                }`}
              >
                22%
              </button>
            </div>
          </div>
        </div>

        <Input
          label="Nota"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Nota opzionale..."
        />

        <Button
          onClick={handleSubmit}
          loading={saving}
          fullWidth
          disabled={!canSubmit}
        >
          <Plus size={18} /> Aggiungi Spesa
        </Button>
      </div>
    </Card>
  );
}
