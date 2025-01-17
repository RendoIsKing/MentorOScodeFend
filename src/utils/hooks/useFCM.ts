import { useEffect, useState } from "react";
import useFCMToken from "./useFCMToken";
import { messaging } from "../firebase";
import { MessagePayload, onMessage } from "firebase/messaging";

const useFCM = () => {
  const fcmToken = useFCMToken();
  const [messages, setMessages] = useState<MessagePayload[]>([]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const fcmmessaging = messaging();
      const unsubscribe = onMessage(fcmmessaging, (payload) => {
        setMessages((messages) => [...messages, payload]);
      });

      // Service worker method

      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then(function (registration) {
          console.log("Service Worker registered");
        })
        .catch(function (err) {
          console.log("Service Worker registration failed:", err);
        });

      return () => {
        return unsubscribe();
      };
    }
  }, [fcmToken]);
  return { fcmToken, messages };
};

export default useFCM;
