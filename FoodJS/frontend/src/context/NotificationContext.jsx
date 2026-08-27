import { createContext, useState, useCallback, useMemo } from "react";

// The context and its provider intentionally share a module.
// eslint-disable-next-line react-refresh/only-export-components
export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((message, type = "info", duration = 3000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const notification = { id, message, type };

    setNotifications((prev) => {
      const duplicate = prev.some((item) => item.message === message && item.type === type);
      if (duplicate) {
        return prev;
      }

      return [...prev, notification].slice(-4);
    });

    if (duration > 0) {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const contextValue = useMemo(
    () => ({ notifications, showNotification, removeNotification }),
    [notifications, showNotification, removeNotification]
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}
