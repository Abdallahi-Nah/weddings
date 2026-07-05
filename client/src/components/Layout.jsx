import { Outlet, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const navItems = [
    { to: '/',        icon: '🏠', label: t('nav.dashboard'), id: 'nav-dashboard' },
    { to: '/events',  icon: '💍', label: t('nav.events'),    id: 'nav-events'   },
    { to: '/friends', icon: '👥', label: t('nav.friends'),   id: 'nav-friends'  },
    { to: '/settings',icon: '⚙️', label: t('nav.settings'),  id: 'nav-settings' },
  ];

  return (
    <div className="app-shell">
      {/* Dynamic Island top bar */}
      <div className="top-bar">
        <div className="dynamic-island" />
      </div>

      {/* Main content */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            id={item.id}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
