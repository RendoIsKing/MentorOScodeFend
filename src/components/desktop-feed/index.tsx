"use client";
import React, { useState } from "react";
import Heart from "@/assets/images/Home/heart.svg";
import HeartActive from "@/assets/images/Home/heart-active.svg";
import Bookmark from "@/assets/images/Home/archive.svg";
import BookmarkActive from "@/assets/images/Home/bookmark-active.svg";
import More from "@/assets/images/Home/more.svg";

import { Info, ThumbsDown } from "lucide-react";
import CommentsComp from "@/components/comments-comp";
import Link from "next/link";
import { baseServerUrl } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import ReportProblemAlert from "@/components/report-problem";
import { cn } from "@/lib/utils";
import { ABeeZee } from "next/font/google";
// Removed TipDialogComponent per request
import {
  useLikePostMutation,
  useSavePostMutation,
} from "@/redux/services/haveme/posts";
import { PostMediaFileObject } from "@/contracts/responses/IPostContentResponse";
import { IPostObjectResponse } from "@/contracts/responses/IPostObjectResponse";
import TaggedUserPopup from "../tagged-user-popup";
import NotInterestedComp from "../shared/not-interested";

// TODO: Make this font definition dynamic
const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

interface IMyUserDataProps {
  feedData: IPostObjectResponse;
}

const DesktopFeed: React.FC<IMyUserDataProps> = ({ feedData }) => {
  const [selectBookmark, setSelectBookmark] = useState(false);
  const [isReportUserOpen, setIsReportUserOpen] = useState(false);

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

  const [likePost] = useLikePostMutation();
  const [savePost] = useSavePostMutation();

  const handleSelectHeart = (postId: string) => {
    if (heartStates) {
      likePost(postId);
      setHeartStates(() => false);
      setHeartLikecount((prev) => prev - 1);
    } else {
      likePost(postId);
      setHeartStates(() => true);
      setHeartLikecount((prev) => prev + 1);
    }
  };

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
  };

  return (
    <div className="flex flex-col gap-y-4">
      {/* Tip removed */}

      <div className="flex justify-center ">
        <div
          className={cn(
            "flex flex-col items-center gap-2 justify-center cursor-pointer"
          )}
          onClick={() => handleSelectHeart(feedData?._id)}
        >
          {heartStates ? (
            <HeartActive className="fill-foreground cursor-pointer" />
          ) : (
            <Heart className="fill-foreground cursor-pointer" />
          )}
          {heartLikecount}
        </div>
      </div>

      <CommentsComp feedData={feedData} />
      <div
        className={cn(
          "flex flex-col items-center gap-2 justify-center cursor-pointer",
          {
            "text-amber-300": selectBookmark,
          }
        )}
        onClick={() => handleSavePost(feedData?._id)}
      >
        {saveStates ? (
          <BookmarkActive className="fill-foreground cursor-pointer" />
        ) : (
          <Bookmark className="fill-foreground cursor-pointer" />
        )}
        {saveLikecount}
      </div>
      {feedData?.userTags?.length > 0 && (
        <TaggedUserPopup postId={feedData?._id} />
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex flex-col items-center gap-2 lg:gap-0 justify-center cursor-pointer">
            <More className="fill-foreground cursor-pointer" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="p-2 border-[#0B0F14] light:bg-secondary dark:bg-[#0B0F14]"
          side="top"
        >
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
                {/* <ThumbsDown />
                Not Interested */}
                <NotInterestedComp postId={feedData?._id} />
              </div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Link href="/flip">
        <div className="flex flex-col items-center gap-2 justify-center"></div>
      </Link>

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

export default DesktopFeed;
