"use client";

import PostInteraction from "@/components/postInteraction";
import { Label } from "@radix-ui/react-dropdown-menu";
import { VideoPlayer } from "@/components/video-player";
import {
  useGetPostByIdQuery,
  useUpdatePostMutation,
} from "@/redux/services/haveme/posts";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";
import { cn, textFormatter } from "@/lib/utils";
import { useCallback, useRef, useState } from "react";
import {
  useCreateImpressionMutation,
  useLogViewMutation,
} from "@/redux/services/haveme/interactions";
import { Pin, PinOff } from "lucide-react";
import { toast } from "../ui/use-toast";
import { useAppDispatch } from "@/redux/store";
import { updatePost } from "@/redux/slices/adapters";

interface IPostModalMobileProps {
  postId: string | string[];
}

const PostModalMobile: React.FC<IPostModalMobileProps> = ({ postId }) => {
  const { data: postDetails } = useGetPostByIdQuery(postId);
  const [showTaggedPeople, setShowTaggedPeople] = useState(false);
  const [createImpressionTrigger] = useCreateImpressionMutation();
  const appDispatch = useAppDispatch();

  const fileType = postDetails?.media[0]?.mediaType;
  const { isMobile, orientation, softwareOrientation, hardwareOrientation } =
    useClientHardwareInfo();
  // const isSoftwarePortrait =
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

  return (
    <div className={cn("scrollbar w-screen h-screen")}>
      {fileType === "image" ? (
        // <div className="flex justify-center h-full items-center">
        <div className="flex justify-center h-full items-center">
          <img
            src={`${
              process.env.NEXT_PUBLIC_API_SERVER +
              "/" +
              postDetails?.mediaFiles[0].path
            }`}
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
              postDetails?.userTags?.map((user, index) => {
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
        // </div>
        <VideoPlayer
          videoSrc={`${
            process.env.NEXT_PUBLIC_API_SERVER +
            "/" +
            postDetails?.mediaFiles[0].path
          }`}
          // className="h-screen w-screen"
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
            <Label>@{postDetails?.userInfo[0].fullName}</Label>
          </div>
          <div className="">
            <Label>{textFormatter(postDetails?.content)}</Label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostModalMobile;
