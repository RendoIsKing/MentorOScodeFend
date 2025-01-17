"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import Flip from "@/assets/images/Home/flip.svg";
import { ChevronRight, Info, Tags, ThumbsDown } from "lucide-react";
import { baseServerUrl, cn, getInitials } from "@/lib/utils";
import CommentsComp from "@/components/comments-comp";
import { Separator } from "@/components/ui/separator";
import TipDrawerComponent from "../shared/tip-drawer-component";
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
import { useAppDispatch } from "@/redux/store";
import {
  TAG_GET_FILE_INFO_BY_ID,
  TAG_GET_TAGGED_USERS_LIST,
  TAG_GET_USER_DETAILS_BY_USER_NAME,
  TAG_GET_USER_INFO,
} from "@/contracts/haveme/haveMeApiTags";
import { havemeApi } from "@/redux/services/haveme";
import ReportProblemAlert from "../report-problem";
import NotInterestedComp from "../shared/not-interested";
import Heart from "@/assets/images/Home/heart.svg";
import HeartActive from "@/assets/images/Home/heart-active.svg";

interface IMyUserDataProps {
  feedData: IPostObjectResponse;
}

const MobileFeed: React.FC<IMyUserDataProps> = ({ feedData }) => {
  const [getTaggedUserList, { data: tagListDetails }] =
    useLazyGetTaggedUserListQuery();

  const [followUser] = useFollowUserMutation();
  const [sendNotification] = useSendNotificationMutation();
  const appDispatch = useAppDispatch();

  const [selectHeart, setSelectHeart] = useState(false);
  const [selectBookmark, setSelectBookmark] = useState(false);
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
  const [saveLikecount, setSaveLikecount] = useState<number>(
    feedData?.savedCount
  );
  const [isReportUserOpen, setIsReportUserOpen] = useState(false);

  const [likePost] = useLikePostMutation();
  const [savePost] = useSavePostMutation();
  const { user } = useUserOnboardingContext();
  const [isDeleteModal, setIsDeleteModal] = useState(false);

  const isOwnProfile = feedData?.userInfo[0]?._id === user?._id;

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
    appDispatch(havemeApi.util.invalidateTags([TAG_GET_USER_INFO]));
    appDispatch(postsApi.util.invalidateTags([TAG_GET_FILE_INFO_BY_ID]));
    appDispatch(
      usersApi.util.invalidateTags([TAG_GET_USER_DETAILS_BY_USER_NAME])
    );
  };

  useEffect(() => {
    setHeartLikecount(feedData?.likesCount);

    if (feedData?.isLiked) {
      setHeartStates(() => true);
    } else {
      setHeartStates(() => false);
    }
  }, [feedData?.likesCount]);

  const handleSavePost = (postId: string) => {
    if (saveStates) {
      savePost(postId);
      setSaveState(() => false);
      setSaveLikecount((prev) => prev - 1);
    } else {
      savePost(postId);
      setSaveState(() => true);
      setSaveLikecount((prev) => prev + 1);
    }
    appDispatch(postsApi.util.invalidateTags([TAG_GET_FILE_INFO_BY_ID]));
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

  return (
    <div className="flex flex-col gap-y-4">
      <TipDrawerComponent
        showText={true}
        creatorId={feedData?.userInfo[0]?._id}
        tipOn={feedData?._id}
      />

      <div className="flex justify-center ">
        <div
          className={cn(
            "flex flex-col items-center gap-2 justify-center text-white",
            { "text-primary": selectHeart }
          )}
          onClick={() => handleSelectHeart(feedData._id)}
        >
          {heartStates ? (
            <HeartActive className="fill-foreground cursor-pointer" />
          ) : (
            <Heart className="fill-foreground cursor-pointer" />
          )}

          {heartLikecount}
          {/* {feedData?.isLiked ? 1 : 0} */}
        </div>
      </div>

      <CommentsComp feedData={feedData} />
      <div
        className={cn("flex flex-col items-center gap-2 justify-center", {
          "text-amber-300": selectBookmark,
        })}
        onClick={() => handleSavePost(feedData?._id)}
      >
        <img
          src={
            // !saveStates
            !feedData?.isSaved
              ? "/assets/images/Home/archive.svg"
              : "/assets/images/Home/bookmark-active.svg"
          }
          alt="bookmark"
        />
        <p className={cn("text-white", { "text-amber-300": selectBookmark })}>
          {/* {saveLikecount} */}
          {feedData?.isSaved ? 1 : 0}
        </p>
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

      {isPortraitHardware && (
        <div
          className="flex flex-col items-center gap-2 justify-center"
          onClick={() =>
            setSoftwareOrientation(
              orientation === "landscape-primary"
                ? "portrait-primary"
                : "landscape-primary"
            )
          }
        >
          <Flip />
        </div>
      )}
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
