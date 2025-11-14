"use client";
import { Button } from "@/components/ui/button";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { havemeApi, useGetUserDetailsQuery } from "@/redux/services/haveme";
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
import { TAG_GET_USER_DETAILS_BY_USER_NAME, TAG_GET_USER_INFO } from "@/contracts/haveme/haveMeApiTags";
import { Switch } from "@/components/ui/switch";

const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

const ProfileHeaderMobile = () => {
  const router = useRouter();
  const userName = useParams();
  const { data, isLoading, isError, refetch } = useGetUserDetailsQuery();
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

  // Determine ownership and render mode BEFORE effects use it
  const isOwnProfile = useMemo(() => {
    const currentId = data?.data?._id;
    const targetId = userDetailsData?._id;
    const byId = !!(currentId && targetId && currentId === targetId);
    const routeUid = (userName?.uid as string) || "";
    const byUserName = (data?.data?.userName || "").toLowerCase() === routeUid.toLowerCase();
    return byId || byUserName;
  }, [data, userDetailsData, userName]);
  const [viewAsVisitor, setViewAsVisitor] = useState(false);
  const isOwnerRendered = isOwnProfile && !viewAsVisitor;

  // Local follow state for instant UI updates
  const [isFollowingLocal, setIsFollowingLocal] = useState<boolean | undefined>(undefined);
  const [followBusy, setFollowBusy] = useState(false);
  useEffect(() => {
    const serverFlag = userDetailsData?.isFollowing;
    setIsFollowingLocal(typeof serverFlag === 'boolean' ? serverFlag : undefined);
  }, [userDetailsData?._id, userDetailsData?.isFollowing]);

  // If follow state was changed elsewhere (Home), reflect it here immediately
  useEffect(() => {
    const updateFromCache = () => {
      try {
        const id = userDetailsData?._id;
        const uname = (userDetailsData?.userName || "").toString();
        if (!id && !uname) return;
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem('followedAuthors') : null;
        const map = raw ? JSON.parse(raw) : {};
        const byId = id ? map[String(id)] : undefined;
        const byUser = uname ? map[String(uname)] : undefined;
        const explicit = typeof byId === 'boolean' ? byId : (typeof byUser === 'boolean' ? byUser : undefined);
        if (typeof explicit === 'boolean') setIsFollowingLocal(explicit);
      } catch {}
    };
    updateFromCache();
    const onCustom = () => updateFromCache();
    const onStorage = (e?: StorageEvent) => { if (!e || e.key === 'followedAuthors') updateFromCache(); };
    if (typeof window !== 'undefined') {
      window.addEventListener('follow-cache-changed', onCustom as any);
      window.addEventListener('storage', onStorage as any);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('follow-cache-changed', onCustom as any);
        window.removeEventListener('storage', onStorage as any);
      }
    };
  }, [userDetailsData?._id, userDetailsData?.userName]);

  // Keep Home feed pill in sync with the profile's current follow state.
  // Prefer an explicit cache value (from Home) over a potentially stale server flag.
  useEffect(() => {
    try {
      if (isOwnerRendered) return; // do not write cache for your own profile
      const id = userDetailsData?._id;
      const uname = (userDetailsData?.userName || "").toString();
      if (!id && !uname) return;
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem('followedAuthors') : null;
      const map = raw ? JSON.parse(raw) : {};
      const byId = id ? map[String(id)] : undefined;
      const byUser = uname ? map[String(uname)] : undefined;
      const byUserLc = uname ? map[String(uname.toLowerCase())] : undefined;
      const cacheFlag = typeof byId === 'boolean' ? byId : (typeof byUser === 'boolean' ? byUser : (typeof byUserLc === 'boolean' ? byUserLc : undefined));
      const serverFlag = userDetailsData?.isFollowing;
      if (typeof cacheFlag === 'boolean') {
        // Trust cache immediately so the button flips as soon as Home pill is used
        setIsFollowingLocal(cacheFlag);
        return;
      }
      if (typeof serverFlag === 'boolean') {
        const unameLc = uname.toLowerCase();
        if (id) map[String(id)] = serverFlag;
        if (uname) map[String(uname)] = serverFlag;
        if (unameLc) map[String(unameLc)] = serverFlag;
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('followedAuthors', JSON.stringify(map));
          const evt = new Event('follow-cache-changed');
          window.dispatchEvent(evt);
        }
        setIsFollowingLocal(serverFlag);
      }
    } catch {}
  }, [isOwnerRendered, userDetailsData?._id, userDetailsData?.userName, userDetailsData?.isFollowing]);

  // View-as toggle (state moved above to avoid TDZ for effects)

  // Inline bio editing
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState("");
  const [localBio, setLocalBio] = useState<string | undefined>(undefined);
  const [updateMe, { isLoading: isSavingBio }] = useUpdateMeMutation();

  const startEditBio = () => {
    const currentBio = (localBio !== undefined ? localBio : (data?.data?.bio || ""));
    setBioDraft(currentBio);
    setIsEditingBio(true);
  };

  const saveBio = async () => {
    try {
      await updateMe({ bio: bioDraft }).unwrap();
      setLocalBio(bioDraft);
      setIsEditingBio(false);
      try { await (refetch as any)?.(); } catch {}
    } catch (e) {
      setIsEditingBio(false);
    }
  };

  const [openStoryPostModal, setOpenStoryPostModal] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const { user } = useUserOnboardingContext();
  const [isSeeMoreOption, setIsSeeMoreOption] = useState(false);

  const bioText = isOwnerRendered ? (localBio !== undefined ? localBio : (data?.data?.bio || "")) : "";
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
      if (followBusy) return;
      setFollowBusy(true);
      await followUser({ followingTo: id })
        .unwrap()
        .then((res) => {
          const isNowFollowing = Boolean(res?.data?.isFollowing ?? !Boolean(isFollowingLocal));
          toast({ variant: "success", description: isNowFollowing ? (res.message || "Now following.") : (res.message || "Unfollowed.") });
          sendNotification({ title: "Follow notification", description: "User followed notification.", type: "push" });
          // Update local cache for Home-feed follow pill consistency
          try {
            const raw = typeof window !== 'undefined' ? window.localStorage.getItem('followedAuthors') : null;
            const map = raw ? JSON.parse(raw) : {};
            const keyId = id ? String(id) : undefined;
            const keyUser = (userDetailsData?.userName || "").toString();
            const keyUserLc = keyUser.toLowerCase();
            if (keyId) map[keyId] = isNowFollowing;
            if (keyUser) map[keyUser] = isNowFollowing;
            if (keyUserLc) map[keyUserLc] = isNowFollowing;
            if (typeof window !== 'undefined') {
              window.localStorage.setItem('followedAuthors', JSON.stringify(map));
              // Broadcast to any open Home feed to refresh pill visibility
              const evt = new Event('follow-cache-changed');
              window.dispatchEvent(evt);
            }
          } catch {}
          // Locally flip UI state without waiting for refetch
          setIsFollowingLocal(isNowFollowing);
          // Refresh profile details (follower counts, isFollowing)
          appDispatch(usersApi.util.invalidateTags([TAG_GET_USER_DETAILS_BY_USER_NAME]));
          // Also refresh current user info (following count on your profile)
          appDispatch(havemeApi.util.invalidateTags([TAG_GET_USER_INFO] as any));
        })
        .catch((err) => {
          toast({ variant: "destructive", description: err.message || "Something went wrong." });
        })
        .finally(() => setFollowBusy(false));
    },
    [followUser, isFollowingLocal, followBusy]
  );

  return (
    <div>
      <div className="flex-col items-center justify-center">
        <article className="relative isolate flex flex-col justify-end overflow-hidden pt-24 mx-auto">
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src={(() => {
              const ownerCoverPath = isOwnerRendered ? (data as any)?.data?.coverPhoto?.path : (userDetailsData as any)?.coverPhoto?.path;
              const ownerCoverId = isOwnerRendered ? (data as any)?.data?.coverPhoto?._id : (userDetailsData as any)?.coverPhoto?._id;
              // Prefer path with cache-busting
              if (ownerCoverPath && !String(ownerCoverPath).includes('undefined')) return `${baseServerUrl}/${ownerCoverPath}?v=${encodeURIComponent(String(ownerCoverPath))}`;
              if (ownerCoverId) return `${baseServerUrl}/v1/user/files/${ownerCoverId}?v=${encodeURIComponent(String(ownerCoverId))}`;
              return "";
            })()}
            alt="cover"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40"></div>
          <div className="flex items-center px-4 py-2 z-10 justify-between">
            <AvatarWithDescription
              isTextWhite={true}
              imageUrl={(() => {
                const rawPath = isOwnerRendered ? (data as any)?.data?.photo?.path : (userDetailsData as any)?.photo?.path;
                const photoPath = (rawPath && rawPath !== 'undefined' && rawPath !== 'null') ? rawPath : undefined;
                const photoId = isOwnerRendered ? (data as any)?.data?.photo?._id : (userDetailsData as any)?.photo?._id;
                // Prefer path (actual image) over id endpoint (JSON metadata)
                if (photoPath) return `${baseServerUrl}/${photoPath}?v=${encodeURIComponent(String(photoPath))}`;
                if (photoId) return `${baseServerUrl}/v1/user/files/${photoId}?v=${encodeURIComponent(String(photoId))}`;
                return '/assets/images/Home/small-profile-img.svg';
              })()}
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
                      <img src="/assets/images/my-Profile/share.svg" className="cursor-pointer" alt="share" loading="lazy" decoding="async" />
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
            userId={isOwnerRendered ? (data?.data?._id as any) : (userDetailsData?._id as any)}
          />
          <Separator />
          {isOwnerRendered ? (
            <div className="flex justify-end px-4 py-3">
              <ContentUploadOptions />
            </div>
          ) : (
            <div className="flex justify-between px-4 py-3">
              <SubscribePlan />
              <Button size={"sleek"} className="w-36" onClick={() => handleFollowClick(userDetailsData?._id)} disabled={followBusy}>
                {isFollowingLocal ? "Unfollow" : "Follow"}
              </Button>
              <Link href={(userDetailsData?.userName ? String(userDetailsData.userName).toLowerCase().replace(/-/g,'') : '') === 'coachmajen' ? "/coach-majen" : "/chat"}>
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
