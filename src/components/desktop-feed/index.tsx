"use client";
import React, { useState } from "react";
import Heart from "@/assets/images/Home/heart.svg";
import HeartActive from "@/assets/images/Home/heart-active.svg";
// Replace bookmark icons with star
import More from "@/assets/images/Home/more.svg";

import { Info, ThumbsDown, Star } from "lucide-react";
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
  currentUserId?: string | null;
}

import DeleteModal from "@/components/delete-modal";
import { useGetUserDetailsQuery } from "@/redux/services/haveme";

const DesktopFeed: React.FC<IMyUserDataProps> = ({ feedData, currentUserId }) => {
  const [selectBookmark, setSelectBookmark] = useState(false);
  const [isReportUserOpen, setIsReportUserOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

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

  const author = (Array.isArray((feedData as any)?.userInfo) ? (feedData as any).userInfo[0] : (feedData as any).userInfo) as any;
  // Prefer top-level userPhoto (Home API often provides this), then userInfo fallbacks
  const upTop = (feedData as any)?.userPhoto;
  let rawPath = (Array.isArray(upTop) && upTop[0]?.path) ? upTop[0].path : undefined;
  const avatarFileId = author?.photoId || (Array.isArray(upTop) ? upTop?.[0]?._id : undefined) || author?.photo?._id || (Array.isArray(author?.userPhoto) ? author?.userPhoto?.[0]?._id : undefined);
  if (!rawPath) rawPath = author?.photoPath || author?.photo?.path || (Array.isArray(author?.userPhoto) ? author?.userPhoto?.[0]?.path : author?.userPhoto?.path);
  // Prefer path (actual image) over id endpoint (JSON metadata)
  const authorAvatar = rawPath
    ? (String(rawPath).startsWith('http') ? String(rawPath) : `${baseServerUrl}/${rawPath}`)
    : (avatarFileId ? `${baseServerUrl}/v1/user/files/${String(avatarFileId)}` : "/assets/images/search/small-profile-img.svg");
  const authorUserName = ((author?.userName) || ((Array.isArray((feedData as any)?.userInfo) ? (feedData as any).userInfo[0]?.userName : (feedData as any).userInfo?.userName)) || '').toString();
  // Resolve current user id robustly from props or /auth/me
  const { data: me } = useGetUserDetailsQuery();
  const resolvedCurrentUserId = (currentUserId as any) || (me as any)?.data?._id || (me as any)?.data?.user?._id || null;
  const isOwner = Boolean(
    resolvedCurrentUserId && (
      String(resolvedCurrentUserId) === String(author?._id || author?.id) ||
      String(resolvedCurrentUserId) === String((feedData as any)?.user)
    )
  );

  return (
    <div className="flex flex-col gap-y-4">
      {/* Author avatar (desktop only) */}
      <div className="flex justify-center">
        <Link href={`/${authorUserName.toLowerCase()}`} className="inline-block" aria-label="Open author profile">
          <img src={authorAvatar} alt="author avatar" className="h-10 w-10 rounded-full object-cover shadow" />
        </Link>
      </div>

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
            "text-amber-300": saveStates,
          }
        )}
        onClick={() => handleSavePost(feedData?._id)}
      >
        <Star
          className="cursor-pointer"
          // fill star when saved, outline when not
          fill={saveStates ? "currentColor" : "none"}
        />
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
          {isOwner ? (
            <DropdownMenuItem onClick={() => setOpenDelete(true)}>
              <div className="flex justify-between">
                <div className="flex text-destructive gap-2 cursor-pointer">Delete post</div>
              </div>
            </DropdownMenuItem>
          ) : (
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
          )}
          {!isOwner && (
            <DropdownMenuItem>
              <div className="flex justify-between">
                <div className="flex gap-2 cursor-pointer">
                  {/* <ThumbsDown />
                  Not Interested */}
                  <NotInterestedComp postId={feedData?._id} />
                </div>
              </div>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {isOwner && (
        <DeleteModal openPopup={openDelete} setOpenPopup={setOpenDelete} postDetails={feedData as any} showTrigger={false} />
      )}

      {/* Flip media button removed */}

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
