import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function EventFormModal({ onSubmit, onClose, initial }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    title: initial?.title || '',
    groomName: initial?.groomName || '',
    eventDate: initial?.eventDate ? initial.eventDate.slice(0, 10) : '',
    notes: initial?.notes || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(form);
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} id="event-form-modal">
        <div className="modal-handle" />
        <div className="modal-title">{initial ? t('events.update') : t('events.newEvent')}</div>
        <form onSubmit={handleSubmit} id="event-form">
          <div className="form-group">
            <label className="form-label" htmlFor="ev-title">{t('events.eventTitle')}</label>
            <input id="ev-title" className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="زواج أحمد — يوليو 2026" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="ev-groom">{t('events.groomName')}</label>
            <input id="ev-groom" className="form-input" value={form.groomName} onChange={e => setForm(f => ({ ...f, groomName: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="ev-date">{t('events.eventDate')}</label>
            <input id="ev-date" type="date" className="form-input" value={form.eventDate} onChange={e => setForm(f => ({ ...f, eventDate: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="ev-notes">{t('events.notes')}</label>
            <textarea id="ev-notes" className="form-textarea" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }}>{t('common.cancel')}</button>
            <button type="submit" className="btn btn-green" style={{ flex: 2 }} disabled={loading} id="event-submit-btn">
              {loading ? t('common.loading') : (initial ? t('events.update') : t('events.create'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
