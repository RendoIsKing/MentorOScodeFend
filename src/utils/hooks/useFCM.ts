import { useEffect, useState } from "react";
import useFCMToken from "./useFCMToken";
import { messaging } from "../firebase";
import { MessagePayload, onMessage } from "firebase/messaging";
import { notificationsSupported } from "@/lib/notifySupport";

const useFCM = () => {
  const fcmToken = useFCMToken();
  const [messages, setMessages] = useState<MessagePayload[]>([]);

  useEffect(() => {
    if (!notificationsSupported) return;
    if (!("serviceWorker" in navigator)) return;

    const fcmmessaging = messaging();
    if (!fcmmessaging) return; // Firebase not configured in this env
    const unsubscribe = onMessage(fcmmessaging, (payload) => {
      setMessages((messages) => [...messages, payload]);
    });

    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .catch(function () {});

    return () => {
      try { unsubscribe(); } catch {}
    };
  }, [fcmToken]);
  return { fcmToken, messages };
};

export default useFCM;
