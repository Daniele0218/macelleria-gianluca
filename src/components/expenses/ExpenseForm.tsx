import { useState } from 'react';
import { Plus, Trash2, RotateCcw } from 'lucide-react';
import type { ExpenseCategory } from '../../lib/types';
import { useCustomOptions } from '../../hooks/useCustomOptions';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Input from '../ui/Input';
import Modal from '../ui/Modal';

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
  const {
    getAllCategories, getSubcategoriesFor,
    addCategory, addSubcategory,
    removeCategory, removeSubcategory,
    canDeleteCategory, canDeleteSubcategory,
    getHiddenCategories, restoreCategory,
  } = useCustomOptions();
  const allCategories = getAllCategories();
  const hiddenCategories = getHiddenCategories();

  const [category, setCategory] = useState<string>('');
  const [subcategory, setSubcategory] = useState('');
  const [freeText, setFreeText] = useState('');
  const [amount, setAmount] = useState('');
  const [vatRate, setVatRate] = useState<number>(22);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  // Modals
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatVat, setNewCatVat] = useState(22);
  const [showNewSub, setShowNewSub] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [showDeleteCat, setShowDeleteCat] = useState(false);
  const [showDeleteSub, setShowDeleteSub] = useState(false);
  const [showRestore, setShowRestore] = useState(false);

  const config = category ? allCategories.find((c) => c.key === category) : null;

  const handleCategoryChange = (value: string) => {
    if (value === '__new__') { setShowNewCat(true); return; }
    if (value === '__restore__') { setShowRestore(true); return; }
    setCategory(value);
    setSubcategory('');
    setFreeText('');
    if (value) {
      const cat = allCategories.find((c) => c.key === value);
      if (cat) setVatRate(cat.vatRate);
    }
  };

  const handleSubcategoryChange = (value: string) => {
    if (value === '__new__') { setShowNewSub(true); return; }
    setSubcategory(value);
  };

  const getSubcategoryValue = (): string => {
    if (!config) return '';
    if (subcategory && subcategory !== '__other__' && subcategory !== '__new__') return subcategory;
    if (freeText.trim()) return freeText.trim();
    return config.label;
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
    if (ok) { setSubcategory(''); setFreeText(''); setAmount(''); setNote(''); }
    setSaving(false);
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    const ok = await addCategory(newCatName.trim(), '📌', newCatVat);
    if (ok) { setNewCatName(''); setNewCatVat(22); setShowNewCat(false); }
  };

  const handleAddSubcategory = async () => {
    if (!newSubName.trim() || !category) return;
    const ok = await addSubcategory(category, newSubName.trim());
    if (ok) { setSubcategory(newSubName.trim()); setNewSubName(''); setShowNewSub(false); }
  };

  const handleDeleteCategory = async () => {
    if (!category) return;
    const ok = await removeCategory(category);
    if (ok) { setCategory(''); setSubcategory(''); setShowDeleteCat(false); }
  };

  const handleDeleteSubcategory = async () => {
    if (!category || !subcategory) return;
    const ok = await removeSubcategory(category, subcategory);
    if (ok) { setSubcategory(''); setShowDeleteSub(false); }
  };

  const handleRestore = async (key: string) => {
    await restoreCategory(key);
    setShowRestore(false);
  };

  const categoryOptions = [
    ...allCategories.map((c) => ({ value: c.key, label: `${c.icon} ${c.label}` })),
    { value: '__new__', label: '➕ Nuova categoria...' },
    ...(hiddenCategories.length > 0 ? [{ value: '__restore__', label: '🔄 Ripristina categoria...' }] : []),
  ];

  const allSubcategories = category ? getSubcategoriesFor(category) : [];
  const subcategoryOptions = [
    ...allSubcategories.map((s) => ({ value: s, label: s })),
    ...(config?.freeText ? [{ value: '__other__', label: '+ Altro...' }] : []),
    { value: '__new__', label: '➕ Nuova sottocategoria...' },
  ];

  const showSubDropdown = !!config && allSubcategories.length > 0;
  const showFreeText = config?.freeText && (!showSubDropdown || subcategory === '__other__');

  return (
    <>
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">Nuova Spesa</h3>
        <div className="space-y-3">
          {/* Category */}
          <div className="flex items-end gap-2">
            <div className="flex-1 min-w-0">
              <Select
                label="Categoria"
                options={categoryOptions}
                placeholder="Seleziona categoria..."
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
              />
            </div>
            {category && canDeleteCategory(category) && (
              <button
                onClick={() => setShowDeleteCat(true)}
                className="mb-0.5 p-2.5 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 hover:text-red-600 transition-colors shrink-0"
                title="Elimina categoria"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          {/* Subcategory */}
          {showSubDropdown && (
            <div className="flex items-end gap-2">
              <div className="flex-1 min-w-0">
                <Select
                  label="Sottocategoria"
                  options={subcategoryOptions}
                  placeholder="Seleziona..."
                  value={subcategory}
                  onChange={(e) => handleSubcategoryChange(e.target.value)}
                />
              </div>
              {subcategory && canDeleteSubcategory(category, subcategory) && (
                <button
                  onClick={() => setShowDeleteSub(true)}
                  className="mb-0.5 p-2.5 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 hover:text-red-600 transition-colors shrink-0"
                  title="Elimina sottocategoria"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          )}

          {showFreeText && (
            <Input
              label="Specifica"
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
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-[var(--color-subdued)]">IVA</label>
              <div className="flex rounded-lg border border-[var(--color-border)] overflow-hidden h-[46px]">
                <button type="button" onClick={() => setVatRate(10)}
                  className={`flex-1 text-sm font-semibold transition-colors ${vatRate === 10 ? 'bg-green-600 text-white' : 'bg-[var(--color-card)] text-[var(--color-subdued)]'}`}>10%</button>
                <button type="button" onClick={() => setVatRate(22)}
                  className={`flex-1 text-sm font-semibold transition-colors ${vatRate === 22 ? 'bg-blue-600 text-white' : 'bg-[var(--color-card)] text-[var(--color-subdued)]'}`}>22%</button>
              </div>
            </div>
          </div>

          <Input label="Nota" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nota opzionale..." />

          <Button onClick={handleSubmit} loading={saving} fullWidth disabled={!canSubmit}>
            <Plus size={18} /> Aggiungi Spesa
          </Button>
        </div>
      </Card>

      {/* New Category Modal */}
      <Modal open={showNewCat} onClose={() => setShowNewCat(false)} title="Nuova Categoria"
        actions={<><Button variant="secondary" onClick={() => setShowNewCat(false)}>Annulla</Button><Button onClick={handleAddCategory} disabled={!newCatName.trim()}>Aggiungi</Button></>}>
        <div className="space-y-3">
          <Input label="Nome categoria" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Es: Pulizie, Trasporto..." />
          <div className="space-y-1.5">
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-[var(--color-subdued)]">IVA predefinita</label>
            <div className="flex rounded-lg border border-[var(--color-border)] overflow-hidden h-[42px]">
              <button type="button" onClick={() => setNewCatVat(10)} className={`flex-1 text-sm font-semibold transition-colors ${newCatVat === 10 ? 'bg-green-600 text-white' : 'bg-[var(--color-card)] text-[var(--color-subdued)]'}`}>10%</button>
              <button type="button" onClick={() => setNewCatVat(22)} className={`flex-1 text-sm font-semibold transition-colors ${newCatVat === 22 ? 'bg-blue-600 text-white' : 'bg-[var(--color-card)] text-[var(--color-subdued)]'}`}>22%</button>
            </div>
          </div>
        </div>
      </Modal>

      {/* New Subcategory Modal */}
      <Modal open={showNewSub} onClose={() => setShowNewSub(false)} title="Nuova Sottocategoria"
        actions={<><Button variant="secondary" onClick={() => setShowNewSub(false)}>Annulla</Button><Button onClick={handleAddSubcategory} disabled={!newSubName.trim()}>Aggiungi</Button></>}>
        <Input label={`Sottocategoria per ${config?.label || ''}`} value={newSubName} onChange={(e) => setNewSubName(e.target.value)} placeholder="Es: nome fornitore..." />
      </Modal>

      {/* Delete Category Modal */}
      <Modal open={showDeleteCat} onClose={() => setShowDeleteCat(false)} title="Elimina categoria"
        actions={<><Button variant="secondary" onClick={() => setShowDeleteCat(false)}>Annulla</Button><Button variant="danger" onClick={handleDeleteCategory}>Elimina</Button></>}>
        <p className="text-sm text-[var(--color-subdued)]">
          Eliminare <strong className="text-[var(--color-text)]">{config?.label}</strong>? Le spese gia' registrate restano. Puoi ripristinarla in futuro dal menu categorie.
        </p>
      </Modal>

      {/* Delete Subcategory Modal */}
      <Modal open={showDeleteSub} onClose={() => setShowDeleteSub(false)} title="Elimina sottocategoria"
        actions={<><Button variant="secondary" onClick={() => setShowDeleteSub(false)}>Annulla</Button><Button variant="danger" onClick={handleDeleteSubcategory}>Elimina</Button></>}>
        <p className="text-sm text-[var(--color-subdued)]">
          Eliminare <strong className="text-[var(--color-text)]">{subcategory}</strong>? Le spese gia' registrate restano.
        </p>
      </Modal>

      {/* Restore Category Modal */}
      <Modal open={showRestore} onClose={() => setShowRestore(false)} title="Ripristina categoria">
        <div className="space-y-2">
          <p className="text-sm text-[var(--color-subdued)] mb-3">Categorie eliminate che puoi ripristinare:</p>
          {hiddenCategories.map((hc) => (
            <button
              key={hc.key}
              onClick={() => handleRestore(hc.key)}
              className="w-full flex items-center gap-2 p-3 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-border)]/30 transition-colors text-left"
            >
              <RotateCcw size={16} className="text-green-600 shrink-0" />
              <span className="text-sm font-medium text-[var(--color-text)]">{hc.label}</span>
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
}
