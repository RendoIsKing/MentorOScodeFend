import InnerPageHeader from "@/components/shared/inner-page-header";
import SystemNotificationWithData from "@/components/shared/system-notification";
import { Label } from "@/components/ui/label";
import React from "react";

interface systemNotification {
  notifactionName: string;
  description: string;
}
const SystemNotification = () => {
  const systemNotificationData: systemNotification[] = [
    {
      notifactionName: "Notification 1",
      description:
        "Lorem ipsum dolor sit amet. Et quisquam internos aut facilis laborum ut quidem numquam sit nulla reiciendis vel inventore blanditiis rem quia voluptas. Sed amet autem ut aperiam labore At voluptate quam aut sapiente autem.",
    },
    {
      notifactionName: "Notification 2",
      description:
        "Lorem ipsum dolor sit amet. Et quisquam internos aut facilis laborum ut quidem numquam sit nulla reiciendis vel inventore blanditiis rem quia voluptas. Sed amet autem ut aperiam labore At voluptate quam aut sapiente autem.",
    },
    {
      notifactionName: "Notification 3",
      description:
        "Lorem ipsum dolor sit amet. Et quisquam internos aut facilis laborum ut quidem numquam sit nulla reiciendis vel inventore blanditiis rem quia voluptas. Sed amet autem ut aperiam labore At voluptate quam aut sapiente autem.",
    },
    {
      notifactionName: "Notification 4",
      description:
        "Lorem ipsum dolor sit amet. Et quisquam internos aut facilis laborum ut quidem numquam sit nulla reiciendis vel inventore blanditiis rem quia voluptas. Sed amet autem ut aperiam labore At voluptate quam aut sapiente autem.",
    },
    {
      notifactionName: "Notification 5",
      description:
        "Lorem ipsum dolor sit amet. Et quisquam internos aut facilis laborum ut quidem numquam sit nulla reiciendis vel inventore blanditiis rem quia voluptas. Sed amet autem ut aperiam labore At voluptate quam aut sapiente autem.",
    },
  ];

  return (
    <div className="p-4">
      <InnerPageHeader showBackButton={true} title="All System Notifications" />
      <div className="text-muted-foreground mt-8 pl-2.5">
        <Label className="text-2xl ">Previous</Label>
      </div>
      {systemNotificationData?.map((data, index) => (
        <div className="p-4" key={index}>
          <SystemNotificationWithData
            notifactionName={data?.notifactionName}
            description={data?.description}
          />
        </div>
      ))}
    </div>
  );
};

export default SystemNotification;
