import { Notification } from '../../types/notification';
import { formatDate } from '../../utils/formatDate';

interface Props {
  notification: Notification;
  onClose: () => void;
}

export default function NotificationDetail({ notification, onClose }: Props) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }} onClick={onClose}>
      <div style={{
        background: '#1e293b', borderRadius: 16, padding: 32,
        maxWidth: 500, width: '90%', border: '1px solid #334155'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ color: '#38bdf8', margin: 0 }}>
            {notification.type.replace(/_/g, ' ').toUpperCase()}
          </h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#94a3b8',
            fontSize: '1.2rem', cursor: 'pointer'
          }}>&times;</button>
        </div>
        <div style={{ color: '#e2e8f0', marginBottom: 12 }}>
          {Object.entries(notification.payload).map(([key, value]) => (
            <p key={key}><strong>{key}:</strong> {String(value)}</p>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <span style={{
            padding: '4px 12px', borderRadius: 12,
            background: notification.status === 'delivered' ? '#22c55e33' : '#f59e0b33',
            color: notification.status === 'delivered' ? '#22c55e' : '#f59e0b',
            fontSize: '0.8rem', fontWeight: 600
          }}>{notification.status}</span>
          <span style={{
            padding: '4px 12px', borderRadius: 12,
            background: '#6366f133', color: '#6366f1',
            fontSize: '0.8rem', fontWeight: 600
          }}>{notification.priority}</span>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.8rem' }}>
          {formatDate(notification.createdAt)}
        </p>
      </div>
    </div>
  );
}
