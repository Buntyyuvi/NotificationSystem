import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { useSocket } from './hooks/useSocket';
import { api } from './config/api';
import NotificationBell from './components/NotificationBell';
import NotificationDetail from './components/NotificationDetail';
import Toast from './components/Toast';
import Dashboard from './pages/Dashboard';
import NotificationsPage from './pages/Notifications';
import SettingsPage from './pages/Settings';
import { Notification } from './types/notification';

function AppContent() {
  const { isLoggedIn, login, logout, userId } = useAuth();
  const [loginInput, setLoginInput] = useState('');
  const [page, setPage] = useState<'dashboard' | 'notifications' | 'settings'>('dashboard');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useSocket();

  const handleLogin = async () => {
    try {
      const { data } = await api.post('/auth/login', { userId: loginInput || 'user-1' });
      login(data.userId, data.token);
      setToast('Logged in successfully');
    } catch (err) {
      setToast('Login failed');
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{
          background: '#1e293b', borderRadius: 16, padding: 32,
          border: '1px solid #334155', textAlign: 'center', maxWidth: 400, width: '90%'
        }}>
          <h1 style={{ color: '#e2e8f0', marginBottom: 24 }}>&#128276; Notification System</h1>
          <input
            value={loginInput}
            onChange={e => setLoginInput(e.target.value)}
            placeholder="Enter userId (default: user-1)"
            style={{
              width: '100%', padding: '10px 16px', borderRadius: 8,
              border: '1px solid #475569', background: '#0f172a',
              color: '#e2e8f0', marginBottom: 16, fontSize: '1rem'
            }}
          />
          <button onClick={handleLogin} style={{
            width: '100%', padding: '10px', borderRadius: 8,
            border: 'none', background: '#38bdf8', color: '#0f172a',
            fontWeight: 600, cursor: 'pointer', fontSize: '1rem'
          }}>
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ color: '#e2e8f0', margin: 0 }}>&#128276; Notifications</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <NotificationBell />
          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{userId}</span>
          <button onClick={logout} style={{
            padding: '6px 16px', borderRadius: 8, border: 'none',
            background: '#475569', color: 'white', cursor: 'pointer', fontSize: '0.85rem'
          }}>Logout</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {(['dashboard', 'notifications', 'settings'] as const).map(p => (
          <button key={p} onClick={() => setPage(p)} style={{
            padding: '8px 20px', borderRadius: 8, border: 'none',
            background: page === p ? '#38bdf8' : '#1e293b',
            color: page === p ? '#0f172a' : '#94a3b8',
            fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize'
          }}>{p}</button>
        ))}
      </div>

      {page === 'dashboard' && <Dashboard />}
      {page === 'notifications' && <NotificationsPage />}
      {page === 'settings' && <SettingsPage />}

      {selectedNotification && (
        <NotificationDetail
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
        />
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
