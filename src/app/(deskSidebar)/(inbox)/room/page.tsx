"use client";
import React from "react";
import InboxBody from "@/components/inbox-body";
import { useUserOnboardingContext } from "@/context/UserOnboarding";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";
import dynamic from "next/dynamic";

// Lazy-load the notifications page component to avoid duplicate data fetching on desktop
const NotificationsPage = dynamic(() => import("@/app/(deskSidebar)/notification/page").then(m => m.default), { ssr: false });

export default function InboxPageResponsive() {
  const userData = useUserOnboardingContext();
  const { isMobile } = useClientHardwareInfo();

  if (!userData) return <div>Loading.......</div>;

  if (!isMobile) {
    return (
      <div className="h-screen">
        <InboxBody />
      </div>
    );
  }

  // Mobile: provide Chats/Notifications tabs inside Inbox
  const [tab, setTab] = React.useState<"chats" | "notifications">("chats");

  return (
    <div className="h-screen">
      <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="h-full">
        <div className="sticky top-[env(safe-area-inset-top)] z-10 bg-background/80 backdrop-blur">
          <TabsList className="mx-auto w-full max-w-[680px] grid grid-cols-2">
            <TabsTrigger value="chats">Chats</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="chats" className="m-0 p-0">
          <InboxBody />
        </TabsContent>
        <TabsContent value="notifications" className="m-0 p-0">
          <NotificationsPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
