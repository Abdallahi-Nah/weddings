import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { changePassword } from '../services/api';
import { usePWAInstall } from '../hooks/usePWAInstall';

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const { canInstall, isInstalled, isIOS, promptInstall } = usePWAInstall();

  const handleLang = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('wf_lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  const handleChangePw = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error(t('auth.passwordMismatch'));
      return;
    }
    setPwLoading(true);
    try {
      await changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success(t('auth.passwordChanged'));
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || t('common.error'));
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{t('settings.title')}</h1>
      </div>

      {/* Language */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 12, color: 'var(--text-mid)' }}>
          🌐 {t('settings.language')}
        </div>
        <div className="lang-switcher" id="lang-switcher">
          {['ar', 'fr', 'en'].map(lang => (
            <button
              key={lang}
              className={`lang-btn${i18n.language === lang ? ' active' : ''}`}
              onClick={() => handleLang(lang)}
              id={`lang-${lang}`}
            >
              {lang === 'ar' ? 'العربية' : lang === 'fr' ? 'Français' : 'English'}
            </button>
          ))}
        </div>
      </div>

      {/* PWA Install */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 12, color: 'var(--text-mid)' }}>
          📲 {t('pwa.title')}
        </div>
        {isInstalled ? (
          <div style={{ color: 'var(--green-deep)', fontWeight: 600, fontSize: '0.9rem' }}>
            ✅ {t('pwa.installed')}
          </div>
        ) : canInstall ? (
          <button className="btn btn-primary w-full" id="pwa-install-btn" onClick={promptInstall}>
            ⬇️ {t('pwa.install')}
          </button>
        ) : isIOS ? (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-mid)', lineHeight: 1.7 }}>
            <div style={{ marginBottom: 6, fontWeight: 600 }}>{t('pwa.iosTitle')}</div>
            <div>{t('pwa.iosStep1')}</div>
            <div>{t('pwa.iosStep2')}</div>
            <div>{t('pwa.iosStep3')}</div>
          </div>
        ) : (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
            {t('pwa.notAvailable')}
          </div>
        )}
      </div>

      {/* Account info */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 10, color: 'var(--text-mid)' }}>
          👤 {t('settings.account')}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <div className="header-avatar">م</div>
          <div>
            <div style={{ fontWeight: 700 }}>{t('settings.supervisor')}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>📞 {user?.phone}</div>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 14, color: 'var(--text-mid)' }}>
          🔐 {t('auth.changePassword')}
        </div>
        <form onSubmit={handleChangePw} id="change-password-form">
          <div className="form-group">
            <label className="form-label" htmlFor="current-pw">{t('auth.currentPassword')}</label>
            <input id="current-pw" type="password" className="form-input" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} required autoComplete="current-password" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="new-pw">{t('auth.newPassword')}</label>
            <input id="new-pw" type="password" className="form-input" value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} required minLength={6} autoComplete="new-password" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="confirm-pw">{t('auth.confirmPassword')}</label>
            <input id="confirm-pw" type="password" className="form-input" value={pwForm.confirmPassword} onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))} required minLength={6} autoComplete="new-password" />
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={pwLoading} id="change-pw-btn">
            {pwLoading ? t('common.loading') : t('auth.changePassword')}
          </button>
        </form>
      </div>

      {/* Logout */}
      <button className="btn btn-danger w-full" onClick={logout} id="logout-btn">
        🚪 {t('auth.logout')}
      </button>
    </div>
  );
}
