import { useNotificationContext } from '../../context/NotificationContext';
import NotificationList from '../../components/NotificationList';

export default function NotificationsPage() {
  return (
    <div style={{ padding: 20 }}>
      <NotificationList />
    </div>
  );
}
