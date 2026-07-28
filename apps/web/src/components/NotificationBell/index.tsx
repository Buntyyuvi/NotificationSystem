import { useNotificationContext } from '../../context/NotificationContext';

export default function NotificationBell() {
  const { unreadCount, fetchNotifications, fetchUnreadCount } = useNotificationContext();

  const handleClick = async () => {
    await fetchNotifications();
    await fetchUnreadCount();
  };

  return (
    <button onClick={handleClick} style={{
      position: 'relative', background: 'none', border: 'none',
      fontSize: '1.5rem', cursor: 'pointer', padding: 8
    }}>
      <span role="img" aria-label="notifications">&#128276;</span>
      {unreadCount > 0 && (
        <span style={{
          position: 'absolute', top: 0, right: 0,
          background: '#ef4444', color: 'white',
          borderRadius: '50%', width: 20, height: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.7rem', fontWeight: 700
        }}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}
