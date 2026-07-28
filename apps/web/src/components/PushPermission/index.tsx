import { usePushNotifications } from '../../hooks/usePushNotifications';

export default function PushPermission() {
  const { permission, requestPermission } = usePushNotifications();

  if (permission === 'granted') return null;

  return (
    <div style={{
      background: '#1e293b', border: '1px solid #334155',
      borderRadius: 12, padding: 16, marginBottom: 16, textAlign: 'center'
    }}>
      <p style={{ color: '#e2e8f0', marginBottom: 12 }}>
        Enable push notifications to stay updated
      </p>
      <button onClick={requestPermission} style={{
        padding: '8px 20px', borderRadius: 8, border: 'none',
        background: '#6366f1', color: 'white', cursor: 'pointer', fontWeight: 600
      }}>
        Enable Push
      </button>
    </div>
  );
}
