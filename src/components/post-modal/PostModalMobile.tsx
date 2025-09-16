"use client";

import PostInteraction from "@/components/postInteraction";
import { Label } from "@radix-ui/react-dropdown-menu";
import { VideoPlayer } from "@/components/video-player";
import {
  useGetPostByIdQuery,
  useGetPostsByUserNameQuery,
  useUpdatePostMutation,
} from "@/redux/services/haveme/posts";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";
import { useParams, useSearchParams } from "next/navigation";
import FullBleedFeed from "@/components/feed/FullBleedFeed";
import { cn, textFormatter } from "@/lib/utils";
import { useCallback, useRef, useState } from "react";
import {
  useCreateImpressionMutation,
  useLogViewMutation,
} from "@/redux/services/haveme/interactions";
import { Pin, PinOff } from "lucide-react";
import { toast } from "../ui/use-toast";
import { useAppDispatch, useTypedSelector } from "@/redux/store";
import { updatePost } from "@/redux/slices/adapters";
import { useUserOnboardingContext } from "@/context/UserOnboarding";
import { useGetUserDetailsByUserNameQuery } from "@/redux/services/haveme/user";

interface IPostModalMobileProps {
  postId: string | string[];
}

const PostModalMobile: React.FC<IPostModalMobileProps> = ({ postId }) => {
  const searchParams = useSearchParams();
  const fromProfile = searchParams?.get('fromProfile') === '1';
  const routeParams = useParams();
  const routeUid = (routeParams?.uid as string) || undefined;
  const { data: postDetails } = useGetPostByIdQuery(postId);
  const [showTaggedPeople, setShowTaggedPeople] = useState(false);
  const [createImpressionTrigger] = useCreateImpressionMutation();
  const appDispatch = useAppDispatch();
  const currentUserId = (useTypedSelector((s: any) => s?.auth?.user?._id) as string | null) || (useUserOnboardingContext()?.user?._id as string | null) || null;

  const fileType = postDetails?.media?.[0]?.mediaType;
  const { isMobile, orientation, softwareOrientation, hardwareOrientation } =
    useClientHardwareInfo();
  const isPortraitHardware = hardwareOrientation === "portrait-primary";
  const isPortraitSoftware = softwareOrientation === "portrait-primary";
  const timeoutIdRef = useRef(null);
  const [logViewTrigger] = useLogViewMutation();
  const [updatePostTrigger] = useUpdatePostMutation();

  const createImpression = useCallback(() => {
    if (postDetails?._id) {
      createImpressionTrigger({ postId: postDetails?._id });
      timeoutIdRef.current = setTimeout(() => {
        logViewTrigger({ postId: postDetails?._id });
      }, 5000);
    }
  }, [postDetails?._id, createImpressionTrigger]);

  const logView = () => {
    if (postDetails?._id) {
      timeoutIdRef.current = setTimeout(() => {
        logViewTrigger({ postId: postDetails?._id });
      }, 5000);
    }
  };

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
      })
      .catch((err) => {
        console.log(err);
        toast({
          variant: "destructive",
          description: err.data?.error?.message || "Something went wrong.",
        });
      });
  };

  // Prefer route username for profile scroller; fallback to post details
  const profileUserName = (routeUid as string) || (postDetails?.userInfo?.[0]?.userName as string | undefined);
  const shouldRenderProfileScroller = fromProfile && typeof profileUserName === 'string' && profileUserName.length > 0;

  // Fetch authoritative profile details to get the correct avatar path for this profile
  const { data: userDetailsResp } = useGetUserDetailsByUserNameQuery(
    { userName: profileUserName as string },
    { skip: !shouldRenderProfileScroller }
  );

  // Fetch the user's posts list to build a contiguous feed (always call hook; control via skip)
  const { data: userPostsList, isFetching: isUserPostsLoading } = useGetPostsByUserNameQuery(
    shouldRenderProfileScroller ? { userName: profileUserName as string, page: 1, perPage: 100, filter: 'posts' } as any : ({ userName: '', page: 1, perPage: 1, filter: 'posts' } as any),
    { skip: !shouldRenderProfileScroller }
  );
  const postsArray = (userPostsList as any)?.data ?? [];
  const normalizedPosts = postsArray.flatMap((p: any) => {
    const m = p?.mediaFiles?.[0];
    if (!m?.path) return [] as any[];
    const isVideo = (m?.mimeType && m.mimeType.startsWith('video/')) || /\.(mp4|webm|mov)$/i.test(m.path);
    const base = (process.env.NEXT_PUBLIC_API_SERVER as any) || '/api/backend';
    const src = m.path.startsWith('http') ? m.path : `${base}/${m.path}`;
    // Prefer authoritative profile avatar from user details when viewing profile scroller
    const profilePhotoPath = (userDetailsResp as any)?.data?.photo?.path;
    const avatarPath = profilePhotoPath || p?.userInfo?.[0]?.photo?.path || p?.userPhoto?.[0]?.path;
    const avatarUrl = avatarPath ? (String(avatarPath).startsWith('http') ? avatarPath : `${base}/${avatarPath}`) : "/assets/images/Home/small-profile-img.svg";
    const user = {
      id: String(p?.userInfo?.[0]?._id || ""),
      username: String(p?.userInfo?.[0]?.userName || ""),
      displayName: String(p?.userInfo?.[0]?.fullName || ""),
      avatarUrl,
      viewerFollows: Boolean(p?.isFollowing),
    };
    return [{ id: String(p._id ?? p.id), type: isVideo ? 'video' : 'image', src, user }];
  });
  const initialIndex = Math.max(0, normalizedPosts.findIndex((p: any) => p.id === String(postId)));

  if (shouldRenderProfileScroller) {
    if (isUserPostsLoading) {
      return <div className="w-screen h-screen flex items-center justify-center text-muted-foreground">Laster…</div>;
    }
    if (normalizedPosts.length > 0) {
      return (
        <div className={cn("scrollbar w-screen h-screen")}>        
          <FullBleedFeed
            posts={normalizedPosts}
            initialIndex={initialIndex}
            currentUserId={currentUserId}
            RightOverlay={({ post }) => {
              const original = postsArray.find((p: any) => String(p._id ?? p.id) === post.id);
              if (!original) return null as any;
              return <PostInteraction postDetails={original} />;
            }}
          />
        </div>
      );
    }
    // If no posts, fall through to single-view as a safe fallback
  }

  // Guard against undefined post details while loading
  if (!postDetails) {
    return <div className={cn("scrollbar w-screen h-screen flex items-center justify-center text-muted-foreground")}>
      Laster…
    </div>;
  }

  return (
    <div className={cn("scrollbar w-screen h-screen")}> 
      {fileType === "image" ? (
        <div className="flex justify-center h-full items-center">
          <img
            src={postDetails?.mediaFiles?.[0]?.path ? `${process.env.NEXT_PUBLIC_API_SERVER}/${postDetails.mediaFiles[0].path}` : undefined}
            className={cn("h-screen w-screen rounded-md", {
              "h-3/4": isMobile,
              "w-full h-full flex": !isPortraitHardware,
              "w-screen": !isPortraitHardware && isMobile,
              "rotate-90": !isPortraitSoftware && isPortraitHardware,
            })}
            alt="profile-post"
            onClick={() => setShowTaggedPeople(!showTaggedPeople)}
            onLoad={() => logView()}
          />
          <div>
            {showTaggedPeople &&
              (postDetails?.userTags || []).map((user, index) => {
                const y = user?.location?.y ?? 0;
                const x = user?.location?.x ?? 0;
                return (
                  <p
                    key={index}
                    style={{
                      position: "absolute",
                      top: `${y}%`,
                      left: `${x}%`,
                      backgroundColor: "black",
                    }}
                  >
                    {user?.userName || ""}
                  </p>
                );
              })}
          </div>
        </div>
      ) : (
        <VideoPlayer
          videoSrc={postDetails?.mediaFiles?.[0]?.path ? `${process.env.NEXT_PUBLIC_API_SERVER}/${postDetails.mediaFiles[0].path}` : undefined}
          className={cn("h-screen w-screen rounded-md", {
            "h-full": isMobile,
            "w-full h-full flex": !isPortraitHardware,
            "w-screen": !isPortraitHardware && isMobile,
            "rotate-90": !isPortraitSoftware && isPortraitHardware,
          })}
          createImpression={createImpression}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/10">
        <div
          className={cn(
            "absolute right-0 ",
            !isPortraitHardware ? "scale-50 bottom-0" : "bottom-16 "
          )}
        >
          <div
            className="cursor-pointer ml-8 mb-8 size-2"
            onClick={() => togglePinStatus()}
          >
            {postDetails?.isPinned ? (
              <PinOff className="rotate-45" />
            ) : (
              <Pin className="rotate-45" />
            )}
          </div>
          <PostInteraction postDetails={postDetails} />
        </div>
        <div className="flex flex-col p-4 absolute bottom-20 text-white">
          <div>
            <Label>@{postDetails?.userInfo?.[0]?.fullName || ""}</Label>
          </div>
          <div className="">
            <Label>{textFormatter(postDetails?.content || "")}</Label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostModalMobile;
