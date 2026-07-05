import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const CATEGORIES = ['apartment', 'cars', 'banquet', 'gifts', 'other'];

export default function ExpenseModal({ initial, onSave, onClose }) {
  const { t } = useTranslation();

  function toLocalDTInput(date) {
    if (!date) return '';
    const d = new Date(date);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  const [form, setForm] = useState({
    name: initial?.name || '',
    category: initial?.category || 'other',
    amount: initial?.amount || '',
    datetime: initial?.datetime ? toLocalDTInput(initial.datetime) : toLocalDTInput(new Date()),
    notes: initial?.notes || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave({ ...form, amount: Number(form.amount), datetime: new Date(form.datetime).toISOString() });
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} id="expense-modal">
        <div className="modal-handle" />
        <div className="modal-title">{initial ? t('expenses.edit') : t('expenses.add')}</div>
        <form onSubmit={handleSubmit} id="expense-form">
          <div className="form-group">
            <label className="form-label" htmlFor="exp-name">{t('expenses.name')}</label>
            <input id="exp-name" className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder={t('expenses.categories.apartment')} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="exp-cat">{t('expenses.category')}</label>
            <select id="exp-cat" className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{t(`expenses.categories.${c}`)}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="exp-amount">{t('expenses.amount')}</label>
            <input id="exp-amount" type="number" min="0" step="any" className="form-input" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required placeholder="8000" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="exp-datetime">{t('expenses.datetime')}</label>
            <input id="exp-datetime" type="datetime-local" className="form-input" value={form.datetime} onChange={e => setForm(f => ({ ...f, datetime: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="exp-notes">{t('expenses.notes')}</label>
            <textarea id="exp-notes" className="form-textarea" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }}>{t('common.cancel')}</button>
            <button type="submit" className="btn btn-green" style={{ flex: 2 }} disabled={loading} id="expense-submit-btn">
              {loading ? t('common.loading') : t('expenses.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
