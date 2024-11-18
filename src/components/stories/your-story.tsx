import React, { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronRight, CircleX, CloudUpload, Plus, X } from "lucide-react";
import { Drawer, DrawerTrigger, DrawerContent } from "../ui/drawer";
import { Separator } from "../ui/separator";
import Stories from "react-insta-stories";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import { CircleFadingPlus, Grid3X3, Radio } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { AlertDialogCancel } from "@radix-ui/react-alert-dialog";
import Link from "next/link";
import { Input } from "../ui/input";
import SeeStory from "@/assets/images/popup/story.svg";
import UploadStory from "@/assets/images/Sidebar/upload.svg";
import Image from "next/image";
import { ABeeZee } from "next/font/google";
import { useContentUploadContext } from "@/context/open-content-modal";
import { Button } from "../ui/button";
import ContentUploadAlert from "../upload-content-options/content-upload-alert";
// import TipDialogComponent from "../shared/tip-dialog-component";
import { useLikeStoryMutation } from "@/redux/services/haveme/posts";
import ContentUploadDrawer from "../upload-content-options/content-upload-drawer";
import { baseServerUrl, getInitials } from "@/lib/utils";
import { useUserOnboardingContext } from "@/context/UserOnboarding";
import YourStoryMobile from "./your-story-mobile";
// import TipDrawerComponent from "../shared/tip-drawer-component";

// TODO: Make this font definition dynamic
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

interface YourStoryProps {
  content: {
    type: string;
    url: string;
    storyId: string;
    isLiked: boolean;
  }[];
}
function YourStory({ content = [] }: YourStoryProps) {
  const userData = useUserOnboardingContext();
  const [likeStory] = useLikeStoryMutation();
  const [likeStories, setLikeStories] = useState(content);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState<boolean>(false);
  let currentStory = useRef("");
  const [uploadOptions, setUploadOptions] = useState(false);
  const { isMobile } = useClientHardwareInfo();
  const { isContentUploadOpen, toggleContentUploadOpen } =
    useContentUploadContext();

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

  return (
    <>
      {isMobile ? (
        <Drawer>
          <DrawerTrigger asChild>
            <div className="flex flex-col justify-center align-middle w-fit min-w-24 p-2">
              <div className="flex justify-center relative">
                <Avatar className="size-16">
                  <AvatarImage
                    className="relative block"
                    src={`${baseServerUrl}/${userData?.user?.photo?.path}`}
                  />
                  <AvatarFallback>
                    {getInitials(userData?.user?.fullName)}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute rounded-full bottom-0 right-0 bg-primary">
                  <Plus className="text-white p-1" />
                </span>
              </div>
              <div className="flex justify-center">
                <h2 className="text-sm mt-1">Your Story</h2>
              </div>
            </div>
          </DrawerTrigger>
          {isContentUploadOpen ? (
            <DrawerContent className="min-h-3/4 p-4">
              <ContentUploadDrawer />
            </DrawerContent>
          ) : (
            <DrawerContent className="min-h-3/4 p-4">
              <div className="flex flex-col gap-4 mx-auto w-full max-w-sm mt-8">
                {content.length > 0 && <YourStoryMobile content={content} />}
                <Separator />
                <div className="flex justify-between">
                  <div
                    className="flex gap-2"
                    onClick={() => {
                      toggleContentUploadOpen(true);
                      return setUploadOptions(true);
                    }}
                  >
                    <UploadStory className="stroke-foreground" />
                    Upload new story
                  </div>
                  <ChevronRight />
                </div>
                <Separator />
              </div>
            </DrawerContent>
          )}
        </Drawer>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="cursor-pointer flex flex-col justify-center align-middle w-fit min-w-24 p-2">
              <div className="flex justify-center relative">
                <Avatar className="size-16">
                  <AvatarImage
                    className="relative block"
                    src={`${baseServerUrl}/${userData?.user?.photo?.path}`}
                  />
                  <AvatarFallback>
                    {getInitials(userData?.user?.fullName)}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute rounded-full bottom-0 right-0 bg-primary">
                  <Plus className="text-white p-1" />
                </span>
              </div>
              <div className="flex justify-center">
                <h2 className="text-sm mt-1">Your Story</h2>
              </div>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="p-4 flex flex-col gap-4">
            {content.length > 0 && (
              <div className="flex justify-between">
                <AlertDialog>
                  <AlertDialogTrigger>
                    <div className="flex justify-between">
                      <div className="flex gap-2">
                        <SeeStory className="stroke-foreground" />
                        See your story
                      </div>
                    </div>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="p-0 w-fit">
                    <div className="w-fit">
                      <div className="relative rounded-2xl">
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
                        <div className="flex justify-center align-middle">
                          <div className="flex justify-center ">
                            <Avatar className="size-14 border-2 border-primary">
                              <AvatarImage
                                src={`${process.env.NEXT_PUBLIC_API_SERVER}/${userData?.user?.photo?.path}`}
                              />
                              <AvatarFallback>CJ</AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="ml-2">
                            <p className={` text-lg  ${fontItalic.className}`}>
                              {userData?.user?.fullName}
                            </p>
                            <p className="text-sm">
                              {userData?.user?.userName}
                            </p>
                          </div>
                        </div>
                        <div className="z-[1000]">
                          <AlertDialogCancel>
                            <X className="mt-1 " />
                          </AlertDialogCancel>
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
                          {/* no tip for own profile */}
                          {/* <TipDialogComponent /> */}
                        </div>
                      </div>
                    </div>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}

            <div className="flex justify-between">
              <Button
                variant="ghost"
                className="pl-0 hover:bg-transparent"
                onClick={() => {
                  toggleContentUploadOpen(true);
                }}
              >
                <div className="flex gap-2">
                  {/* <img src="/assets/images/SideBar/upload.svg" alt="upload" /> */}
                  <UploadStory className="stroke-foreground" />
                  <div className="pt-0.5 not-italic	text-base">
                    {" "}
                    Upload new story
                  </div>
                </div>
              </Button>
              <ContentUploadAlert />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
}

export default YourStory;
