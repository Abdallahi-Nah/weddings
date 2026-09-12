import { Outlet, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useFab } from '../contexts/FabContext';

export default function Layout() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { fab } = useFab();

  const navItems = [
    { to: '/',        icon: '🏠', label: t('nav.dashboard'), id: 'nav-dashboard' },
    { to: '/events',  icon: '💍', label: t('nav.events'),    id: 'nav-events'   },
    { to: '/friends', icon: '👥', label: t('nav.friends'),   id: 'nav-friends'  },
    { to: '/settings',icon: '⚙️', label: t('nav.settings'),  id: 'nav-settings' },
  ];

  const leftItems = fab ? navItems.slice(0, 2) : navItems;
  const rightItems = fab ? navItems.slice(2) : [];

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

      {/* Bottom nav: divides the width evenly across 4 tabs, or across
          5 slots (2 tabs + the raised FAB + 2 tabs) when a page has
          registered a quick-add action. */}
      <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
        {leftItems.map(item => (
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

        {fab && (
          <button
            className="nav-fab"
            onClick={fab.onClick}
            id={fab.id}
            title={fab.title}
            aria-label={fab.title}
          >
            {fab.icon}
          </button>
        )}

        {rightItems.map(item => (
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
