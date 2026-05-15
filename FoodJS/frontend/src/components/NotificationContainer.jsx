import { useContext } from "react";
import { NotificationContext } from "../context/NotificationContext";

export function NotificationContainer() {
  const { notifications, removeNotification } = useContext(NotificationContext);

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification notification-${notification.type}`}
        >
          <div className="notification-content">
            <div className="notification-icon">
              {notification.type === "success" && <span>✓</span>}
              {notification.type === "error" && <span>✕</span>}
              {notification.type === "warning" && <span>⚠</span>}
              {notification.type === "info" && <span>ℹ</span>}
            </div>
            <p className="notification-message">{notification.message}</p>
          </div>
          <button
            className="notification-close"
            onClick={() => removeNotification(notification.id)}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
