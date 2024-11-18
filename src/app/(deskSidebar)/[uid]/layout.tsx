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
      { userName: userName.uid as string },
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

  if (isError) {
    return <Error statusCode={404} title="User not found" />;
  }
  return (
    <>
      {" "}
      <>
        {isMobile ? (
          <>
            <ProfileNavbar />
            <ContentUploadProvider>
              <ProfileHeaderMobile />
            </ContentUploadProvider>
            {children}
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
    </>
  );
}
