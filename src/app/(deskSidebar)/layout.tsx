"use client";

import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import Sidebar from "@/components/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTypedSelector } from "@/redux/store";
import { selectIsAuthenticated } from "@/redux/slices/auth";
import { useEffect, useState } from "react";

export default function SideBarPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isMobile } = useClientHardwareInfo();
  const isLoggedIn = useTypedSelector(selectIsAuthenticated);

  return (
    <>
      {isMobile ? (
        <div>{children}</div>
      ) : (
        <>
          <div className="flex">
            <div className="flex flex-col w-[220px] min-w-[200px] max-w-[240px] border-r border-secondary">
              <Sidebar />
            </div>
            <ScrollArea className="flex flex-col flex-grow h-screen">
              {children}
            </ScrollArea>
          </div>
        </>
      )}
    </>
  );
}
