import { useCallback, useContext, useMemo } from "react";
import { NotificationContext } from "../context/NotificationContext";

export function useNotification() {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }

  const success = useCallback(
    (message, duration = 3000) => context.showNotification(message, "success", duration),
    [context]
  );
  const error = useCallback(
    (message, duration = 4000) => context.showNotification(message, "error", duration),
    [context]
  );
  const info = useCallback(
    (message, duration = 3000) => context.showNotification(message, "info", duration),
    [context]
  );
  const warning = useCallback(
    (message, duration = 3000) => context.showNotification(message, "warning", duration),
    [context]
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
