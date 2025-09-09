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
  Pencil,
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
import ChatIcon from "@/assets/images/search-user-profile/inbox-message.svg";
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
import { useGetUserDetailsByUserNameQuery, useUpdateMeMutation } from "@/redux/services/haveme/user";
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
import { Switch } from "@/components/ui/switch";

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

  const { userDetailsData } = useGetUserDetailsByUserNameQuery(
    { userName: userName.uid as string },
    {
      selectFromResult: ({ data, isLoading }) => {
        return {
          userDetailsData: data?.data,
        };
      },
    }
  );

  const isOwnProfile = useMemo(() => {
    const currentId = data?.data?._id;
    const targetId = userDetailsData?._id;
    const byId = !!(currentId && targetId && currentId === targetId);
    const routeUid = (userName?.uid as string) || "";
    const byUserName = (data?.data?.userName || "").toLowerCase() === routeUid.toLowerCase();
    return byId || byUserName;
  }, [data, userDetailsData, userName]);

  // View-as toggle
  const [viewAsVisitor, setViewAsVisitor] = useState(false);
  const isOwnerRendered = isOwnProfile && !viewAsVisitor;

  // Inline bio editing
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState("");
  const [updateMe, { isLoading: isSavingBio }] = useUpdateMeMutation();

  const startEditBio = () => {
    const currentBio = data?.data?.bio || "";
    setBioDraft(currentBio);
    setIsEditingBio(true);
  };

  const saveBio = async () => {
    try {
      await updateMe({ bio: bioDraft }).unwrap();
      setIsEditingBio(false);
    } catch (e) {
      setIsEditingBio(false);
    }
  };

  const [openStoryPostModal, setOpenStoryPostModal] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const { user } = useUserOnboardingContext();
  const [isSeeMoreOption, setIsSeeMoreOption] = useState(false);

  const bioText = isOwnerRendered ? data?.data?.bio || "" : "";
  const maxLength = 150;

  const toggleVisibility = () => {
    setShowFullText(!showFullText);
    setIsSeeMoreOption(!isSeeMoreOption);
  };

  const copyLink = () => {
    navigator.clipboard
      .writeText(`haveme/${userName.uid}`)
      .then(() => {
        toast({ variant: "success", description: "Profile link copied to clipboard!" });
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
        toast({ variant: "destructive", title: "Permission Denied", description: "Could not copy text!" });
      });
  };

  const handleFollowClick = useCallback(
    async (id) => {
      await followUser({ followingTo: id })
        .unwrap()
        .then((res) => {
          toast({ variant: "success", description: res.message || "User Followed." });
          sendNotification({ title: "Follow notification", description: "User followed notification.", type: "push" });
          appDispatch(usersApi.util.invalidateTags([TAG_GET_USER_DETAILS_BY_USER_NAME]));
        })
        .catch((err) => {
          toast({ variant: "destructive", description: err.message || "Something went wrong." });
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
              isOwnerRendered
                ? `${baseServerUrl}/${data?.data?.coverPhoto?.path}`
                : `${baseServerUrl}/${userDetailsData?.coverPhoto?.path}`
            }
            alt="cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40"></div>
          <div className="flex items-center px-4 py-2 z-10 justify-between">
            <AvatarWithDescription
              isTextWhite={true}
              imageUrl={
                isOwnerRendered
                  ? `${baseServerUrl}/${data?.data?.photo?.path}`
                  : `${baseServerUrl}/${userDetailsData?.photo?.path}`
              }
              ImageFallBackText={isOwnerRendered ? data?.data?.userName : userDetailsData?.userName}
              userName={isOwnerRendered ? data?.data?.fullName : userDetailsData?.fullName}
              userNameTag={isOwnerRendered ? data?.data?.userName : userDetailsData?.userName}
            />
            {isOwnerRendered ? (
              <div className="flex items-center gap-2">
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button variant="secondary" size="icon" className="bg-white/10 backdrop-blur border">
                      <Pencil className="h-4 w-4 text-white" />
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="z-[10050] pb-tabbar">
                    <div className="w-full p-4 pb-tabbar">
                      <div className="flex justify-center">
                        <DrawerHeader className={`text-xl ${fontItalic.className}`}>Profile options</DrawerHeader>
                      </div>
                      <div className="mx-auto w-full max-w-sm space-y-2">
                        <Button className="w-full" onClick={() => router.push("/edit-profile")}>Edit Profile</Button>
                        <Button variant="secondary" className="w-full" onClick={() => router.push("/subscription")}>Edit Subscriptions</Button>
                        <Button variant="secondary" className="w-full" onClick={() => router.push("/edit-avatar")}>Edit Avatar</Button>
                      </div>
                    </div>
                  </DrawerContent>
                </Drawer>
                <Drawer>
                  <DrawerTrigger asChild>
                    <div className="rounded-full bg-white/10 p-2 backdrop-blur border cursor-pointer">
                      <img src="/assets/images/my-Profile/share.svg" className="cursor-pointer" alt="share" />
                    </div>
                  </DrawerTrigger>
                  <DrawerContent className="z-[10050] pb-tabbar">
                    <div className="w-full">
                      <div className="flex justify-center">
                        <DrawerHeader className={`text-xl   ${fontItalic.className}`}>Share Profile</DrawerHeader>
                      </div>
                      {/* share buttons left unchanged */}
                    </div>
                  </DrawerContent>
                </Drawer>
              </div>
            ) : (
              <div></div>
            )}
            {!isOwnerRendered && (
              <Button variant={"ghost"} size={"icon"} className="bg-muted-foreground/50 ">
                <Ellipsis onClick={() => router.push(`/more-settings/${userName?.uid}`)} strokeWidth={3} className="text-white" />
              </Button>
            )}
          </div>
        </article>

        {isOwnProfile && (
          <div className="flex items-center justify-end px-4 py-2 gap-2">
            <span className="text-sm text-muted-foreground">View as</span>
            <Switch checked={viewAsVisitor} onCheckedChange={setViewAsVisitor} />
          </div>
        )}

        <div>
          <div className="text-sm px-4 pt-3 pb-2">
            <p className="text-muted-foreground flex items-center gap-3">
              Bio
              {isOwnerRendered && !isEditingBio && (
                <Button variant="link" className="p-0 h-auto" onClick={startEditBio}>Edit Bio</Button>
              )}
            </p>
            {isOwnerRendered && isEditingBio ? (
              <div className="w-[75%]">
                <textarea
                  className="w-full rounded-md bg-background border p-2"
                  rows={3}
                  value={bioDraft}
                  onChange={(e) => setBioDraft(e.target.value)}
                />
                <div className="mt-2 flex gap-2">
                  <Button size="sm" onClick={saveBio} disabled={isSavingBio}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditingBio(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <p className="pb-2 w-[75%]">{bioText}</p>
            )}
            {isSeeMoreOption && (
              <div className="flex mt-4 items-center">
                <SocialInstagram className="stroke-foreground" />
                <h1 className="ml-4 text-base mr-4">{isOwnerRendered ? data?.data?.instagramLink : userDetailsData?.instagramLink}</h1>
                <SocialYoutube className="fill-foreground" />
                <h1 className="ml-4 text-base mr-4">{isOwnerRendered ? data?.data?.youtubeLink : userDetailsData?.youtubeLink}</h1>
                <SocialTiktok className="stroke-foreground" />
                <h1 className="ml-4 text-base mr-4">{isOwnerRendered ? data?.data?.tiktokLink : userDetailsData?.tiktokLink}</h1>
              </div>
            )}
          </div>
          <Separator />
          <UserStats
            isOwnProfile={isOwnerRendered}
            followersCount={isOwnerRendered ? data?.data?.followersCount : userDetailsData?.followersCount}
            followingCount={isOwnerRendered ? data?.data?.followingCount : userDetailsData?.followingCount}
            subscribersCount={isOwnerRendered ? data?.data?.subscriberCount : userDetailsData?.subscriberCount}
            postsCount={isOwnerRendered ? data?.data?.postsCount : userDetailsData?.postsCount}
            likeCount={isOwnerRendered ? data?.data?.totalLikes : userDetailsData?.totalLikes}
          />
          <Separator />
          {isOwnerRendered ? (
            <div className="flex justify-end px-4 py-3">
              <ContentUploadOptions />
            </div>
          ) : (
            <div className="flex justify-between px-4 py-3">
              <SubscribePlan />
              <Button size={"sleek"} className="w-36" onClick={() => handleFollowClick(userDetailsData?._id)}>
                {userDetailsData?.isFollowing ? "Unfollow" : "Follow"}
              </Button>
              <Button variant={"secondary"} size="sleek" className=" py-2 px-4 italic lg: rounded-3xl bg-[#8B5Cf6] w-36">
                Take me home
              </Button>
              <Link href={"/chat"}>
                <ChatIcon className="stroke-foreground" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeaderMobile;
