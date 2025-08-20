/* eslint-disable @next/next/no-img-element */
import React, { useRef, useState } from "react";
import Stories from "react-insta-stories";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SeeStory from "@/assets/images/popup/story.svg";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { ABeeZee } from "next/font/google";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import TipDrawerComponent from "../shared/tip-drawer-component";
import { useLikeStoryMutation } from "@/redux/services/haveme/posts";
import { useUserOnboardingContext } from "@/context/UserOnboarding";

// TODO: Make this font definition dynamic
interface ContentDetails {
  type: string;
  url: string;
  storyId: string;
  isLiked: boolean;
}

interface UserStoriesInterface {
  content: ContentDetails[];
}

const storyContent = {
  width: "100%",
  maxWidth: "100%",
  maxHeight: "100%",
  margin: "auto",
};

const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

export default function YourStoryMobile({ content }: UserStoriesInterface) {
  const userData = useUserOnboardingContext();
  const [likeStory] = useLikeStoryMutation();
  const [likeStories, setLikeStories] = useState(content);
  const [index, setIndex] = useState(0);
  let currentStory = useRef("");

  const toggleLikeOnStory = async (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    currentStoryId: string
  ) => {
    event.stopPropagation();
    try {
      const res = await likeStory(currentStoryId);
      content[index - 1].isLiked = !content[index - 1].isLiked;

      setLikeStories(content);
    } catch (error) {
      console.log("error", error);
    }
  };
  const { isMobile } = useClientHardwareInfo();

  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <div className="flex justify-between">
          <div className="flex gap-2">
            <SeeStory className="stroke-foreground" /> See your story
          </div>
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent
        className={isMobile ? "p-0 h-screen w-screen" : "p-0 max-w-[410px] "}
      >
        <div className="w-['100%']">
          <div className="relative">
            <Stories
              stories={content}
              defaultInterval={1500}
              height={"100vh"}
              loop={true}
              width={"100%"}
              keyboardNavigation={true}
              onStoryStart={(s: number) => {
                currentStory.current = content[s].storyId;
                setIndex(s + 1);
              }}
            />
          </div>
          <div className="flex gap-4 justify-between absolute top-4 w-full px-4 items-center">
            <div className="flex justify-center align-middle">
              <div className="flex justify-center ">
                <Avatar className="size-14 border-2 border-primary">
                  <AvatarImage
                    src={userData?.user?.photo?.path ? `${process.env.NEXT_PUBLIC_API_SERVER}/${userData.user.photo.path}` : undefined}
                  />
                  <AvatarFallback>CJ</AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-2">
                <p className={`text-lg  ${fontItalic.className}`}>
                  {userData?.user?.fullName}
                </p>
                <p className="text-sm">{userData?.user?.userName}</p>
              </div>
            </div>
            <div className="z-[1000]">
              <AlertDialogCancel>
                <X className="mb-[2rem] z-10 text-red" />
              </AlertDialogCancel>
            </div>
          </div>
          <div className="absolute bottom-4 flex flex-col justify-end gap-2 w-full px-4 z-[1000]">
            <div className="flex items-center gap-4 mt-1">
              <div className="relative grow ">
                <Input
                  className="px-4 text-sm "
                  type="text"
                  placeholder="Write comment..."
                />
                <img
                  src="\assets\images\inbox\send-message.svg"
                  alt=""
                  className="absolute top-1 right-2"
                />
              </div>
              <div
                onClick={(e) => {
                  toggleLikeOnStory(e, currentStory.current);
                }}
              >
                {index > 0 && content[index - 1].isLiked ? (
                  <img
                    src="\assets\images\Home\heart-active.svg"
                    alt=""
                    className=""
                  />
                ) : (
                  <img
                    src="\assets\images\Home\heart.svg"
                    alt=""
                    className=""
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
