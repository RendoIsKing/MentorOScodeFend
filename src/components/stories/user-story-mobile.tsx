/* eslint-disable @next/next/no-img-element */
import React, { useRef, useState } from "react";
import Stories from "react-insta-stories";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { getInitials } from "@/lib/utils";

// TODO: Make this font definition dynamic
interface ContentDetails {
  type: string;
  url: string;
  storyId: string;
  isLiked: boolean;
}

interface UserStoriesInterface {
  content: ContentDetails[];
  userName?: string;
  fullName?: string;
  id: string;
  imagePath?: string;
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

function UserStoryMobile({
  content,
  userName,
  fullName,
  id,
  imagePath,
}: UserStoriesInterface) {
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
      <AlertDialogTrigger asChild>
        <div className="flex flex-col justify-center align-middle w-fit p-2 cursor-pointer">
          <div className="flex justify-center">
            <Avatar className="size-16 border-2 border-primary">
              <AvatarImage
                src={`${process.env.NEXT_PUBLIC_API_SERVER}/${imagePath}`}
              />
              <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex justify-center">
            <h2 className="">{userName}</h2>
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
                    src={`${process.env.NEXT_PUBLIC_API_SERVER}/${imagePath}`}
                  />
                  <AvatarFallback>CJ</AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-2">
                <p className={`text-lg  ${fontItalic.className}`}>{fullName}</p>
                <p className="text-sm">{userName}</p>
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
              <TipDrawerComponent
                creatorId={id}
                tipOn={content[index - 1]?.storyId}
              />
            </div>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default UserStoryMobile;
