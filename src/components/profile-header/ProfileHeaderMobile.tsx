import { Button } from "@/components/ui/button";
import React, { useCallback, useMemo, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import {
  ChevronRight,
  CircleFadingPlus,
  CircleX,
  Ellipsis,
  Forward,
  Grid3X3,
  PlusIcon,
  Radio,
  Twitter,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
} from "@/components/ui/drawer";
import AvatarWithDescription from "@/components/shared/avatar-with-description";
import UserStats from "@/components/user-stats";
import Link from "next/link";
import Inbox from "@/assets/images/search-user-profile/inbox-message.svg";
import AlertPopup from "@/components/shared/popup";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import StoryPostUploadForm from "@/components/story-post-upload";
import FileUploadForm from "../file-upload";
import { ABeeZee } from "next/font/google";
import {
  useFollowUserMutation,
  useGetUserProfilePhotoQuery,
  usersApi,
} from "@/redux/services/haveme/user";
import { useUserOnboardingContext } from "@/context/UserOnboarding";
import { baseServerUrl } from "@/lib/utils";
import SocialInstagram from "@/assets/images/my-Profile/instagram.svg";
import SocialYoutube from "@/assets/images/my-Profile/youtube.svg";
import SocialTiktok from "@/assets/images/my-Profile/tiktok.svg";
import { useGetUserDetailsQuery } from "@/redux/services/haveme";
import { useGetUserDetailsByUserNameQuery } from "@/redux/services/haveme/user";
import { toast } from "../ui/use-toast";
import ContentUploadOptions from "../upload-content-options";
import SubscribePlan from "../shared/popup/subscribe-plan";
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  WhatsappIcon,
  TelegramShareButton,
  EmailShareButton,
  InstapaperShareButton,
} from "react-share";
import { useSendNotificationMutation } from "@/redux/services/haveme/notifications";
import { useAppDispatch } from "@/redux/store";
import { TAG_GET_USER_DETAILS_BY_USER_NAME } from "@/contracts/haveme/haveMeApiTags";

const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

const ProfileHeaderMobile = () => {
  const router = useRouter();
  const userName = useParams();
  const { data, isLoading, isError } = useGetUserDetailsQuery();
  const shareUrl = `${window.location.origin}/${userName.uid}`;
  const [followUser] = useFollowUserMutation();
  const [sendNotification] = useSendNotificationMutation();
  const appDispatch = useAppDispatch();

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
  const [openStoryPostModal, setOpenStoryPostModal] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const { user } = useUserOnboardingContext();
  const [isSeeMoreOption, setIsSeeMoreOption] = useState(false);

  const bioText = isOwnProfile
    ? data?.data?.bio || userDetailsData?.bio || ""
    : "";
  const maxLength = 150;

  const toggleVisibility = () => {
    setShowFullText(!showFullText);
    setIsSeeMoreOption(!isSeeMoreOption);
  };

  const copyLink = () => {
    navigator.clipboard
      .writeText(`haveme/${userName.uid}`)
      .then(() => {
        // Optionally, you can show a message to the user that the link is copied
        toast({
          variant: "success",
          description: "Profile link copied to clipboard!",
        });
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
        toast({
          variant: "destructive",
          title: "Permission Denied",
          description: "Could not copy text!",
        });
      });
  };

  const handleFollowClick = useCallback(
    async (id) => {
      await followUser({ followingTo: id })
        .unwrap()
        .then((res) => {
          toast({
            variant: "success",
            description: res.message || "User Followed.",
          });

          sendNotification({
            title: "Follow notification",
            description: "User followed notification.",
            type: "push",
          });
          appDispatch(
            usersApi.util.invalidateTags([TAG_GET_USER_DETAILS_BY_USER_NAME])
          );
        })
        .catch((err) => {
          toast({
            variant: "destructive",
            description: err.message || "Something went wrong.",
          });
        });
    },
    [followUser]
  );

  return (
    <div>
      <div className="flex-col items-center justify-center">
        <article className="relative isolate flex flex-col justify-end overflow-hidden pt-24 mx-auto">
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src={
              isOwnProfile
                ? `${baseServerUrl}/${data?.data?.coverPhoto?.path}`
                : `${baseServerUrl}/${userDetailsData?.coverPhoto?.path}`
            }
            alt="aldi sigun on Unsplash"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40"></div>
          <div className="flex items-center px-4 py-2 z-10 justify-between">
            <AvatarWithDescription
              isTextWhite={true}
              imageUrl={
                isOwnProfile
                  ? // change below static path when api updates
                    `${baseServerUrl}/${data?.data?.photo?.path}`
                  : `${baseServerUrl}/${userDetailsData?.photo?.path}`
              }
              ImageFallBackText={
                isOwnProfile ? data?.data?.userName : userDetailsData?.userName
              }
              userName={
                isOwnProfile ? data?.data?.fullName : userDetailsData?.fullName
              }
              userNameTag={
                isOwnProfile ? data?.data?.userName : userDetailsData?.userName
              }
            />
            {isOwnProfile ? (
              <Drawer>
                <DrawerTrigger asChild>
                  <div>
                    <img
                      src="/assets/images/my-Profile/share.svg"
                      className="cursor-pointer"
                      alt="share"
                    />{" "}
                  </div>
                </DrawerTrigger>

                <DrawerContent>
                  <div className="w-full">
                    <div className="flex justify-center">
                      <DrawerHeader
                        className={`text-xl   ${fontItalic.className}`}
                      >
                        Share Profile
                      </DrawerHeader>
                    </div>

                    <div className="flex justify-around p-5">
                      <div className="flex flex-col">
                        <WhatsappShareButton url={shareUrl}>
                          <div className=" p-6 rounded-full bg-muted-foreground/50">
                            <img
                              src="\assets\images\ShareIcons\whatsapp 1.svg"
                              alt="Whatsapp"
                            />
                          </div>
                          <p className="mt-4">Whatsapp</p>
                        </WhatsappShareButton>
                      </div>

                      <div>
                        <TelegramShareButton url={shareUrl}>
                          <div className=" p-6 rounded-full bg-muted-foreground/50">
                            <img
                              src="\assets\images\ShareIcons\telegram-alt 1.svg"
                              alt="Telegram"
                            />{" "}
                          </div>
                          <p className="mt-4">Telegram</p>
                        </TelegramShareButton>
                      </div>

                      <TwitterShareButton url={shareUrl}>
                        <div className=" p-6 rounded-full bg-muted-foreground/50">
                          <img
                            src="\assets\images\ShareIcons\twitter-alt 1.svg"
                            alt="Twitter"
                          />{" "}
                        </div>
                        <p className="mt-4 text-center">Twitter</p>
                      </TwitterShareButton>
                    </div>

                    <div className="flex justify-around p-5">
                      <div>
                        <FacebookShareButton url={shareUrl}>
                          <div className=" p-6 rounded-full bg-muted-foreground/50">
                            <img
                              src="\assets\images\ShareIcons\facebook1.svg"
                              alt="Facebook"
                            />
                          </div>
                          <p className="mt-4">Facebook</p>
                        </FacebookShareButton>
                      </div>

                      <div>
                        <div className=" p-6 rounded-full bg-muted-foreground/50">
                          <img
                            src="\assets\images\ShareIcons\instagram2.svg"
                            alt="Instagram"
                          />
                        </div>
                        <p className="mt-4 ">Instagram</p>
                      </div>

                      <div>
                        <EmailShareButton url={shareUrl}>
                          <div className=" p-6 rounded-full bg-muted-foreground/50">
                            <img
                              src="\assets\images\ShareIcons\alternate_email.svg"
                              alt="E-mail"
                            />{" "}
                          </div>
                          <p className="mt-4 text-center">E-mail</p>
                        </EmailShareButton>
                      </div>
                    </div>

                    <div className="flex justify-around p-5">
                      <div>
                        <div className=" p-6 rounded-full bg-muted-foreground/50">
                          <img
                            src="\assets\images\ShareIcons\copy-alt 1.svg"
                            alt="Copy link"
                            onClick={() => copyLink()}
                          />
                        </div>
                        <p className="mt-4">Copy link</p>
                      </div>

                      <div>
                        <LinkedinShareButton url={shareUrl}>
                          <div className=" p-6 rounded-full bg-muted-foreground/50">
                            <img
                              src="\assets\images\ShareIcons\share2.svg"
                              alt="More"
                            />
                          </div>
                          <p className="mt-4 text-center">LinkedIn</p>
                        </LinkedinShareButton>
                      </div>

                      <div className=" p-6 rounded-full invisible">
                        <Twitter />
                      </div>
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>
            ) : (
              <div></div>
            )}

            {!isOwnProfile && (
              <Button
                variant={"ghost"}
                size={"icon"}
                className="bg-muted-foreground/50 "
              >
                <Ellipsis
                  onClick={() => router.push(`/more-settings/${userName?.uid}`)}
                  strokeWidth={3}
                  className="text-white"
                />
              </Button>
            )}
          </div>
        </article>

        <div>
          <div className="text-sm p-2">
            <p className="text-muted-foreground">Bio</p>
            <p className="pb-2 w-[75%]">
              {bioText.length >= maxLength ? (
                <>
                  {showFullText
                    ? bioText
                    : `${bioText.slice(0, maxLength)} ... `}
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
          <Separator />
          <UserStats
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
            postsCount={
              isOwnProfile
                ? data?.data?.postsCount
                : userDetailsData?.postsCount
            }
            likeCount={
              isOwnProfile
                ? data?.data?.totalLikes
                : userDetailsData?.totalLikes
            }
          />
          <Separator />
          {isOwnProfile ? (
            <div className="flex justify-between p-4">
              <div className="flex gap-4">
                <div>
                  <img
                    src="/assets/images/search/serach-profile-icon.svg"
                    alt="edit-subscription"
                    onClick={() => router.push("/subscription")}
                  />
                </div>
                <Button
                  variant={"secondary"}
                  size="sleek"
                  className={`py-2 px-4  font-semibold rounded-3xl ${fontItalic.className}`}
                  onClick={() => router.push("/edit-profile")}
                >
                  Edit Profile
                </Button>
              </div>
              {/* <Link href={"/post-preview"}> */}
              <ContentUploadOptions />

              {/* </Link> */}
              <Button
                variant={"secondary"}
                size="sleek"
                className={`py-2 px-4  font-semibold rounded-3xl ${fontItalic.className}`}
                onClick={() => router.push("/edit-avatar")}
              >
                Edit Avatar
              </Button>
            </div>
          ) : (
            <div className="flex justify-between p-4">
              <SubscribePlan />
              <Button
                size={"sleek"}
                className="w-36"
                onClick={() => handleFollowClick(userDetailsData?._id)}
              >
                {userDetailsData?.isFollowing ? "Unfollow" : "Follow"}
              </Button>

              <Button
                variant={"secondary"}
                size="sleek"
                className=" py-2 px-4 italic lg: rounded-3xl bg-[#8B5Cf6] w-36"
              >
                Take me home
              </Button>
              <Link href={"/chat"}>
                <Inbox className="stroke-foreground" />
              </Link>
            </div>
          )}
        </div>
        <Separator />
      </div>
    </div>
  );
};

export default ProfileHeaderMobile;
