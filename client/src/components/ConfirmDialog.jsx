import { useTranslation } from 'react-i18next';

export default function ConfirmDialog({ message, onConfirm, onCancel }) {
  const { t } = useTranslation();
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div className="confirm-dialog" onClick={e => e.stopPropagation()} id="confirm-dialog">
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>⚠️</div>
          <div className="confirm-dialog-msg">{message}</div>
          <div className="confirm-dialog-actions">
            <button className="btn btn-ghost" onClick={onCancel} id="confirm-cancel">{t('common.cancel')}</button>
            <button className="btn btn-danger" onClick={onConfirm} id="confirm-ok">{t('common.confirm')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
