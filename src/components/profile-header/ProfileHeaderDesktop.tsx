"use client";
import { Avatar } from "@radix-ui/react-avatar";
import React, { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { useParams, usePathname, useRouter } from "next/navigation";
import UploadStory from "../uploadStory";
import ContentUploadOptions from "../upload-content-options";
import ProfileButtons from "../profie-login-buttons";
import ShareOthersPopup from "../shared/shareOthers/shareOthersPopup";
import SendMessagePopup from "../shared/popup/send-message-popup";
import NotificationSettingModal from "../notification-setting-modal";
import FollowerPopup from "../shared/popup/followers";
import { Separator } from "../ui/separator";
import { AvatarFallback, AvatarImage } from "../ui/avatar";
import UserStories from "@/components/stories/user-story";

import { Ban, BellOff, Ellipsis, Info, PinIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import ReportProblemAlert from "../report-problem";
import SocialInstagram from "@/assets/images/my-Profile/instagram.svg";
import SocialYoutube from "@/assets/images/my-Profile/youtube.svg";
import SocialTiktok from "@/assets/images/my-Profile/tiktok.svg";
import { ABeeZee } from "next/font/google";
import { useUserOnboardingContext } from "@/context/UserOnboarding";
import { useGetUserProfilePhotoQuery } from "@/redux/services/haveme/user";
import { useGetUserDetailsQuery } from "@/redux/services/haveme";
import { useGetUserDetailsByUserNameQuery } from "@/redux/services/haveme/user";
import { baseServerUrl, cn } from "@/lib/utils";

const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

function ProfileHeaderDesktop() {
  const router = useRouter();
  const userName = useParams();

  const { data, isLoading, isError } = useGetUserDetailsQuery();

  // const cleanedUserName = useMemo(() => {
  //   return pathname.replace(/^\//, "");
  // }, [pathname]);
  const isOwnProfile = useMemo(() => {
    return data?.data?.userName === userName.uid;
  }, [data]);

  const { userDetailsData, isUserDetailsLoading } =
    useGetUserDetailsByUserNameQuery(
      { userName: userName.uid as string },
      {
        skip: isOwnProfile,
        selectFromResult: ({ data, isLoading }) => {
          return {
            userDetailsData: data?.data,
            isUserDetailsLoading: isLoading,
          };
        },
      }
    );

  const [openShareModel, setOpenShareModel] = useState(false);
  const [openChatPopup, setOpenChatPopup] = useState(false);
  const [isNotificationModal, setIsNotificationModal] = useState(false);
  const [isSeeMoreOption, setIsSeeMoreOption] = useState(false);
  const [isReportUserOpen, setIsReportUserOpen] = useState(false);
  const { user } = useUserOnboardingContext();
  const [showFullText, setShowFullText] = useState(false);

  const { data: userPhotoData } = useGetUserProfilePhotoQuery(user?.photoId, {
    skip: !user?.photoId,
  });

  const bioText = isOwnProfile
    ? data?.data?.bio || userDetailsData?.bio || ""
    : "";

  const maxLength = 150;

  const toggleVisibility = () => {
    setShowFullText(!showFullText);
    setIsSeeMoreOption(!isSeeMoreOption);
  };

  if (isError) {
    return <h1>Error fetching</h1>;
  }
  return (
    <div>
      <div className="relative">
        <img
          className="w-full h-64 object-cover"
          src={
            isOwnProfile
              ? `${baseServerUrl}/${data?.data?.coverPhoto?.path}`
              : `${baseServerUrl}/${userDetailsData?.coverPhoto?.path}`
          }
          alt="aldi sigun on Unsplash"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40">
          {!isOwnProfile && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="float-end inline-block">
                    <Button
                      variant={"link"}
                      size={"icon"}
                      className=" bg-muted-foreground/50 m-8"
                    >
                      <Ellipsis
                        // onClick={() => router.push("/more-settings")}
                        strokeWidth={3}
                        className="text-white"
                      />
                    </Button>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="p-2 mx-10 -my-5 border-[#0B0F14] light:bg-secondary dark:bg-[#0B0F14] inline-block"
                  side="bottom"
                >
                  <div className="flex items-center justify-between px-4 py-2 my-4">
                    <div className="flex items-center space-x-2 mr-4">
                      <BellOff />
                      <span>Mute Notifications</span>
                    </div>
                    <Switch id="mute-notifications" />
                  </div>

                  <Button
                    variant={"link"}
                    className="w-full text-destructive flex justify-start gap-2"
                  >
                    {" "}
                    <Ban /> Block
                  </Button>

                  <Button
                    variant={"link"}
                    className="flex justify-between text-destructive"
                    onClick={() => setIsReportUserOpen(true)}
                  >
                    <div className="flex gap-2">
                      <Info />
                      Report User
                    </div>
                  </Button>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
      <div className="flex px-4 -mt-24 ">
        <Avatar className="block relative w-56">
          <img
            alt="profile image"
            src={
              isOwnProfile
                ? `${baseServerUrl}/${data?.data?.photo?.path}`
                : `${baseServerUrl}/${userDetailsData?.photo?.path}`
            }
            className="rounded-full mx-2 lg:h-40 lg:w-40 object-cover"
          />
        </Avatar>
        <div className="flex gap-8 flex-col relative w-full m-8">
          <div>
            <div className="flex gap-32 justify-between">
              <div>
                <div className="flex gap-8">
                  <h1 className=" text-2xl text-gray-100">
                    {isOwnProfile
                      ? data?.data?.fullName
                      : userDetailsData?.fullName}
                  </h1>
                  {isOwnProfile ? (
                    <img
                      onClick={() => setOpenShareModel(true)}
                      src="/assets/images/my-Profile/share.svg"
                      className="cursor-pointer"
                      alt="share"
                    />
                  ) : (
                    <div className="flex w-[84px] justify-between">
                      <img
                        onClick={() => setOpenChatPopup(true)}
                        src="/assets/images/search-user-profile/inbox-message.svg"
                        className="cursor-pointer"
                        alt="message"
                      />

                      <img
                        src="/assets/images/Sidebar/notification-bing.svg"
                        className="cursor-pointer"
                        alt="notification"
                        onClick={() => setIsNotificationModal(true)}
                      />
                    </div>
                  )}
                </div>
                <p className="text-gray-300">
                  @
                  {isOwnProfile
                    ? data?.data?.userName
                    : userDetailsData?.userName}
                </p>
              </div>
              <div>
                <div
                  className={cn("grid gap-2 text-center", {
                    "grid-cols-5": isOwnProfile,
                    "grid-cols-4": !isOwnProfile,
                  })}
                >
                  <FollowerPopup
                    isOwnProfile={isOwnProfile}
                    followersCount={
                      isOwnProfile
                        ? data?.data?.followersCount
                        : userDetailsData?.followersCount
                    }
                    followingCount={
                      isOwnProfile
                        ? data?.data?.followingCount
                        : userDetailsData?.followingCount
                    }
                    // sub count is not coming from api currently
                    subscribersCount={
                      isOwnProfile
                        ? data?.data?.subscriberCount
                        : userDetailsData?.subscriberCount
                    }
                  />
                  <div>
                    <p
                      className={`text-lg  text-white ${fontItalic.className}`}
                    >
                      {isOwnProfile
                        ? data?.data?.postsCount
                        : userDetailsData?.postsCount || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Posts</p>
                  </div>
                  <div>
                    <p
                      className={`text-lg  text-white ${fontItalic.className}`}
                    >
                      {isOwnProfile
                        ? data?.data?.totalLikes
                        : userDetailsData?.totalLikes || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Likes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <div className="flex flex-col gap-6 pr-4 w-4/6">
              <div className="text-sm">
                <p className="text-muted-foreground">Bio</p>
                <p className="pb-2 w-[75%]">
                  {bioText.length >= maxLength ? (
                    <>
                      {showFullText
                        ? bioText
                        : `${bioText.slice(0, maxLength)}... `}
                    </>
                  ) : (
                    bioText
                  )}
                  {
                    <span
                      className="cursor-pointer text-primary"
                      onClick={toggleVisibility}
                    >
                      {showFullText ? " Less Details" : " More Details"}
                    </span>
                  }
                </p>
                {isSeeMoreOption && (
                  <div className="flex mt-4 items-center">
                    <SocialInstagram className="stroke-foreground" />
                    <h1 className="ml-4 text-base mr-4">
                      {isOwnProfile
                        ? data?.data?.instagramLink
                        : userDetailsData?.instagramLink}
                    </h1>
                    <SocialYoutube className="fill-foreground" />
                    <h1 className="ml-4 text-base mr-4">
                      {isOwnProfile
                        ? data?.data?.youtubeLink
                        : userDetailsData?.youtubeLink}
                    </h1>
                    <SocialTiktok className="stroke-foreground" />
                    <h1 className="ml-4 text-base mr-4">
                      {isOwnProfile
                        ? data?.data?.tiktokLink
                        : userDetailsData?.tiktokLink}
                    </h1>
                  </div>
                )}
                <Separator />
              </div>
              <div className="flex">
                {/* <UploadStory /> */}
                {/* {!isOwnProfile && <UserStories />} */}
                <ContentUploadOptions />
              </div>
            </div>
            {isOwnProfile ? (
              <div className="flex flex-col">
                <div className="flex">
                  <Button
                    variant={"secondary"}
                    size="sleek"
                    className={`py-2 px-4  rounded-3xl ${fontItalic.className}`}
                    onClick={() => router.push("/edit-profile")}
                  >
                    Edit Profile
                  </Button>
                  <Button
                    variant={"secondary"}
                    size="sleek"
                    className="ml-4 py-2 px-4 italic lg: rounded-3xl"
                    onClick={() => router.push("/edit-avatar")}
                  >
                    Edit Avatar
                  </Button>
                </div>
                <div className="mt-2 flex justify-end">
                  <Button
                    variant={"secondary"}
                    size="sleek"
                    className="ml-4 py-2 px-4 italic lg: rounded-3xl"
                    onClick={() => router.push("/subscription")}
                  >
                    Edit Subscription
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <ProfileButtons userDetailsData={userDetailsData} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div></div>

      {openShareModel && (
        <ShareOthersPopup
          open={openShareModel}
          setOpenShareModel={setOpenShareModel}
        />
      )}

      {openChatPopup && (
        <SendMessagePopup
          openPopup={openChatPopup}
          setOpenPopup={setOpenChatPopup}
        />
      )}
      <NotificationSettingModal
        openPopup={isNotificationModal}
        titleText="Upload your ID proof"
        btnText="Upload Your ID"
        titleDescription="You can upload forms of identification like passport, driver license or ID card. Result can take 2 days"
        setOpenPopup={setIsNotificationModal}
        imageUrl="\assets\images\pending-verification\pending-verification.svg"
        // handleSubmit={handleSubmit}
      />

      {isReportUserOpen && (
        <ReportProblemAlert
          isOpen={isReportUserOpen}
          onClose={() => setIsReportUserOpen(false)}
          userId={data?.data?._id}
        />
      )}
    </div>
  );
}

export default ProfileHeaderDesktop;
