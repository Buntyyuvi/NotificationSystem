import { useEffect, useState } from 'react';
import { socket } from './config/socket';
import AuthToggle from './components/AuthToggle';
import NotificationList from './components/NotificationList';

interface LiveNotification {
  eventId: string;
  type: string;
  title: string;
  body: string;
  timestamp: string;
}

function App() {
  const [connected, setConnected] = useState(false);
  const [liveNotifications, setLiveNotifications] = useState<LiveNotification[]>([]);

  useEffect(() => {
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('notification:new', (data: LiveNotification) => {
      setLiveNotifications(prev => [data, ...prev]);
    });

    if (socket.connected) setConnected(true);

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('notification:new');
    };
  }, []);

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

export default App;