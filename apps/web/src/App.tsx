import { useEffect } from 'react';
import AuthToggle from './components/AuthToggle';
import NotificationList from './components/NotificationList';
import {
  NotificationProvider,
  useNotificationContext
} from './context/NotificationContext';
import { AuthProvider, useAuthContext } from './context/AuthContext';

function AppContent() {
  const { user } = useAuthContext();
  const { connected, liveNotifications, refresh } = useNotificationContext();

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

      <AuthToggle />

      {/* Live notifications */}
      {liveNotifications.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ color: '#e2e8f0' }}>🔴 Live</h3>
          {liveNotifications.map(n => (
            <div key={n.eventId} style={{
              background: '#1e293b',
              border: '1px solid #38bdf8',
              borderRadius: 12,
              padding: 12,
              marginBottom: 8
            }}>
              <strong style={{ color: '#38bdf8' }}>{n.title}</strong>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{n.body}</p>
            </div>
          ))}
        </div>
      )}

      {/* Notification history from API */}
      <NotificationList />
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
