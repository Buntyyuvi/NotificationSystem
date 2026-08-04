import { useEffect } from 'react';
import AuthToggle from './components/AuthToggle';
import NotificationList from './components/NotificationList';
import {
  NotificationProvider,
  useNotificationContext
} from './context/NotificationContext';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import { usePushNotifications } from './hooks/usePushNotifications';

function AppContent() {
  const { user } = useAuthContext();
  const { connected, liveNotifications, refresh } = useNotificationContext();

  usePushNotifications(user);

  useEffect(() => {
    if (user) {
      void refresh();
    }
  }, [user, refresh]);

  return (
    <div style={{ padding: 40, fontFamily: 'system-ui', maxWidth: 800, margin: '0 auto' }}>
      <h1>🔔 Notification System</h1>

      <div style={{
        display: 'inline-block',
        padding: '6px 16px',
        borderRadius: 20,
        background: connected ? '#22c55e' : '#ef4444',
        color: 'white',
        fontSize: '0.85rem',
        fontWeight: 600,
        marginBottom: 20
      }}>
        {connected ? '🟢 WebSocket Connected' : '🔴 Disconnected'}
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
