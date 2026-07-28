import PreferencePanel from '../../components/PreferencePanel';
import PushPermission from '../../components/PushPermission';

export default function SettingsPage() {
  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ color: '#e2e8f0', marginBottom: 20 }}>Settings</h2>
      <PushPermission />
      <PreferencePanel />
    </div>
  );
}
