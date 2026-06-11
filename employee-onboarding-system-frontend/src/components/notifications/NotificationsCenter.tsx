import { useEffect, useState } from 'react';
import { notificationApi } from '../../api/notificationApi';
import type { UserRole } from '../../types/auth';
import type { NotificationItem } from '../../types/notification';
import '../../styles/NotificationsCenter.css';

type Props = {
    role: UserRole;
};

function NotificationsCenter({ role }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const loadNotifications = async () => {
    const [items, count] = await Promise.all([
        notificationApi.getAll(),
        notificationApi.getUnreadCount(),
    ]);

    setNotifications(items);
    setUnreadCount(count);
  };

    useEffect(() => {
        loadNotifications();
    }, [role]);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
            setIsOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    const handleToggle = async () => {
        setIsOpen((prev) => !prev);
        await loadNotifications();
    };

    const handleMarkAsRead = async (id: number) => {
        await notificationApi.markAsRead(id);
        await loadNotifications();
    };

    const handleMarkAllAsRead = async () => {
        await notificationApi.markAllAsRead();
        await loadNotifications();
    };

  return (
    <div className="notifications-wrapper">
        <button className="notifications-button" onClick={handleToggle}>
            Notifications
            {unreadCount > 0 && <span className="notifications-badge">{unreadCount}</span>}
        </button>

        {isOpen && (
            <div className="notifications-panel">
            <div className="notifications-header">
                <h3>Notifications</h3>

                <div className="notifications-header-actions">
                    {notifications.length > 0 && (
                    <button
                        className="mark-all-button"
                        onClick={handleMarkAllAsRead}
                    >
                        Mark all as read
                    </button>
                    )}

                    <button
                        className="close-notifications-button"
                        onClick={() => setIsOpen(false)}
                        aria-label="Close notifications"
                        >
                        ×
                    </button>
                </div>
            </div>

            {notifications.length === 0 && (
                <p className="notifications-empty">No notifications yet.</p>
            )}

            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`notification-item ${
                        notification.read ? 'notification-read' : 'notification-unread'
                    }`}
                >
                <div>
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <span>{new Date(notification.createdAt).toLocaleString()}</span>
                </div>

                {!notification.read && (
                    <button onClick={() => handleMarkAsRead(notification.id)}>
                        Read
                    </button>
                )}
                </div>
            ))}
            </div>
        )}
    </div>
  );
}

export default NotificationsCenter;