import { useEffect, useState } from 'react';
import { socket } from './config/socket';
import AuthToggle from './components/AuthToggle';

interface Notification {
  eventId: string;
  type: string;
  title?: string;
  body?: string;
  timestamp?: string;
}

function App() {
  const [connected, setConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    console.log('Socket instance:', socket);
    console.log('Socket connected?', socket.connected);
    console.log('Socket id:', socket.id);

    if (!socket.connected) {
      console.log('Forcing connect...');
      socket.connect();
    }

    socket.on('connect', () => {
      console.log('✅ CONNECT EVENT FIRED, id:', socket.id);
      setConnected(true);
      setSocketId(socket.id || null);
    });

    socket.on('disconnect', () => {
      console.log('⚠️ DISCONNECT EVENT FIRED');
      setConnected(false);
      setSocketId(null);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ CONNECT_ERROR:', err.message);
    });

    // THIS IS THE NEW PART - listen for notifications
    socket.on('notification:new', (data: Notification) => {
      console.log('🔔 NOTIFICATION RECEIVED:', data);
      setNotifications(prev => [data, ...prev]);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('notification:new');
    };
  }, []);

  return (
    <div style={{ padding: 40, fontFamily: 'system-ui', maxWidth: 600, margin: '0 auto' }}>
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
        {connected ? `🟢 Connected: ${socketId}` : '🔴 Disconnected'}
      </div>

      <AuthToggle />

      {/* NOTIFICATION CARDS */}
      <div style={{ marginTop: 32 }}>
        <h2 style={{ color: '#e2e8f0', marginBottom: 16 }}>Notifications</h2>
        
        {notifications.length === 0 ? (
          <p style={{ color: '#64748b' }}>No notifications yet. Send one via curl...</p>
        ) : (
          notifications.map((n) => (
            <div 
              key={n.eventId} 
              style={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                animation: 'slideIn 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: '#38bdf8', fontSize: '1rem' }}>
                  {n.type.replace(/_/g, ' ').toUpperCase()}
                </strong>
                <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                  {n.eventId?.slice(0, 8)}...
                </span>
              </div>
              <p style={{ color: '#94a3b8', marginTop: 8, fontSize: '0.9rem' }}>
                {n.body || JSON.stringify(n)}
              </p>
              <p style={{ color: '#475569', marginTop: 8, fontSize: '0.75rem' }}>
                {n.timestamp ? new Date(n.timestamp).toLocaleString() : 'Just now'}
              </p>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: 20, padding: 16, background: '#1e293b', borderRadius: 8 }}>
        <h3 style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>Debug Info</h3>
        <p style={{ color: '#64748b', fontSize: '0.8rem' }}>
          Socket ID: {socketId || 'null'}<br/>
          Connected: {String(socket.connected)}<br/>
          Total Notifications: {notifications.length}
        </p>
      </div>
    </div>
  );
}

export default App;