import { useCallback, useContext, useMemo } from "react";
import { NotificationContext } from "../context/NotificationContext";

export function useNotification() {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }

  const { showNotification } = context;

  const success = useCallback(
    (message, duration = 3000) => showNotification(message, "success", duration),
    [showNotification]
  );
  const error = useCallback(
    (message, duration = 4000) => showNotification(message, "error", duration),
    [showNotification]
  );
  const info = useCallback(
    (message, duration = 3000) => showNotification(message, "info", duration),
    [showNotification]
  );
  const warning = useCallback(
    (message, duration = 3000) => showNotification(message, "warning", duration),
    [showNotification]
  );

  return useMemo(
    () => ({
      success,
      error,
      info,
      warning,
    }),
    [success, error, info, warning]
  );
}
