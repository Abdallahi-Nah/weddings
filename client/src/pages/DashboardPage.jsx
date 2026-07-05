import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { getEvents } from '../services/api';

function formatMRU(amount) {
  return new Intl.NumberFormat().format(Math.round(amount)) + ' MRU';
}

const pastelColors = [
  { bg: 'var(--pastel-pink)',    icon: '💍' },
  { bg: 'var(--pastel-mint)',    icon: '🌿' },
  { bg: 'var(--pastel-lavender)',icon: '💜' },
  { bg: 'var(--pastel-blue)',    icon: '💙' },
  { bg: 'var(--pastel-amber)',   icon: '⭐' },
];

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvents().then(r => setEvents(r.data)).finally(() => setLoading(false));
  }, []);

  const activeEvent = events.find(e => e.status === 'active');
  const pastEvents = events.filter(e => e.status === 'closed').slice(0, 5);

  if (loading) return <div className="spinner" />;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-row">
          <div className="header-avatar">م</div>
          <div className="header-info">
            <div className="header-name">{t('settings.supervisor')}</div>
            <div className="header-role">📞 {user?.phone}</div>
          </div>
        </div>

        {activeEvent && (
          <div className="header-chips">
            <span className="stat-chip green">
              <span className="chip-icon">💰</span>
              {formatMRU(activeEvent.totalCollected)}
            </span>
            <span className="stat-chip red">
              <span className="chip-icon">🛒</span>
              {formatMRU(activeEvent.totalSpent)}
            </span>
            <span className="stat-chip">
              <span className="chip-icon">⚖️</span>
              {formatMRU(activeEvent.balance)}
            </span>
          </div>
        )}
      </div>

      {/* Active Event Banner */}
      <div className="section-header">
        <span className="section-title">{t('dashboard.activeEvent')}</span>
      </div>

      {activeEvent ? (
        <div
          className="card-green"
          onClick={() => navigate(`/events/${activeEvent._id}`)}
          style={{ cursor: 'pointer', marginBottom: 16 }}
          id="active-event-banner"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <h3 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.78rem' }}>{activeEvent.groomName}</h3>
              <div className="big-num">{activeEvent.title}</div>
            </div>
            <span className="status-pill active" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
              ● {t('events.active')}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 14 }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.7)' }}>{t('dashboard.totalCollected')}</div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{formatMRU(activeEvent.totalCollected)}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.7)' }}>{t('dashboard.totalSpent')}</div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{formatMRU(activeEvent.totalSpent)}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.7)' }}>{t('dashboard.balance')}</div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{formatMRU(activeEvent.balance)}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: 28, marginBottom: 16 }}>
          <div style={{ fontSize: '2rem', marginBottom: 10 }}>💍</div>
          <div style={{ color: 'var(--text-light)', fontSize: '0.88rem', marginBottom: 14 }}>{t('dashboard.noActiveEvent')}</div>
          <button className="btn btn-green" onClick={() => navigate('/events')} id="create-event-btn">
            + {t('dashboard.createEvent')}
          </button>
        </div>
      )}

      {/* Quick stats mini cards */}
      {activeEvent && (
        <div className="mini-cards-row" style={{ marginBottom: 8 }}>
          <div className="mini-card" style={{ background: 'var(--pastel-mint)' }}>
            <div className="mini-icon">💵</div>
            <div className="mini-label">{t('dashboard.totalCollected')}</div>
            <div className="mini-value">{formatMRU(activeEvent.totalCollected)}</div>
          </div>
          <div className="mini-card" style={{ background: 'var(--pastel-pink)' }}>
            <div className="mini-icon">🛒</div>
            <div className="mini-label">{t('dashboard.totalSpent')}</div>
            <div className="mini-value">{formatMRU(activeEvent.totalSpent)}</div>
          </div>
          <div className="mini-card" style={{ background: 'var(--pastel-lavender)' }}>
            <div className="mini-icon">⚖️</div>
            <div className="mini-label">{t('dashboard.balance')}</div>
            <div className="mini-value" style={{ color: activeEvent.balance >= 0 ? 'var(--green)' : 'var(--red)' }}>
              {formatMRU(activeEvent.balance)}
            </div>
          </div>
        </div>
      )}

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <>
          <div className="section-header">
            <span className="section-title">{t('dashboard.recentEvents')}</span>
            <span className="view-all" onClick={() => navigate('/events')} id="view-all-events">
              {t('dashboard.viewAll')}
            </span>
          </div>
          <div className="mini-cards-row">
            {pastEvents.map((ev, i) => {
              const p = pastelColors[i % pastelColors.length];
              return (
                <div
                  key={ev._id}
                  className="mini-card"
                  style={{ background: p.bg, cursor: 'pointer', minWidth: 140 }}
                  onClick={() => navigate(`/events/${ev._id}`)}
                >
                  <div className="mini-icon">{p.icon}</div>
                  <div className="mini-label" style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {ev.groomName}
                  </div>
                  <div className="mini-value" style={{ fontSize: '0.82rem' }}>{formatMRU(ev.totalCollected)}</div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
