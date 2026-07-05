import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.phone, form.password);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || t('auth.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">💍</div>
        <h1 className="login-title">{t('auth.loginTitle')}</h1>
        <p className="login-sub">{t('auth.loginSubtitle')}</p>

        <form onSubmit={handleSubmit} id="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-phone">{t('auth.phone')}</label>
            <input
              id="login-phone"
              type="tel"
              className="form-input"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="48839340"
              required
              autoComplete="tel"
              dir="ltr"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">{t('auth.password')}</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>
          <button id="login-btn" type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? t('common.loading') : t('auth.loginButton')}
          </button>
        </form>
      </div>
    </div>
  );
}
