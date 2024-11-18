"use client";
import React, { useEffect, useState } from "react";
import InnerPageHeader from "@/components/shared/inner-page-header";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import NotificationDescription from "@/components/shared/get-notification-description";
import { ABeeZee } from "next/font/google";
import { useGetNotificationQuery } from "@/redux/services/haveme/notifications";
import { useTypedSelector } from "@/redux/store";
import { selectAllNotifications } from "@/redux/slices/adapters";
import { useInView } from "react-intersection-observer";
import { generateRedirectUrl } from "@/lib/utils";

// TODO: Make this font definition dynamic
const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

const Notification = () => {
  const { ref, inView } = useInView();

  const notificationsData = useTypedSelector(selectAllNotifications);

  const [query, setQuery] = useState({
    page: 1,
    perPage: 10,
  });

  const { data: userNotificationData } = useGetNotificationQuery(query);

  const loadMoreNotifications = () => {
    if (query?.page >= userNotificationData?.meta?.pageCount) return;
    setQuery((prevQuery) => ({
      ...prevQuery,
      page: prevQuery.page + 1,
    }));
  };

  useEffect(() => {
    if (inView && query?.page <= userNotificationData?.meta?.pageCount) {
      loadMoreNotifications();
    }
  }, [inView]);

  const notificationAction = (notificationInfo) => {
    // TODO: Implement notification action logic
    console.log("Notification Action Clicked");
    const urlToOpen = generateRedirectUrl(notificationInfo);
    window.open(urlToOpen, "_blank");
  };

  return (
    <div>
      <InnerPageHeader showBackButton={false} title="Notifications" />
      <Separator />
      <div className="p-6">
        <div className={`pl-1 text-lg ${fontItalic.className}`}>
          <p>Today</p>
        </div>
        {notificationsData?.map((notificationItem) => (
          <div
            className="p-2 cursor-pointer"
            key={notificationItem._id}
            onClick={() => notificationAction(notificationItem)}
          >
            <NotificationDescription
              imageUrl={`/assets/images/Notification/notifications.svg`}
              userImageUrl={`/assets/images/Notification/user-another1.svg`}
              title={notificationItem.title}
              type={notificationItem.type}
              description={notificationItem.description}
            />
          </div>
        ))}
        <div ref={ref}></div>
        {/* -- hiding below component as of now  */}
        {/* <div className={`pl-1 mt-4 text-lg ${fontItalic.className}`}>
          <p>Yesterday</p>
        </div>
        {notificationData?.previousDayNotification?.map((data, index) => (
          <div key={index}>
            <div className="p-2">
              <NotificationDescription
                imageUrl={data?.imageUrl}
                name={data?.name}
                time={data?.time}
                userImageUrl={data?.userImageUrl}
                description={data?.description}
                reply={data?.reply}
              />
            </div>
          </div>
        ))} */}
      </div>
    </div>
  );
};

export default Notification;
