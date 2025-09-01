export const isBrowser = typeof window !== "undefined";
export const isSecure = isBrowser && (window as any).isSecureContext === true;
export const hasNotificationGlobal = isBrowser && typeof (window as any).Notification !== "undefined";
export const notificationsSupported = isSecure && hasNotificationGlobal;

export type NotifyStatus = "granted" | "denied" | "default" | "unsupported";

export function getNotifyStatus(): NotifyStatus {
  if (!notificationsSupported) return "unsupported";
  return (window as any).Notification.permission as NotifyStatus;
}

export async function requestNotifyPermission(): Promise<NotifyStatus> {
  if (!notificationsSupported) return "unsupported";
  const p = await (window as any).Notification.requestPermission();
  return p as NotifyStatus;
}

export function showLocalNotification(title: string, opts?: NotificationOptions) {
  if (notificationsSupported && (window as any).Notification.permission === "granted") {
    // @ts-ignore
    return new (window as any).Notification(title, opts);
  }
}


