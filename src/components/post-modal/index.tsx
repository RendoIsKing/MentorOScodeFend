"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { CircleX, Ellipsis, Info, Pin, PinOff, ThumbsDown } from "lucide-react";
import Comment from "../comments-comp/comment";
import { ScrollArea } from "../ui/scroll-area";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import DeleteModal from "../delete-modal";
import AlertPopup from "../shared/popup";
import { RadioButtonGroup } from "../postInteraction";
import { Label } from "../ui/label";
import AvatarWithDescription from "../shared/avatar-with-description";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Tags } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import ReportProblemAlert from "../report-problem";
import { baseServerUrl, cn, formatTimestamp } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { tipAmountSchema } from "@/schemas/tipAmount";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  postsApi,
  useGetCommentsByPostIdQuery,
  useGetPostByIdQuery,
  useLikePostMutation,
  useSavePostMutation,
  useUpdatePostCommentMutation,
  useUpdatePostMutation,
  useUpdateReplyCommentMutation,
} from "@/redux/services/haveme/posts";
import { useUserOnboardingContext } from "@/context/UserOnboarding";
import {
  useFollowUserMutation,
  useGetUserProfilePhotoQuery,
  usersApi,
} from "@/redux/services/haveme/user";
import { toast } from "../ui/use-toast";
import Heart from "@/assets/images/Home/heart.svg";
import HeartActive from "@/assets/images/Home/heart-active.svg";
import Bookmark from "@/assets/images/Home/archive.svg";
import BookmarkActive from "@/assets/images/Home/bookmark-active.svg";
import { useSendNotificationMutation } from "@/redux/services/haveme/notifications";
import { useAppDispatch } from "@/redux/store";
import {
  TAG_GET_FILE_INFO_BY_ID,
  TAG_GET_USER_DETAILS_BY_USER_NAME,
  TAG_GET_USER_INFO,
  TAG_GET_USER_POSTS_BY_USERNAME,
} from "@/contracts/haveme/haveMeApiTags";
import SubscribePlan from "../shared/popup/subscribe-plan";
import TaggedUserPopup from "../tagged-user-popup";
import { havemeApi } from "@/redux/services/haveme";
import {
  useCreateImpressionMutation,
  useLogViewMutation,
} from "@/redux/services/haveme/interactions";
import NotInterestedComp from "../shared/not-interested";
import { resetUserPosts, updatePost } from "@/redux/slices/adapters";
import { useGetUserDetailsQuery } from "@/redux/services/haveme";

interface IPostModalProps {
  postId: string | string[];
}

export default function PostModal({ postId }: IPostModalProps) {
  const [showTaggedPeople, setShowTaggedPeople] = useState(false);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [tipMessage, setTipMessage] = useState("");
  const [commentMessage, setCommentMessage] = useState("");
  const [selectHeart, setSelectHeart] = useState(false);
  const [selectBookmark, setSelectBookmark] = useState(false);
  const [isReportUserOpen, setIsReportUserOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [postDetails, setPostDetails] = useState(null);
  const [parentCommentId, setParentCommentId] = useState(null);

  // like heart state
  const [heartStates, setHeartStates] = useState<boolean>();
  const [heartLikecount, setHeartLikecount] = useState<number>();
  //save post state
  const [saveStates, setSaveState] = useState<boolean>();
  const [saveLikecount, setSaveLikecount] = useState<number>(
    postDetails?.savedCount
  );
  const timeoutIdRef = useRef(null);

  const { user } = useUserOnboardingContext();
  const { comments } = useGetCommentsByPostIdQuery(postId, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        comments: data?.data,
      };
    },
  });

  const appDispatch = useAppDispatch();

  const [updatePostCommentTrigger] = useUpdatePostCommentMutation();

  const pathname = usePathname();
  // Always render the action menu; we'll gate items by ownership instead

  const { data: getPostDetails } = useGetPostByIdQuery(postId);
  const { data: me } = useGetUserDetailsQuery();
  const isLoggedIn = Boolean((me as any)?.data?._id || user?._id);
  //console.log("gggggg", getPostDetails);
  const { data: userPhotoData } = useGetUserProfilePhotoQuery(
    postDetails?.userInfo[0]?.photoId,
    {
      skip: !postDetails?.userInfo[0]?.photoId,
    }
  );

  const [likePostTrigger] = useLikePostMutation();
  const [replyCommentTrigger] = useUpdateReplyCommentMutation();
  const [savePost] = useSavePostMutation();
  const [followUser] = useFollowUserMutation();
  // test notifications
  const [sendNotification] = useSendNotificationMutation();
  const [createImpressionTrigger] = useCreateImpressionMutation();
  const [logViewTrigger] = useLogViewMutation();
  const [updatePostTrigger] = useUpdatePostMutation();

  useEffect(() => {
    setPostDetails(getPostDetails);
    if (getPostDetails) {
      setHeartStates(getPostDetails?.isLiked);
      setSaveState(getPostDetails?.isSaved);
      setHeartLikecount(getPostDetails?.likeInteractions?.length);
      setSaveLikecount(getPostDetails?.savedInteractions?.length);
    }
  }, [getPostDetails]);

  const form = useForm<any>({
    resolver: zodResolver(tipAmountSchema),
    defaultValues: {
      amount: 1,
      message: "",
    },
  });

  const onSubmit = async (data: any) => {
    setOpen(false);
  };

  const fileType = postDetails?.media?.[0]?.mediaType;
  const safeBase = (baseServerUrl as any) || (typeof window !== 'undefined' && (window as any).NEXT_PUBLIC_API_SERVER) || '/api/backend';
  const mediaPath = postDetails?.mediaFiles?.[0]?.path ? `${safeBase}/${postDetails.mediaFiles[0].path}` : undefined;
  const profilePhotoPath = `${baseServerUrl}/${userPhotoData?.path}`;
  const postDate = postDetails?.updatedAt
    ? postDetails?.updatedAt
    : postDetails?.createdAt;

  const submitComment = async () => {
    let commentObj = {
      postId: postId,
      comment: commentMessage,
    };
    await updatePostCommentTrigger(commentObj)
      .unwrap()
      .then((res) => {
        setCommentMessage("");
        //console.log("Response", res);
      })
      .catch((err) => {
        console.log("Error", err);
        toast({
          variant: "destructive",
          title: "Something went wrong",
        });
      });
  };

  const handleReply = (username, parentCommentId) => {
    setCommentMessage(`@${username} `);
    setParentCommentId(parentCommentId);
  };

  const submitReply = async () => {
    let replyObj = {
      parentCommentId: parentCommentId,
      reply: commentMessage,
    };
    await replyCommentTrigger(replyObj)
      .unwrap()
      .then((res) => {
        // setShowReply(false);
        // setShowReplyBox(false);
        setCommentMessage("");
        setParentCommentId(null);
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
        toast({
          variant: "destructive",
          title: "Something went wrong",
        });
      });
  };

  // const handleSavePost = (id) => {
  //   savePost(id);
  //   setSelectBookmark(!selectBookmark);
  // };

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
            postsApi.util.invalidateTags([
              { type: TAG_GET_FILE_INFO_BY_ID, id: postDetails?._id },
              TAG_GET_USER_DETAILS_BY_USER_NAME,
            ])
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

  const handleSelectHeart = (postId: string) => {
    if (heartStates) {
      likePostTrigger(postId);
      setHeartStates(() => false);
      setHeartLikecount((prev) => prev - 1);
    } else {
      likePostTrigger(postId);
      setHeartStates(() => true);
      setHeartLikecount((prev) => prev + 1);
    }
    appDispatch(havemeApi.util.invalidateTags([TAG_GET_USER_INFO]));
    appDispatch(postsApi.util.invalidateTags([TAG_GET_FILE_INFO_BY_ID]));
    appDispatch(
      usersApi.util.invalidateTags([TAG_GET_USER_DETAILS_BY_USER_NAME])
    );
  };

  const handleSavePost = async (postId: string) => {
    try {
      // Optimistic UI update without refetch
      if (saveStates) {
        setSaveState(() => false);
        setSaveLikecount((prev) => Math.max(0, (prev || 1) - 1));
      } else {
        setSaveState(() => true);
        setSaveLikecount((prev) => (isNaN(prev) ? 1 : prev + 1));
      }
      // Persist to localStorage so reopening the modal doesn't reset
      try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem('savedPosts') : null;
        const map = raw ? JSON.parse(raw) : {};
        map[String(postId)] = !saveStates;
        if (typeof window !== 'undefined') window.localStorage.setItem('savedPosts', JSON.stringify(map));
      } catch (e) {}
      await savePost(postId);
      // No invalidation here to avoid media reload
    } catch (e) {
      // Revert optimistic on error
      setSaveState((prev) => !prev);
      setSaveLikecount((prev) => (typeof prev === 'number' ? Math.max(0, prev + (saveStates ? 1 : -1)) : prev));
    }
  };

  const myId = (me as any)?.data?._id || user?._id;
  const isOwnProfile = String(postDetails?.userInfo?.[0]?._id || "") === String(myId || "");

  const createImpression = useCallback(() => {
    if (postDetails?._id) {
      createImpressionTrigger({ postId: postDetails?._id });
      timeoutIdRef.current = setTimeout(() => {
        logViewTrigger({ postId: postDetails?._id });
      }, 5000);
    }
  }, [postDetails && (postDetails as any)._id]);

  const logView = () => {
    if (postDetails?._id) {
      timeoutIdRef.current = setTimeout(() => {
        logViewTrigger({ postId: postDetails?._id });
      }, 5000);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);

  const togglePinStatus = async () => {
    let togglePinObj = {
      id: postDetails?._id,
      isPinned: !postDetails?.isPinned,
    };
    await updatePostTrigger(togglePinObj)
      .unwrap()
      .then((res) => {
        toast({
          variant: "success",
          description: "Pinned status changed.",
        });
        appDispatch(
          updatePost({
            _id: postDetails?._id,
            isPinned: !postDetails?.isPinned,
          })
        );
        // reflect instantly in this modal UI
        try {
          setPostDetails((prev) => ({ ...(prev as any), isPinned: !postDetails?.isPinned }));
        } catch (e) {}
        try {
          appDispatch(havemeApi.util.invalidateTags([TAG_GET_USER_INFO] as any));
          appDispatch(postsApi.util.invalidateTags([TAG_GET_FILE_INFO_BY_ID, TAG_GET_USER_POSTS_BY_USERNAME] as any));
          appDispatch(usersApi.util.invalidateTags([TAG_GET_USER_DETAILS_BY_USER_NAME] as any));
        } catch (e) {}
      })
      .catch((err) => {
        console.log(err);
        toast({
          variant: "destructive",
          description: err.data?.error?.message || "Something went wrong.",
        });
      });
  };

  const handleImageLoad = (e: any) => {
    logView();
    try {
      (e.currentTarget as HTMLImageElement).classList.remove("blur-sm");
    } catch (err) {}
  };

  return (
    <div className="flex">
      <div className="relative min-w-96 lg:w-1/2">
        {fileType === "image" ? (
          <div className="relative">
            {mediaPath ? (
              <img
                onLoad={handleImageLoad}
                src={mediaPath}
                alt="post details"
                loading="lazy"
                decoding="async"
                className="h-[37.8rem] lg:w-full object-contain blur-sm transition-all duration-300"
                onClick={() => setShowTaggedPeople(!showTaggedPeople)}
              />
            ) : (
              <div className="h-[37.8rem] lg:w-full object-contain bg-muted flex items-center justify-center text-xs text-muted-foreground">Media missing</div>
            )}
            <div>
              {showTaggedPeople &&
                getPostDetails?.userTags?.map((user, index) => {
                  return (
                    <p
                      key={index}
                      style={{
                        position: "absolute",
                        top: `${user.location.y}%`,
                        left: `${user.location.x}%`,
                        backgroundColor: "black",
                      }}
                    >
                      {user?.userName}
                    </p>
                  );
                })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            {mediaPath ? (
              <video
                autoPlay
                controls
                src={mediaPath}
                className="h-[37.8rem] lg:w-full"
                onPlay={createImpression}
              />
            ) : (
              <div className="h-[37.8rem] lg:w-full bg-muted flex items-center justify-center text-xs text-muted-foreground">Media missing</div>
            )}
            {/* {showTaggedPeople && (
              <div className="w-[33.8rem] h-auto border-[#0b0f1440]  dark:bg-[#0b0f1440] rounded-lg p-4 absolute top-[240px] text-center">
                <ScrollArea className="px-3 py-0 h-20">
                  {getPostDetails?.userTags?.map((user, index) => {
                    return (
                      <p key={index} className="flex  flex-col">
                        taggedHere
                      </p>
                    );
                  })}
                </ScrollArea>
              </div>
            )} */}
          </div>
        )}
        <div className="absolute right-4 bottom-16">
          <Dialog open={open} onOpenChange={setOpen}>
            {isLoggedIn && (
              <DialogTrigger asChild>
                <div className="flex flex-col mb-4 dark:text-white text-white">
                  <img
                    src="/assets/images/Home/give-tip.svg"
                    alt="give tip"
                    className="cursor-pointer"
                  />
                  <p className="text-center cursor-pointer ">Tip</p>
                </div>
              </DialogTrigger>
            )}
            <DialogContent className="sm:w-11/12 w-4/5 rounded-md p-0 border-0">
              <DialogHeader>
                <DialogTitle>
                  <div className="m-2" />
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex flex-col px-4 gap-4"
                >
                  <RadioButtonGroup />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Input
                            className="text-left mt-2"
                            placeholder="Write comment..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button className="mb-8" type="submit">
                    Tip
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <div
            className={cn("flex flex-col cursor-pointer text-white mb-3", {
              "text-primary": selectHeart,
            })}
          >
            {fileType === "image" && getPostDetails?.userTags?.length > 0 ? (
              <Tags
                className="dark:stroke-white stroke-black text-xl"
                onClick={() => setShowTaggedPeople(!showTaggedPeople)}
                size={40}
              />
            ) : null}
          </div>

          <div>
            {fileType === "video" && postDetails?.userTags?.length > 0 ? (
              <TaggedUserPopup postId={postDetails?._id} />
            ) : null}
          </div>

          <div
            className={cn("flex flex-col cursor-pointer", {
              "text-primary": selectHeart,
            })}
            onClick={() => handleSelectHeart(postDetails?._id)}
          >
            {heartStates ? (
              <HeartActive className="fill-foreground cursor-pointer" />
            ) : (
              <Heart className="fill-foreground cursor-pointer" />
            )}
            <div className="ml-3 mt-0.5"> {heartLikecount}</div>

            {/* <div className="ml-3 mt-0.5">{postDetails?.likeInteractions?.length}</div> */}
          </div>

          <div
            className={cn("flex flex-col mt-4 cursor-pointer", {
              "text-amber-300": selectBookmark,
            })}
            onClick={() => handleSavePost(postDetails?._id)}
          >
            {saveStates ? (
              <BookmarkActive className="fill-foreground cursor-pointer" />
            ) : (
              <Bookmark className="fill-foreground cursor-pointer" />
            )}
            <div className="ml-3 mt-0.5 ">{saveLikecount}</div>
          </div>

          <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex flex-col items-center gap-2 lg:gap-0 justify-center cursor-pointer">
                  <Ellipsis className="cursor-pointer fill-white stroke-white mt-2" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="p-2 border-[#0B0F14] light:bg-secondary dark:bg-[#0B0F14]"
                side="top"
              >
                {isOwnProfile && (
                  <DropdownMenuItem onClick={() => setIsDeleteModal(true)}>
                    <div className="flex justify-between">
                      <div className="flex text-destructive gap-2 cursor-pointer">Delete post</div>
                    </div>
                  </DropdownMenuItem>
                )}
                {isOwnProfile && (
                  <DropdownMenuItem>
                    <div className="flex justify-between" onClick={() => togglePinStatus()}>
                      <div className="flex gap-2 cursor-pointer">
                        {postDetails?.isPinned ? "Unpin post" : "Pin post"}
                      </div>
                    </div>
                  </DropdownMenuItem>
                )}
                {!isOwnProfile && (
                  <>
                    <DropdownMenuItem>
                      <div
                        className="flex justify-between"
                        onClick={() => setIsReportUserOpen(true)}
                      >
                        <div className="flex text-destructive gap-2 cursor-pointer">
                          <Info />
                          Report User
                        </div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <div className="flex justify-between">
                        <div className="flex gap-2 cursor-pointer">
                          <NotInterestedComp postId={postDetails?._id} />
                        </div>
                      </div>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

          {isReportUserOpen && (
            <ReportProblemAlert
              isOpen={isReportUserOpen}
              onClose={() => setIsReportUserOpen(false)}
              userId={postDetails?.userInfo[0]?._id}
            />
          )}
        </div>
      </div>
      <div className="flex flex-col min-w-96 w-full lg:w-1/2 lg:h-full justify-between">
        <div className="flex flex-col w-full">
          <div className="flex justify-between px-3 py-2 bg-muted">
            <div className="flex">
              <div className="mt-2 flex flex-col ">
                <div className="flex items-center ">
                  <div className="truncate max-w-28">{postDetails?.userInfo[0]?.fullName}</div>
                  {!isOwnProfile && (
                    <>
                      <div className="ml-3 lg:ml-4">
                        <SubscribePlan
                          type="card"
                          userNameTag={postDetails?.userInfo[0]?.userName}
                        />
                      </div>
                      {!postDetails?.isFollowing && (
                      <Button
                        size="sleek"
                        className="py-4 px-8 ml-3"
                        onClick={() =>
                          handleFollowClick(postDetails?.userInfo[0]?._id)
                        }
                      >
                        {postDetails?.isFollowing ? "Unfollow" : "Follow"}
                      </Button>)
                    </>
                  )}
                </div>

                <h2 className="text-lg font-semibold"></h2>
                <p className="text-sm text-muted-foreground mb-2">
                  {`@${postDetails?.userInfo[0]?.userName}`}
                </p>
                <p className="text-sm ">{postDetails?.content}</p>
                <p className="text-sm text-muted-foreground">
                  {formatTimestamp(postDate)}
                </p>
              </div>
            </div>
            <div className="flex mt-[0.9rem] mr-12 gap-2">
              {isOwnProfile && (
                <div
                  className="cursor-pointer"
                  onClick={() => togglePinStatus()}
                >
                  {postDetails?.isPinned ? (
                    <PinOff className="rotate-45" />
                  ) : (
                    <Pin className="rotate-45" />
                  )}
                </div>
              )}
              {isOwnProfile && (
                <DeleteModal
                  postDetails={postDetails}
                  openPopup={isDeleteModal}
                  setOpenPopup={setIsDeleteModal}
                  showTrigger={false}
                />
              )}
            </div>
          </div>
          <ScrollArea className="px-3 py-0 h-96">
            {comments?.length > 0 ? (
              comments?.map((comment, index) => (
                <Comment
                  key={comment?._id}
                  comment={comment}
                  onReply={handleReply}
                />
              ))
            ) : (
              <div className="flex items-center text-xl flex-col p-4">
                <h1>No Comments Yet</h1>
                <span className="text-sm text-muted-foreground">
                  Start the conversation.
                </span>
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="w-full border-t-2 border-muted ">
          <p className="ml-4 mt-3">{getPostDetails?.likesCount || 0} Likes</p>
          <div className="flex items-center gap-6">
            <div className="flex gap-2 w-full p-2 relative mt-2">
              <div className="relative w-full">
                <Input
                onKeyDown={ (e) => {
                  if(e.key === 'Enter'){
                    document.getElementById("send-comment").click()
                  }
                }}
                  type="text"
                  placeholder="Write a message..."
                  className="relative p-4"
                  value={commentMessage}
                  onChange={(e) => setCommentMessage(e.target.value)}
                />
                {parentCommentId && (
                  <div className="absolute top-2 cursor-pointer right-[50px]">
                    <CircleX
                      onClick={() => {
                        setCommentMessage("");
                        return setParentCommentId(null);
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="absolute right-4 bottom-3 bg-primary rounded-full cursor-pointer">
                <img
                  id="send-comment"
                  src="/assets/images/inbox/send-message.svg"
                  alt="send"
                  onClick={() => {
                    if (parentCommentId) {
                      return submitReply();
                    } else {
                      return submitComment();
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
