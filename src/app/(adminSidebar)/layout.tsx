"use client";

import { useMediaQuery } from "@/hooks/use-media-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import AdminSideBar from "@/components/admin-sidebar";
import { Suspense } from "react";

export default function AdminSideBarPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  return (
    <>
      {isMobile ? (
        <div>{children}</div>
      ) : (
        <div className="flex">
          <div className="flex flex-col">
            <AdminSideBar />
          </div>
          <ScrollArea className="flex flex-col flex-grow h-screen">
            <Suspense>{children}</Suspense>
          </ScrollArea>
        </div>
      )}
    </>
  );
}
