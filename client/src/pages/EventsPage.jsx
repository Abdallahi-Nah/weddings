import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { getEvents, createEvent, deleteEvent, toggleEventStatus } from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import EventFormModal from '../components/EventFormModal';

function formatMRU(amount) {
  return new Intl.NumberFormat().format(Math.round(amount)) + ' MRU';
}

export default function EventsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = () => getEvents().then(r => setEvents(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const filtered = events.filter(e => filter === 'all' ? true : e.status === filter);

  const handleCreate = async (data) => {
    try {
      await createEvent(data);
      toast.success(t('events.created'));
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0]?.msg || t('common.error'));
    }
  };

  const handleToggleStatus = async (ev, e) => {
    e.stopPropagation();
    try {
      await toggleEventStatus(ev._id);
      toast.success(t('events.statusChanged'));
      load();
    } catch { toast.error(t('common.error')); }
  };

  const handleDelete = async () => {
    try {
      await deleteEvent(confirmDelete._id);
      toast.success(t('events.deleted'));
      setConfirmDelete(null);
      load();
    } catch { toast.error(t('common.error')); }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-row">
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{t('events.title')}</h1>
          <button id="new-event-btn" className="btn btn-green" onClick={() => setShowForm(true)} style={{ padding: '9px 18px', fontSize: '0.82rem' }}>
            + {t('events.newEvent')}
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs">
        {['all', 'active', 'closed'].map(f => (
          <button
            key={f}
            className={`filter-tab${filter === f ? ' active' : ''}`}
            onClick={() => setFilter(f)}
            id={`filter-${f}`}
          >
            {t(`events.${f === 'all' ? 'all' : f}`)}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💍</div>
          <div className="empty-title">{t('events.noEvents')}</div>
        </div>
      ) : (
        filtered.map(ev => (
          <div
            key={ev._id}
            className={`event-card${ev.status === 'active' ? ' active-event' : ''}`}
            onClick={() => navigate(`/events/${ev._id}`)}
            id={`event-card-${ev._id}`}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ev.title}
                </div>
                <div style={{ color: 'var(--text-light)', fontSize: '0.78rem' }}>
                  👤 {ev.groomName} · {new Date(ev.eventDate).toLocaleDateString()}
                </div>
              </div>
              <span className={`status-pill ${ev.status}`}>
                {ev.status === 'active' ? '● ' : '○ '}{t(`events.${ev.status}`)}
              </span>
            </div>

            {/* Totals */}
            <div style={{ display: 'flex', gap: 12 }}>
              <span className="stat-chip green">💰 {formatMRU(ev.totalCollected)}</span>
              <span className="stat-chip red">🛒 {formatMRU(ev.totalSpent)}</span>
              <span className="stat-chip">⚖️ {formatMRU(ev.balance)}</span>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
              <button
                className="btn btn-ghost"
                style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                onClick={(e) => handleToggleStatus(ev, e)}
                id={`toggle-status-${ev._id}`}
              >
                {ev.status === 'active' ? `🔒 ${t('events.close')}` : `🔓 ${t('events.reopen')}`}
              </button>
              <button
                className="btn btn-ghost"
                style={{ fontSize: '0.75rem', padding: '6px 12px', color: 'var(--red)' }}
                onClick={(e) => { e.stopPropagation(); setConfirmDelete(ev); }}
                id={`delete-event-${ev._id}`}
              >
                🗑 {t('events.delete')}
              </button>
            </div>
          </div>
        ))
      )}

      {showForm && (
        <EventFormModal
          onSubmit={handleCreate}
          onClose={() => setShowForm(false)}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          message={t('events.deleteConfirm')}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
