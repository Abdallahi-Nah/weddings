import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FabProvider } from './contexts/FabContext';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import FriendsPage from './pages/FriendsPage';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/Layout';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  return !user ? children : <Navigate to="/" replace />;
}

function AppRoutes() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const lang = i18n.language;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [i18n.language]);

  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/friends" element={<FriendsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FabProvider>
          <AppRoutes />
        </FabProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#1a1a0f',
              borderRadius: '12px',
              fontFamily: 'inherit',
              fontSize: '0.88rem',
              fontWeight: '600',
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
              border: '1px solid #ddd8cc',
            },
            success: { iconTheme: { primary: '#1a5738', secondary: '#fff' } },
            error: { iconTheme: { primary: '#c0392b', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
