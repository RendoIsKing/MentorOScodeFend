"use client";

import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import ProfileHeaderMobile from "@/components/profile-header/ProfileHeaderMobile";
import ProfileHeaderDesktop from "@/components/profile-header/ProfileHeaderDesktop";
import ProfileNavbar from "@/components/profile-navbar";
import FeedFooter from "@/components/feed/feed-footer";
import ContentUploadProvider from "@/context/open-content-modal";
import { useGetUserDetailsByUserNameQuery } from "@/redux/services/haveme/user";
import { notFound, useParams } from "next/navigation";
import Error from "next/error";

export default function UserPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isMobile } = useClientHardwareInfo();
  const userName = useParams();

  const { userDetailsData, isUserDetailsLoading, isError, isFetching } =
    useGetUserDetailsByUserNameQuery(
      { userName: String(userName.uid || '').toLowerCase() },
      {
        selectFromResult: ({ data, isLoading, isError, isFetching }) => {
          return {
            userDetailsData: data?.data,
            isUserDetailsLoading: isLoading,
            isError,
            isFetching,
          };
        },
      }
    );

  // Be resilient to username casing or temporary fetch errors: don't hard 404 the whole page
  // Let child sections render their own fallbacks while header retries
  // If you want a 404, we can switch back after stabilizing username matching
  return (
    <>
      {isMobile ? (
        <>
          <ProfileNavbar />
          <ContentUploadProvider>
            <ProfileHeaderMobile />
          </ContentUploadProvider>
          <div className="pb-24">{children}</div>
          <FeedFooter />
        </>
      ) : (
        <>
          <ContentUploadProvider>
            <ProfileHeaderDesktop />
          </ContentUploadProvider>
          {children}
        </>
      )}
    </>
  );
}
