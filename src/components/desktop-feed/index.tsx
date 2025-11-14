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
import { getUserAvatarUrl } from "@/lib/media";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import ReportProblemAlert from "@/components/report-problem";
import { cn } from "@/lib/utils";
// Removed TipDialogComponent per request
import {
  useLikePostMutation,
  useSavePostMutation,
} from "@/redux/services/haveme/posts";
import { PostMediaFileObject } from "@/contracts/responses/IPostContentResponse";
import { IPostObjectResponse } from "@/contracts/responses/IPostObjectResponse";
import TaggedUserPopup from "../tagged-user-popup";
import NotInterestedComp from "../shared/not-interested";

// Italic font removed per design (no italics platform-wide)

interface IMyUserDataProps {
  feedData: IPostObjectResponse;
  currentUserId?: string | null;
}

import DeleteModal from "@/components/delete-modal";
import { useGetUserDetailsQuery } from "@/redux/services/haveme";
import { useMeNormalized } from "@/hooks/useMeNormalized";

const DesktopFeed: React.FC<IMyUserDataProps> = ({ feedData, currentUserId }) => {
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
  // Build a minimal user object compatible with media util
  const authorForAvatar = {
    photo: author?.photo || (Array.isArray(author?.userPhoto) ? author?.userPhoto?.[0] : author?.userPhoto) || null,
    photoId: author?.photoId,
  };
  const authorAvatar = getUserAvatarUrl(authorForAvatar, "/assets/images/search/small-profile-img.svg");
  const authorUserName = ((author?.userName) || ((Array.isArray((feedData as any)?.userInfo) ? (feedData as any).userInfo[0]?.userName : (feedData as any).userInfo?.userName)) || '').toString();
  // Resolve current user id robustly from props or normalized hook
  const { me: meNormalized } = useMeNormalized();
  const extractId = (val: any): string => {
    if (!val) return "";
    if (typeof val === "string") return val;
    if (typeof val === "object") {
      if (val._id) return String(val._id);
      if ((val as any).$oid) return String((val as any).$oid);
      const s = typeof val.toString === "function" ? val.toString() : "";
      // Supports strings like ObjectId("...") or new ObjectId("...")
      const m = s.match(/[a-f0-9]{24}/i);
      return m ? m[0] : "";
    }
    return "";
  };
  const resolvedCurrentUserId = (currentUserId as any) || meNormalized?._id || null;
  const myUserNameLc = (meNormalized?.userName ? String(meNormalized.userName).toLowerCase() : "");
  const authorUserNameLc = (authorUserName ? String(authorUserName).toLowerCase() : "");
  const ownerCandidates = [
    extractId(author?._id || author?.id),
    extractId((feedData as any)?.user),
    extractId((feedData as any)?.userId),
    extractId((feedData as any)?.owner),
    extractId((feedData as any)?.createdBy),
  ].filter(Boolean);
  const isOwnerById = Boolean(resolvedCurrentUserId && ownerCandidates.some((id)=> id && String(id) === String(resolvedCurrentUserId)));
  const isOwnerByUserName = Boolean(myUserNameLc && authorUserNameLc && myUserNameLc === authorUserNameLc);
  const isOwnerApi = Boolean((feedData as any)?.isOwner);
  const isOwner = isOwnerApi || isOwnerById || isOwnerByUserName;

  return (
    <div className="flex flex-col gap-y-4">
      {/* Author avatar (desktop only) */}
      <div className="flex justify-center">
        <Link href={`/${authorUserName.toLowerCase()}`} className="inline-block" aria-label="Open author profile">
          <img src={authorAvatar} alt="author avatar" width="40" height="40" className="h-10 w-10 rounded-full object-cover shadow" loading="lazy" decoding="async" />
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
            "text-primary": saveStates,
          }
        )}
        onClick={() => handleSavePost(feedData?._id)}
        aria-label={saveStates ? "Unsave post" : "Save post"}
      >
        <Star
          className="cursor-pointer"
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
          className="p-2 border-border bg-card"
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
