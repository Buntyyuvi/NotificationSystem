import { usePreferences } from '../../hooks/usePreferences';

const CHANNEL_LABELS: Record<string, string> = {
  websocket: 'Real-time (WebSocket)',
  push: 'Push Notifications',
  email: 'Email',
  sms: 'SMS',
  slack: 'Slack'
};

export default function PreferencePanel() {
  const { preferences, loading, updatePreference } = usePreferences();

  if (loading) return <p style={{ color: '#64748b' }}>Loading...</p>;

  return (
    <div style={{
      background: '#1e293b', borderRadius: 16, padding: 24,
      maxWidth: 500, margin: '20px auto'
    }}>
      <h2 style={{ color: '#e2e8f0', marginBottom: 20 }}>Notification Preferences</h2>
      {preferences.map(pref => (
        <div key={pref.channel} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 0', borderBottom: '1px solid #334155'
        }}>
          <span style={{ color: '#e2e8f0' }}>
            {CHANNEL_LABELS[pref.channel] || pref.channel}
          </span>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => updatePreference(pref.channel, { enabled: !pref.enabled })}
              style={{
                padding: '6px 16px', borderRadius: 8, border: 'none',
                background: pref.enabled ? '#22c55e' : '#475569',
                color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem'
              }}
            >
              {pref.enabled ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => updatePreference(pref.channel, { digestMode: !pref.digestMode })}
              style={{
                padding: '6px 16px', borderRadius: 8, border: 'none',
                background: pref.digestMode ? '#6366f1' : '#475569',
                color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem'
              }}
            >
              {pref.digestMode ? 'Digest' : 'Instant'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
