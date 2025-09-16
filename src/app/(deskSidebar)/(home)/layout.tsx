"use client";
import React from "react";
import FeedFooter from "@/components/feed/feed-footer";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import PendingVerification from "@/components/shared/pending-verification";
import {
  IAppBanner,
  useNotificationBannerContext,
} from "@/context/NotificationBanner";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isMobile } = useClientHardwareInfo();
  const { banners } = useNotificationBannerContext();
  return (
    <>
      {isMobile && (
        <div className="">
          {children}
          <FeedFooter />
        </div>
      )}

      {!isMobile && (
        <>
          {banners.content.map((banner: IAppBanner) => {
            return (
              <PendingVerification
                key={banner.id}
                title={banner.title}
                type={banner.type}
                imgSrc={banner.imgSrc}
                description={banner.description}
              />
            );
          })}
          <div className="flex justify-center">{children}</div>
        </>
      )}
    </>
  );
}
