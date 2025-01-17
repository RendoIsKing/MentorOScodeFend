import React, { useRef, useState } from "react";
import Stories from "react-insta-stories";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";
import UserStoryMobile from "./user-story-mobile";
import { ABeeZee } from "next/font/google";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import TipDrawerComponent from "../shared/tip-drawer-component";
import { useLikeStoryMutation } from "@/redux/services/haveme/posts";
import { getInitials } from "@/lib/utils";

interface ContentDetails {
  type: string;
  url: string;
  storyId: string;
  isLiked: boolean;
}

interface UserStoriesInterface {
  content: ContentDetails[];
  userName: string;
  fullName: string;
  imagePath?: string;
  id?: string;
}

const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

const storyContent = {
  width: "auto",
  maxWidth: "100%",
  maxHeight: "100%",
  margin: "auto",
};

function UserStories({
  content,
  userName = "",
  fullName = "",
  imagePath = "",
  id,
}: UserStoriesInterface) {
  const [likeStory] = useLikeStoryMutation();
  const [likeStories, setLikeStories] = useState(content);
  const [index, setIndex] = useState(0);
  let currentStory = useRef("");

  const { isMobile } = useClientHardwareInfo();
  const pathname = usePathname();
  let isOtherProfile = pathname === "/view-other-profile" ? true : false;
  const [paused, setPaused] = useState<boolean>(false);
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

  return isMobile ? (
    <UserStoryMobile
      content={content}
      userName={userName}
      fullName={fullName}
      id={id}
      imagePath={imagePath}
    />
  ) : (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex flex-col justify-center align-middle w-fit p-2 cursor-pointer">
          <div className="flex justify-center">
            <Avatar className="size-16 border-2 border-primary">
              <AvatarImage
                src={`${process.env.NEXT_PUBLIC_API_SERVER}/${imagePath}`}
              />
              <AvatarFallback>CJ</AvatarFallback>
            </Avatar>
          </div>
          {!isOtherProfile && (
            <div className="flex justify-center">
              <h2 className="">{userName}</h2>
            </div>
          )}
        </div>
      </DialogTrigger>
      <DialogContent
        className="p-0 w-fit"
        onOpenAutoFocus={(e: Event) => e.preventDefault()}
      >
        {/* onClick={() => setPaused(!paused)} used inside below div*/}
        <div className="w-fit">
          <div className="relative" id="story">
            <Stories
              stories={content}
              defaultInterval={1500}
              loop={true}
              keyboardNavigation={true}
              storyStyles={storyContent}
              onStoryStart={(s: number) => {
                currentStory.current = content[s].storyId;
                setIndex(s + 1);
              }}
            />
          </div>

          <div className="flex gap-4 justify-between absolute top-4 w-full px-4">
            <div className="flex justify-center align-middle gap-2">
              <div className="flex justify-center ">
                <Avatar className="size-14 border-2 border-primary">
                  <AvatarImage
                    src={`${process.env.NEXT_PUBLIC_API_SERVER}/${imagePath}`}
                  />
                  <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex flex-col justify-center">
                <p className={`text-sm ${fontItalic.className}`}>{fullName}</p>
                <p className="text-xs">{userName}</p>
              </div>
              {isOtherProfile && (
                <Button className="h-8 my-2">Live Stream</Button>
              )}
            </div>
          </div>

          <div className="absolute bottom-4 flex flex-col justify-end gap-2 w-full px-4 z-[1000]">
            <div className="flex items-center gap-4 mt-1">
              <div className="relative grow ">
                <Input
                  className="px-4 text-sm"
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
      </DialogContent>
    </Dialog>
  );
}

export default UserStories;
