import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  getEvent, toggleEventStatus,
  getContributions, createContribution, updateContribution, deleteContribution,
  getExpenses, createExpense, updateExpense, deleteExpense,
  getReport, getPdfUrl
} from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import ContributionModal from '../components/ContributionModal';
import ExpenseModal from '../components/ExpenseModal';

function formatMRU(amount) {
  return new Intl.NumberFormat().format(Math.round(amount)) + ' MRU';
}

function formatDT(date) {
  return new Date(date).toLocaleString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const avatarColors = ['#fce4ec','#e0f7f0','#ede7f6','#e3f2fd','#fff8e1','#f3e5f5','#e8f5e9','#fbe9e7'];
function getAvatarColor(name) { return avatarColors[name.charCodeAt(0) % avatarColors.length]; }
function getInitial(name) { return name ? name[0].toUpperCase() : '?'; }

export default function EventDetailPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [report, setReport] = useState(null);
  const [tab, setTab] = useState('contributions');
  const [loading, setLoading] = useState(true);
  const pdfLoading = false;
  const [contribModal, setContribModal] = useState(null); // null | 'add' | contrib obj (edit)
  const [expenseModal, setExpenseModal] = useState(null);
  const [confirmItem, setConfirmItem] = useState(null); // { type, item }

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [evRes, cRes, eRes] = await Promise.all([
      getEvent(id), getContributions(id), getExpenses(id)
    ]);
    setEvent(evRes.data);
    setContributions(cRes.data);
    setExpenses(eRes.data);
    setLoading(false);
  }, [id]);

  useEffect(() => { loadAll(); }, [loadAll]);

  useEffect(() => {
    if (tab === 'report') {
      getReport(id).then(r => setReport(r.data));
    }
  }, [tab, id]);

  const totalCollected = contributions.reduce((s, c) => s + c.amount, 0);
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const balance = totalCollected - totalSpent;

  const isClosed = event?.status === 'closed';

  const handleContribSave = async (data) => {
    try {
      if (contribModal === 'add') {
        await createContribution(id, data);
        toast.success(t('contributions.added'));
      } else {
        await updateContribution(id, contribModal._id, data);
        toast.success(t('contributions.updated'));
      }
      setContribModal(null);
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0]?.msg || t('common.error'));
    }
  };

  const handleExpenseSave = async (data) => {
    try {
      if (expenseModal === 'add') {
        await createExpense(id, data);
        toast.success(t('expenses.added'));
      } else {
        await updateExpense(id, expenseModal._id, data);
        toast.success(t('expenses.updated'));
      }
      setExpenseModal(null);
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0]?.msg || t('common.error'));
    }
  };

  const handleDelete = async () => {
    const { type, item } = confirmItem;
    try {
      if (type === 'contribution') {
        await deleteContribution(id, item._id);
        toast.success(t('contributions.deleted'));
      } else {
        await deleteExpense(id, item._id);
        toast.success(t('expenses.deleted'));
      }
      setConfirmItem(null);
      loadAll();
    } catch { toast.error(t('common.error')); }
  };

  const handlePdfExport = () => {
    const token = localStorage.getItem('weddingToken');
    const normalizedLang = (i18n.language || 'en').split('-')[0].substring(0, 2);
    const pdfUrl = getPdfUrl(id, normalizedLang) + '&token=' + token;
    window.open(pdfUrl, '_blank');
  };

  if (loading) return <div className="spinner" />;
  if (!event) return <div className="empty-state"><div className="empty-icon">❌</div></div>;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-row">
          <button className="btn-icon btn" onClick={() => navigate(-1)} id="back-btn" style={{ fontSize: '1rem' }}>←</button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.title}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>
              👤 {event.groomName} · {new Date(event.eventDate).toLocaleDateString()}
            </div>
          </div>
          <span className={`status-pill ${event.status}`}>{t(`events.${event.status}`)}</span>
        </div>
      </div>

      {/* Totals Banner */}
      <div className="totals-banner">
        <div className="t-item">
          <div className="t-label">{t('dashboard.totalCollected')}</div>
          <div className="t-value">{formatMRU(totalCollected)}</div>
        </div>
        <div className="t-divider" />
        <div className="t-item">
          <div className="t-label">{t('dashboard.totalSpent')}</div>
          <div className="t-value">{formatMRU(totalSpent)}</div>
        </div>
        <div className="t-divider" />
        <div className="t-item">
          <div className="t-label">{t('dashboard.balance')}</div>
          <div className="t-value" style={{ color: balance >= 0 ? 'var(--green-chip)' : '#f1948a' }}>
            {formatMRU(balance)}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['contributions', 'expenses', 'report'].map(tabKey => (
          <button
            key={tabKey}
            className={`tab-btn${tab === tabKey ? ' active' : ''}`}
            onClick={() => setTab(tabKey)}
            id={`tab-${tabKey}`}
          >
            {t(`common.tabs.${tabKey}`)}
          </button>
        ))}
      </div>

      {/* ── CONTRIBUTIONS TAB ─────────────────────────── */}
      {tab === 'contributions' && (
        <>
          {contributions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💵</div>
              <div className="empty-title">{t('contributions.noContributions')}</div>
            </div>
          ) : (
            contributions.map(c => (
              <div key={c._id} className="list-row confirmed" id={`contrib-${c._id}`}>
                <div className="row-avatar" style={{ background: getAvatarColor(c.friendName), color: 'var(--text-dark)' }}>
                  {getInitial(c.friendName)}
                </div>
                <div className="row-body">
                  <div className="row-name" style={{ color: '#fff' }}>{c.friendName}</div>
                  <div className="row-meta">{new Date(c.timestamp).toLocaleDateString()}</div>
                </div>
                <div className="row-right">
                  <div className="row-amount">{formatMRU(c.amount)}</div>
                  {!isClosed && (
                    <div className="row-actions">
                      <button className="btn-icon btn" onClick={() => setContribModal(c)} id={`edit-contrib-${c._id}`} title={t('contributions.edit')}>✏️</button>
                      <button className="btn-icon btn danger" onClick={() => setConfirmItem({ type: 'contribution', item: c })} id={`del-contrib-${c._id}`} title={t('contributions.delete')}>🗑</button>
                    </div>
                  )}
                </div>
                <div className="check-badge">✓</div>
              </div>
            ))
          )}
          {!isClosed && (
            <button className="fab" onClick={() => setContribModal('add')} id="add-contrib-fab" title={t('contributions.add')}>+</button>
          )}
        </>
      )}

      {/* ── EXPENSES TAB ──────────────────────────────── */}
      {tab === 'expenses' && (
        <>
          {expenses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🛒</div>
              <div className="empty-title">{t('expenses.noExpenses')}</div>
            </div>
          ) : (
            expenses.map(e => (
              <div key={e._id} className="list-row" id={`expense-${e._id}`}>
                <div className="row-avatar" style={{ background: 'var(--pastel-pink)', fontSize: '1rem' }}>
                  {e.category === 'apartment' ? '🏠' : e.category === 'cars' ? '🚗' : e.category === 'banquet' ? '🍽' : e.category === 'gifts' ? '🎁' : '💸'}
                </div>
                <div className="row-body">
                  <div className="row-name">{e.name}</div>
                  <div className="row-meta">{formatDT(e.datetime)}{e.notes ? ` · ${e.notes}` : ''}</div>
                </div>
                <div className="row-right">
                  <div className="row-amount negative">{formatMRU(e.amount)}</div>
                  {!isClosed && (
                    <div className="row-actions">
                      <button className="btn-icon btn" onClick={() => setExpenseModal(e)} id={`edit-expense-${e._id}`} title={t('expenses.edit')}>✏️</button>
                      <button className="btn-icon btn danger" onClick={() => setConfirmItem({ type: 'expense', item: e })} id={`del-expense-${e._id}`} title={t('expenses.delete')}>🗑</button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {!isClosed && (
            <button className="fab" onClick={() => setExpenseModal('add')} id="add-expense-fab" title={t('expenses.add')}>+</button>
          )}
        </>
      )}

      {/* ── REPORT TAB ────────────────────────────────── */}
      {tab === 'report' && (
        <div>
          <button
            className="btn btn-green w-full"
            style={{ marginBottom: 20 }}
            onClick={handlePdfExport}
            disabled={pdfLoading}
            id="export-pdf-btn"
          >
            📄 {pdfLoading ? t('report.generating') : t('report.export')}
          </button>

          {report && (
            <>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 8, color: 'var(--text-mid)' }}>
                {t('report.contributions')} ({report.contributions.length})
              </div>
              <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>{t('contributions.friendName')}</th>
                      <th style={{ textAlign: 'end' }}>{t('contributions.amount')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.contributions.map(c => (
                      <tr key={c._id}>
                        <td>{c.friendName}</td>
                        <td style={{ textAlign: 'end' }}>{formatMRU(c.amount)}</td>
                      </tr>
                    ))}
                    <tr className="total-row">
                      <td>{t('common.tabs.contributions')} {t('expenses.total')}</td>
                      <td style={{ textAlign: 'end' }}>{formatMRU(report.summary.totalCollected)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 8, color: 'var(--text-mid)' }}>
                {t('report.expenses')} ({report.expenses.length})
              </div>
              <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>{t('expenses.name')}</th>
                      <th style={{ textAlign: 'end' }}>{t('expenses.amount')}</th>
                      <th style={{ textAlign: 'end' }}>{t('expenses.datetime')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.expenses.map(e => (
                      <tr key={e._id}>
                        <td>{e.name}</td>
                        <td style={{ textAlign: 'end' }}>{formatMRU(e.amount)}</td>
                        <td style={{ textAlign: 'end', fontSize: '0.75rem' }}>{formatDT(e.datetime)}</td>
                      </tr>
                    ))}
                    <tr className="total-row">
                      <td>{t('expenses.total')}</td>
                      <td style={{ textAlign: 'end' }}>{formatMRU(report.summary.totalSpent)}</td>
                      <td />
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 8, color: 'var(--text-mid)' }}>{t('report.summary')}</div>
              <div className="summary-row neutral">
                <span>{t('report.totalCollected')}</span>
                <span className="text-green font-bold">{formatMRU(report.summary.totalCollected)}</span>
              </div>
              <div className="summary-row neutral">
                <span>{t('report.totalSpent')}</span>
                <span className="text-red font-bold">{formatMRU(report.summary.totalSpent)}</span>
              </div>
              <div className={`summary-row ${report.summary.balance >= 0 ? 'positive' : 'negative'}`}>
                <span style={{ fontWeight: 700 }}>{t('report.balance')}</span>
                <span style={{ fontWeight: 800 }}>{formatMRU(report.summary.balance)}</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Modals */}
      {contribModal !== null && (
        <ContributionModal
          eventId={id}
          initial={contribModal === 'add' ? null : contribModal}
          onSave={handleContribSave}
          onClose={() => setContribModal(null)}
        />
      )}
      {expenseModal !== null && (
        <ExpenseModal
          initial={expenseModal === 'add' ? null : expenseModal}
          onSave={handleExpenseSave}
          onClose={() => setExpenseModal(null)}
        />
      )}
      {confirmItem && (
        <ConfirmDialog
          message={t(confirmItem.type === 'contribution' ? 'contributions.deleteConfirm' : 'expenses.deleteConfirm')}
          onConfirm={handleDelete}
          onCancel={() => setConfirmItem(null)}
        />
      )}
    </div>
  );
}
