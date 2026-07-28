import { useAuth } from '../../context/AuthContext';
import { useNotificationContext } from '../../context/NotificationContext';
import { formatDate } from '../../utils/formatDate';

export default function Dashboard() {
  const { userId } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotificationContext();

  const recentNotifications = notifications.slice(0, 5);
  const stats = {
    total: notifications.length,
    unread: unreadCount,
    delivered: notifications.filter(n => n.status === 'delivered').length,
    failed: notifications.filter(n => n.status === 'failed').length
  };

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ color: '#e2e8f0', marginBottom: 20 }}>Dashboard</h2>
      <p style={{ color: '#94a3b8', marginBottom: 24 }}>Welcome back, {userId}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total', value: stats.total, color: '#38bdf8' },
          { label: 'Unread', value: stats.unread, color: '#f59e0b' },
          { label: 'Delivered', value: stats.delivered, color: '#22c55e' },
          { label: 'Failed', value: stats.failed, color: '#ef4444' }
        ].map(stat => (
          <div key={stat.label} style={{
            background: '#1e293b', borderRadius: 12, padding: 20,
            border: '1px solid #334155', textAlign: 'center'
          }}>
            <p style={{ color: stat.color, fontSize: '2rem', fontWeight: 700, margin: 0 }}>{stat.value}</p>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>{stat.label}</p>
          </div>
        ))}
      </div>

      <h3 style={{ color: '#e2e8f0', marginBottom: 12 }}>Recent Notifications</h3>
      {recentNotifications.length === 0 ? (
        <p style={{ color: '#64748b' }}>No notifications yet</p>
      ) : (
        recentNotifications.map(n => (
          <div key={n._id} onClick={() => !n.readAt && markAsRead(n._id)} style={{
            background: '#1e293b', border: `1px solid ${!n.readAt ? '#38bdf8' : '#334155'}`,
            borderRadius: 12, padding: 16, marginBottom: 8,
            cursor: 'pointer', borderLeft: !n.readAt ? '3px solid #38bdf8' : undefined
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong style={{ color: '#38bdf8', fontSize: '0.9rem' }}>
                {n.type.replace(/_/g, ' ').toUpperCase()}
              </strong>
              <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{formatDate(n.createdAt)}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
