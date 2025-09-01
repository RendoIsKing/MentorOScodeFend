"use client";
import { useEffect, useState } from "react";
import { notificationsSupported, getNotifyStatus } from "@/lib/notifySupport";

const useNotificationPermissionStatus = () => {
  const [permission, setPermission] = useState<"granted" | "denied" | "default" | "unsupported">("default");

  useEffect(() => {
    if (!notificationsSupported) {
      setPermission("unsupported");
      return;
    }

    const handler = () => setPermission(getNotifyStatus());
    handler();
    
    // Only request permission if supported
    if (typeof window !== "undefined" && (window as any).Notification) {
      (window as any).Notification.requestPermission().then(handler);
    }

    // Only query permissions if supported
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: "notifications" as any })
        .then((notificationPerm) => {
          notificationPerm.onchange = handler;
        })
        .catch(() => {
          // Permissions API not supported
        });
    }
  }, []);

  return permission;
};

export default useNotificationPermissionStatus;
