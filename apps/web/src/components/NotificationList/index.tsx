import { useNotificationContext } from '../../context/NotificationContext';
import { formatDate } from '../../utils/formatDate';
import styles from './styles.module.css';

export default function NotificationList() {
  const {
    notifications,
    unreadCount,
    loading,
    hasMore,
    markAsRead,
    markAllAsRead,
    refresh,
    loadMore
  } = useNotificationContext();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Notifications</h2>
        <span className={styles.badge}>{unreadCount} unread</span>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className={styles.markAllBtn}>
            Mark all read
          </button>
        )}
        <button onClick={() => { void refresh(); }} className={styles.refreshBtn}>Refresh</button>
      </div>

      {loading && notifications.length === 0 ? (
        <div className={styles.loading}>Loading...</div>
      ) : notifications.length === 0 ? (
        <p className={styles.empty}>No notifications yet</p>
      ) : (
        <>
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
                <p className={styles.body}>
                  {Object.keys(n.payload).length > 0
                    ? JSON.stringify(n.payload)
                    : 'No content'}
                </p>
                <span className={styles.time}>{formatDate(n.createdAt)}</span>
              </div>
            ))}
          </div>

          {hasMore && (
            <button onClick={loadMore} className={styles.loadMoreBtn} disabled={loading}>
              {loading ? 'Loading...' : 'Load more'}
            </button>
          )}
        </>
      )}
    </div>
  );
}
