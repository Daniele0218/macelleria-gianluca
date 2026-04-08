import { useState } from 'react';
import { UserPlus, UserCheck, UserX, Trash2, Pencil } from 'lucide-react';
import { useEmployees } from '../../hooks/useEmployees';
import { formatCurrency } from '../../lib/formatters';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import Spinner from '../ui/Spinner';

export default function EmployeeManager() {
  const { active, inactive, loading, add, updateSalary, toggleActive, remove } = useEmployees();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSalary, setNewSalary] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    const ok = await add(newName.trim(), parseFloat(newSalary) || 0);
    if (ok) {
      setNewName('');
      setNewSalary('');
      setShowAdd(false);
    }
    setSaving(false);
  };

  const handleSalaryEdit = async (id: string) => {
    setSaving(true);
    await updateSalary(id, parseFloat(editValue) || 0);
    setEditingId(null);
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await remove(deleteId);
    setDeleteId(null);
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-[var(--color-text)]">Operai</h3>
        <Button variant="secondary" onClick={() => setShowAdd(!showAdd)}>
          <UserPlus size={16} /> Aggiungi
        </Button>
      </div>

      {showAdd && (
        <Card className="p-4 space-y-3">
          <Input label="Nome" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome operaio..." />
          <Input label="Stipendio mensile" prefix="€" type="number" value={newSalary} onChange={(e) => setNewSalary(e.target.value)} placeholder="0,00" />
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowAdd(false)}>Annulla</Button>
            <Button onClick={handleAdd} loading={saving}>Salva</Button>
          </div>
        </Card>
      )}

      {/* Active employees */}
      <div className="space-y-2">
        {active.map((emp) => (
          <Card key={emp.id} className="p-3 overflow-hidden">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                <UserCheck size={16} className="text-green-600" />
              </div>
              <p className="text-sm font-semibold text-[var(--color-text)] flex-1 min-w-0 truncate">{emp.name}</p>
              <button
                onClick={() => toggleActive(emp.id, false)}
                className="p-1.5 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 text-[var(--color-subdued)] hover:text-orange-600 transition-colors shrink-0"
                title="Disattiva"
              >
                <UserX size={15} />
              </button>
              <button
                onClick={() => setDeleteId(emp.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--color-subdued)] hover:text-red-600 transition-colors shrink-0"
                title="Elimina"
              >
                <Trash2 size={15} />
              </button>
            </div>
            {/* Salary row */}
            <div className="mt-2 ml-10">
              {editingId === emp.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--color-subdued)]">€</span>
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSalaryEdit(emp.id)}
                    onBlur={() => handleSalaryEdit(emp.id)}
                    className="w-24 px-2 py-1 text-sm rounded border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text)]"
                    autoFocus
                  />
                </div>
              ) : (
                <button
                  onClick={() => { setEditingId(emp.id); setEditValue(String(emp.monthly_salary)); }}
                  className="flex items-center gap-1.5 text-xs text-[var(--color-subdued)] hover:text-[var(--color-text)] transition-colors"
                >
                  <Pencil size={11} />
                  <span>{formatCurrency(emp.monthly_salary)}/mese</span>
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Inactive employees */}
      {inactive.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-[var(--color-subdued)] font-semibold mb-2">Disattivati</p>
          <div className="space-y-2 opacity-60">
            {inactive.map((emp) => (
              <Card key={emp.id} className="p-3 flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-[var(--color-border)]/50 flex items-center justify-center shrink-0">
                  <UserX size={16} className="text-[var(--color-subdued)]" />
                </div>
                <p className="text-sm text-[var(--color-subdued)] flex-1 min-w-0 truncate">{emp.name}</p>
                <Button variant="secondary" onClick={() => toggleActive(emp.id, true)} className="text-xs !px-2 !py-1 !min-h-0 shrink-0">
                  Riattiva
                </Button>
                <button
                  onClick={() => setDeleteId(emp.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--color-subdued)] hover:text-red-600 transition-colors shrink-0"
                >
                  <Trash2 size={15} />
                </button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Elimina operaio"
        actions={
          <>
            <Button variant="secondary" onClick={() => setDeleteId(null)}>Annulla</Button>
            <Button variant="danger" onClick={handleDelete}>Elimina</Button>
          </>
        }
      >
        <p className="text-sm text-[var(--color-subdued)]">
          Sei sicuro? Verranno eliminati anche tutti i pagamenti registrati per questo operaio.
        </p>
      </Modal>
    </div>
  );
}
