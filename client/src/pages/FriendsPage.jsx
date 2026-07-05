import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { getFriends, createFriend, deleteFriend } from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';

export default function FriendsPage() {
  const { t } = useTranslation();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = () => getFriends().then(r => setFriends(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await createFriend(newName.trim());
      toast.success(t('friends.added'));
      setNewName('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || t('common.error'));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteFriend(confirmDelete._id);
      toast.success(t('friends.deleted'));
      setConfirmDelete(null);
      load();
    } catch { toast.error(t('common.error')); }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div className="page-header">
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{t('friends.title')}</h1>
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 10, marginBottom: 20 }} id="add-friend-form">
        <input
          className="form-input"
          placeholder={t('friends.placeholder')}
          value={newName}
          onChange={e => setNewName(e.target.value)}
          id="friend-name-input"
        />
        <button type="submit" className="btn btn-green" id="add-friend-btn" style={{ flexShrink: 0 }}>
          + {t('friends.add')}
        </button>
      </form>

      {/* List */}
      {friends.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <div className="empty-title">{t('friends.noFriends')}</div>
        </div>
      ) : (
        friends.map(f => (
          <div key={f._id} className="list-row" id={`friend-${f._id}`}>
            <div className="row-avatar" style={{ background: 'var(--pastel-mint)', color: 'var(--text-dark)', fontWeight: 700, fontSize: '0.95rem' }}>
              {f.name[0].toUpperCase()}
            </div>
            <div className="row-body">
              <div className="row-name">{f.name}</div>
            </div>
            <button
              className="btn-icon btn danger"
              onClick={() => setConfirmDelete(f)}
              id={`delete-friend-${f._id}`}
              title={t('friends.delete')}
            >
              🗑
            </button>
          </div>
        ))
      )}

      {confirmDelete && (
        <ConfirmDialog
          message={t('friends.deleteConfirm')}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
