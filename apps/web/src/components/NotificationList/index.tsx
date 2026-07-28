import { useNotifications } from '../../hooks/useNotifications';
import styles from './styles.module.css';

export default function NotificationList() {
  const { notifications, unreadCount, loading, markAsRead, refresh } = useNotifications();

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Notifications</h2>
        <span className={styles.badge}>{unreadCount} unread</span>
        <button onClick={refresh} className={styles.refreshBtn}>Refresh</button>
      </div>

      {notifications.length === 0 ? (
        <p className={styles.empty}>No notifications yet</p>
      ) : (
        <div className={styles.list}>
          {notifications.map(n => (
            <div 
              key={n._id} 
              className={`${styles.item} ${!n.readAt ? styles.unread : ''}`}
              onClick={() => !n.readAt && markAsRead(n._id)}
            >
              <div className={styles.itemHeader}>
                <strong>{n.type.replace(/_/g, ' ').toUpperCase()}</strong>
                {!n.readAt && <span className={styles.dot} />}
              </div>
              <p className={styles.body}>{JSON.stringify(n.payload)}</p>
              <span className={styles.time}>
                {new Date(n.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}