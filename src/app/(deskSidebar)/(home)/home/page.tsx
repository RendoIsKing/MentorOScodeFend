"use client";
import React, { useEffect } from "react";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import HomeFeedCarousel from "@/components/shared/home-feed-carousel";
import useFCM from "@/utils/hooks/useFCM";
import { useUpdateFCMTokenMutation } from "@/redux/services/haveme/notifications";

const Home = () => {
  const { isMobile, orientation } = useClientHardwareInfo();
  const { fcmToken } = useFCM();

  const [updateFCMTokenTrigger] = useUpdateFCMTokenMutation();

  useEffect(() => {
    if (fcmToken && fcmToken !== "") {
      let fcmTokenObj = {
        fcm_token: fcmToken,
      };
      updateFCMTokenTrigger(fcmTokenObj)
        .unwrap()
        .then((res) => {
          console.log("FCM Token updated successfully", res);
        })
        .catch((err) => {
          console.log("Error updating FCM token");
          // Handle error here if needed. For now, we just log it.
          console.error(err);
        });
    }
  }, [fcmToken]);

  return (
    <div className="min-h-[100dvh] bg-background">
      <main className="mx-auto max-w-[680px] px-4 pb-28">
        <HomeFeedCarousel isMobile={isMobile} />
      </main>
    </div>
  );
};

export default Home;
