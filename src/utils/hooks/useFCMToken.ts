"use client";
import { useEffect, useState } from "react";
import { getToken, onMessage, isSupported } from "firebase/messaging";
import { messaging } from "../firebase";
import useNotificationPermission from "./useNotificationPermission";

const useFCMToken = () => {
  const permission = useNotificationPermission();
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    const retrieveToken = async () => {
      if (typeof window !== "undefined" && "serviceWorker" in navigator) {
        if (permission === "granted") {
          const isFCMSupported = await isSupported();
          if (!isFCMSupported) return;
          const msg = messaging();
          if (!msg) return;
          const token = await getToken(msg, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          });
          setFcmToken(token);
        }
      }
    };
    retrieveToken();
  }, [permission]);

  return fcmToken;
};

export default useFCMToken;
