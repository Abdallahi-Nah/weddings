import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getFriends } from '../services/api';

export default function ContributionModal({ initial, onSave, onClose }) {
  const { t } = useTranslation();
  const [friends, setFriends] = useState([]);
  const [form, setForm] = useState({
    friendName: initial?.friendName || '',
    amount: initial?.amount || '',
    timestamp: initial?.timestamp ? initial.timestamp.slice(0, 10) : new Date().toISOString().slice(0, 10),
    notes: initial?.notes || '',
  });
  const [showAC, setShowAC] = useState(false);
  const [loading, setLoading] = useState(false);
  const acRef = useRef(null);

  useEffect(() => {
    getFriends().then(r => setFriends(r.data));
  }, []);

  useEffect(() => {
    const handleClick = (e) => { if (acRef.current && !acRef.current.contains(e.target)) setShowAC(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = friends.filter(f => !form.friendName || f.name.includes(form.friendName));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave({ ...form, amount: Number(form.amount) });
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} id="contrib-modal">
        <div className="modal-handle" />
        <div className="modal-title">{initial ? t('contributions.edit') : t('contributions.add')}</div>
        <form onSubmit={handleSubmit} id="contrib-form">
          {/* Friend name with autocomplete */}
          <div className="form-group" ref={acRef}>
            <label className="form-label" htmlFor="contrib-name">{t('contributions.friendName')}</label>
            <div className="autocomplete-container">
              <input
                id="contrib-name"
                className="form-input"
                value={form.friendName}
                onChange={e => { setForm(f => ({ ...f, friendName: e.target.value })); setShowAC(true); }}
                onFocus={() => setShowAC(true)}
                placeholder={t('friends.placeholder')}
                required
                autoComplete="off"
              />
              {showAC && filtered.length > 0 && (
                <div className="autocomplete-list" id="autocomplete-list">
                  {filtered.map(f => (
                    <div
                      key={f._id}
                      className="autocomplete-item"
                      onMouseDown={() => { setForm(ff => ({ ...ff, friendName: f.name })); setShowAC(false); }}
                    >
                      {f.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="contrib-amount">{t('contributions.amount')}</label>
            <input id="contrib-amount" type="number" min="0" step="any" className="form-input" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required placeholder="5000" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="contrib-date">{t('contributions.date')}</label>
            <input id="contrib-date" type="date" className="form-input" value={form.timestamp} onChange={e => setForm(f => ({ ...f, timestamp: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="contrib-notes">{t('contributions.notes')}</label>
            <textarea id="contrib-notes" className="form-textarea" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }}>{t('common.cancel')}</button>
            <button type="submit" className="btn btn-green" style={{ flex: 2 }} disabled={loading} id="contrib-submit-btn">
              {loading ? t('common.loading') : t('contributions.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
