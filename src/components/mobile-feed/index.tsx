"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ChevronRight, Info, Tags, ThumbsDown, Star, Share2 } from "lucide-react";
import { baseServerUrl, cn, getInitials } from "@/lib/utils";
import CommentsComp from "@/components/comments-comp";
import { Separator } from "@/components/ui/separator";
import {
  postsApi,
  useLazyGetTaggedUserListQuery,
  useLikePostMutation,
  useSavePostMutation,
} from "@/redux/services/haveme/posts";
import { IPostObjectResponse } from "@/contracts/responses/IPostObjectResponse";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";
import { ScrollArea } from "../ui/scroll-area";
import { useUserOnboardingContext } from "@/context/UserOnboarding";
import DeleteModal from "../delete-modal";
import AvatarWithDescription from "../shared/avatar-with-description";
import { Button } from "../ui/button";
import { toast } from "../ui/use-toast";
import { useFollowUserMutation, usersApi } from "@/redux/services/haveme/user";
import { useSendNotificationMutation } from "@/redux/services/haveme/notifications";
import { useMeNormalized } from "@/hooks/useMeNormalized";
import { useAppDispatch } from "@/redux/store";
import {
  TAG_GET_FILE_INFO_BY_ID,
  TAG_GET_TAGGED_USERS_LIST,
  TAG_GET_USER_DETAILS_BY_USER_NAME,
  TAG_GET_USER_INFO,
  TAG_GET_USER_POSTS_BY_USERNAME,
} from "@/contracts/haveme/haveMeApiTags";
import { havemeApi } from "@/redux/services/haveme";
import ReportProblemAlert from "../report-problem";
import NotInterestedComp from "../shared/not-interested";
import Heart from "@/assets/images/Home/heart.svg";
import HeartActive from "@/assets/images/Home/heart-active.svg";

interface IMyUserDataProps {
  feedData: IPostObjectResponse;
  variant?: "default" | "ui-v2";
}

const MobileFeed: React.FC<IMyUserDataProps> = ({ feedData, variant = "default" }) => {
  const [getTaggedUserList, { data: tagListDetails }] =
    useLazyGetTaggedUserListQuery();

  const [followUser] = useFollowUserMutation();
  const [sendNotification] = useSendNotificationMutation();
  const appDispatch = useAppDispatch();

  const [selectHeart, setSelectHeart] = useState(false);
  const { setSoftwareOrientation, orientation, hardwareOrientation } =
    useClientHardwareInfo();
  const isPortraitHardware = hardwareOrientation === "portrait-primary";
  const [showTaggedPeople, setShowTaggedPeople] = useState(false);
  // like heart state
  const [heartStates, setHeartStates] = useState<boolean>(feedData?.isLiked);
  const [heartLikecount, setHeartLikecount] = useState<number>(
    feedData?.likesCount
  );
  //save post state
  const [saveStates, setSaveState] = useState<boolean>(feedData?.isSaved);
  // Persist saved state per post to avoid reset when remounting inside scroller
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem('savedPosts') : null;
      const map = raw ? JSON.parse(raw) : {};
      const stored = map?.[feedData?._id];
      if (typeof stored === 'boolean') setSaveState(stored);
    } catch {}
  }, [feedData?._id]);
  const [saveLikecount, setSaveLikecount] = useState<number>(
    feedData?.savedCount
  );
  const [isReportUserOpen, setIsReportUserOpen] = useState(false);

  const [likePost] = useLikePostMutation();
  const [savePost] = useSavePostMutation();
  const { user } = useUserOnboardingContext();
  const { me: meNormalized } = useMeNormalized();
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const safeBase = (baseServerUrl as any) || (typeof window !== 'undefined' && (window as any).NEXT_PUBLIC_API_SERVER) || '/api/backend';
  const path = feedData?.mediaFiles?.[0]?.path;
  const postUrl = path ? `${safeBase}/${path}` : '';
  const isVideo = feedData?.media?.[0]?.mediaType === 'video';

  const isOwnProfile = (() => {
    const postOwnerId = String(feedData?.userInfo?.[0]?._id || (feedData as any)?.user || "");
    const ctxId = user?._id ? String(user._id) : "";
    const meId = meNormalized?._id ? String(meNormalized._id) : "";
    return Boolean(postOwnerId && (postOwnerId === ctxId || postOwnerId === meId));
  })();

  const handleSelectHeart = (postId: string) => {
    if (heartStates) {
      likePost(postId);
      setHeartStates(() => false);
      setHeartLikecount((prev) => {
        return prev >= 1 ? prev - 1 : 0;
      });
    } else {
      likePost(postId);
      setHeartStates(() => true);
      setHeartLikecount((prev) => {
        return !isNaN(prev) ? prev + 1 : 0 + 1;
      });
    }
    // Avoid media restart: only invalidate related lists if not currently viewing scroller (handled upstream)
    try {
      appDispatch(havemeApi.util.invalidateTags([TAG_GET_USER_INFO] as any));
      appDispatch(usersApi.util.invalidateTags([TAG_GET_USER_DETAILS_BY_USER_NAME] as any));
    } catch {}
  };

  useEffect(() => {
    setHeartLikecount(feedData?.likesCount);

    if (feedData?.isLiked) {
      setHeartStates(() => true);
    } else {
      setHeartStates(() => false);
    }
  }, [feedData?.likesCount]);

  const handleSavePost = async (postId: string) => {
    try {
      // Optimistic UI first
      if (saveStates) {
        setSaveState(() => false);
        setSaveLikecount((prev) => Math.max(0, (prev || 1) - 1));
      } else {
        setSaveState(() => true);
        setSaveLikecount((prev) => (isNaN(prev) ? 1 : prev + 1));
      }
      // Persist locally to avoid flicker on remounts
      try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem('savedPosts') : null;
        const map = raw ? JSON.parse(raw) : {};
        map[String(postId)] = !saveStates;
        if (typeof window !== 'undefined') window.localStorage.setItem('savedPosts', JSON.stringify(map));
      } catch {}
      // Call API but do not trigger list invalidations to avoid media restart
      await savePost(postId);
    } catch (e) {
      // Revert optimistic on error
      setSaveState((prev) => !prev);
      setSaveLikecount((prev) => (typeof prev === 'number' ? Math.max(0, prev + (saveStates ? 1 : -1)) : prev));
    }
  };

  const handleFollowClick = useCallback(
    async (id) => {
      await followUser({ followingTo: id })
        .unwrap()
        .then((res) => {
          toast({
            duration: 1000,
            variant: "success",
            description: res.message || "User Followed.",
          });
          sendNotification({
            title: "Follow notification",
            description: "User followed notification.",
            type: "push",
          });
          appDispatch(
            postsApi.util.invalidateTags([TAG_GET_TAGGED_USERS_LIST])
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

  const railCls = cn(
    "flex flex-col gap-y-4",
    variant === "ui-v2" && "items-center gap-6 pb-2"
  );
  const actionCls = cn(
    "flex flex-col items-center gap-2 justify-center text-white",
    variant === "ui-v2" && "gap-1 drop-shadow-lg"
  );
  const countCls = cn("text-white", variant === "ui-v2" && "text-xs font-semibold");

  return (
    <div className={railCls}>

      <div className="flex justify-center">
        <div
          className={cn(
            actionCls,
            { "text-primary": selectHeart }
          )}
          onClick={() => handleSelectHeart(feedData._id)}
        >
          {heartStates ? (
            <HeartActive className={cn("fill-foreground cursor-pointer", variant === "ui-v2" && "h-7 w-7")} />
          ) : (
            <Heart className={cn("fill-foreground cursor-pointer", variant === "ui-v2" && "h-7 w-7")} />
          )}

          <span className={countCls}>{heartLikecount}</span>
          {/* {feedData?.isLiked ? 1 : 0} */}
        </div>
      </div>

      <CommentsComp feedData={feedData} variant={variant} />

      {/* Share (UI v2 only): uses Web Share API, falls back to clipboard */}
      {variant === "ui-v2" ? (
        <ShareV2 postId={String(feedData?._id)} />
      ) : null}

      <div
        className={cn(actionCls, {
          "text-primary": saveStates,
        })}
        onClick={() => handleSavePost(feedData?._id)}
        aria-label={saveStates ? "Unsave post" : "Save post"}
      >
        <Star className={cn("cursor-pointer", variant === "ui-v2" && "h-7 w-7")} fill={saveStates ? "currentColor" : "none"} />
        {/* Match Figma: save typically has no count; keep count only for non-ui-v2 */}
        {variant !== "ui-v2" ? (
          <p className={cn("text-white", { "text-primary": saveStates })}>
            {saveLikecount}
          </p>
        ) : null}
      </div>
      {feedData?.userTags?.length > 0 && (
        <Drawer>
          <DrawerTrigger
            asChild
            onClick={() => getTaggedUserList(feedData?._id)}
          >
            <div className="flex flex-col items-center gap-2 justify-center">
              <Tags
                className="stroke-white text-xl"
                onClick={() => {
                  setShowTaggedPeople(!showTaggedPeople);
                }}
                size={40}
              />
            </div>
          </DrawerTrigger>
          <DrawerContent className="h-1/3 outline-none">
            <DrawerHeader>
              <DrawerTitle className=" text-center text-muted-foreground mb-2">
                Tagged Users
              </DrawerTitle>
            </DrawerHeader>
            <ScrollArea className="px-3 py-0 text-center">
              {tagListDetails?.taggedUsers?.map((user, index) => (
                <div key={user?._id} className="flex justify-between my-4 mr-4">
                  <AvatarWithDescription
                    imageUrl={`${baseServerUrl}/${user?.photo?.path}`}
                    ImageFallBackText={getInitials(user?.fullName)}
                    userName={user?.fullName}
                    userNameTag={user?.userName}
                  />
                  <Button
                    size={"sleek"}
                    className="py-4 bg-primary text-white"
                    onClick={() => handleFollowClick(user?._id)}
                  >
                    {user?.isFollowing ? "Unfollow" : "Follow"}
                  </Button>
                </div>
              ))}
            </ScrollArea>
          </DrawerContent>
        </Drawer>
      )}

      {isOwnProfile ? (
        <DeleteModal
          postDetails={feedData}
          openPopup={isDeleteModal}
          setOpenPopup={setIsDeleteModal}
        />
      ) : (
        <Drawer>
          <DrawerTrigger>
            <div className="flex flex-col items-center gap-2 justify-center text-white">
              <img src="/assets/images/Home/more.svg" alt="more" />
            </div>
          </DrawerTrigger>
          <DrawerContent className="min-h-3/4 p-4">
            <div className="flex flex-col gap-4 mx-auto w-full max-w-sm mt-8">
              <div
                className="flex justify-between"
                onClick={() => setIsReportUserOpen(true)}
              >
                <div className="flex text-destructive gap-2">
                  <Info />
                  Report User
                </div>
                <ChevronRight />
              </div>
              <Separator />
              <div className="flex justify-between">
                <div className="flex gap-2">
                  {/* <ThumbsDown />
                  Not Interested */}
                  <NotInterestedComp postId={feedData?._id} />
                </div>
                <ChevronRight />
              </div>
              <Separator />
            </div>
          </DrawerContent>
        </Drawer>
      )}

      {/* Flip button removed */}
      {isReportUserOpen && (
        <ReportProblemAlert
          isOpen={isReportUserOpen}
          onClose={() => setIsReportUserOpen(false)}
          userId={feedData?.user}
        />
      )}
    </div>
  );
};

export default MobileFeed;

function ShareV2({ postId }: { postId: string }) {
  const [busy, setBusy] = useState(false);
  const href = `/post/${encodeURIComponent(postId)}`;
  const onShare = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const url = typeof window !== "undefined" ? `${window.location.origin}${href}` : href;
      if (typeof navigator !== "undefined" && (navigator as any).share) {
        await (navigator as any).share({ url });
      } else if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        toast({ duration: 1200, description: "Link copied" });
      }
    } catch {}
    setBusy(false);
  };
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onShare();
      }}
      className="flex flex-col items-center gap-1 justify-center text-white drop-shadow-lg"
      aria-label="Share post"
      data-test="share-button"
    >
      <Share2 className="h-7 w-7" />
      <span className="text-xs font-semibold">{busy ? "…" : ""}</span>
    </button>
  );
}
