"use client";
import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useGetPostByIdQuery,
  useGetCommentsByPostIdQuery,
  useLikePostMutation,
  useSavePostMutation,
  useUpdatePostCommentMutation,
  useUpdatePostMutation,
} from "@/redux/services/haveme/posts";
import { useGetUserDetailsQuery } from "@/redux/services/haveme";
import { useFollowUserMutation } from "@/redux/services/haveme/user";
import { X as IconX } from "lucide-react";
import NotInterestedComp from "../shared/not-interested";
import DeleteModal from "../delete-modal";
import { baseServerUrl } from "@/lib/utils";

export default function PostModalContent({ postId }: any) {
  const router = useRouter();
  const { data, isLoading, error } = useGetPostByIdQuery(postId);
  const post: any = (data as any)?.data || data;
  const { data: meData } = useGetUserDetailsQuery();
  const myId: any = (meData as any)?.data?._id;
  const isOwner = Boolean(myId && String(post?.user) === String(myId) || String(post?.userInfo?.[0]?._id || "") === String(myId || ""));
  const base = (baseServerUrl as any) || "/api/backend";

  const { data: commentsRes } = useGetCommentsByPostIdQuery(postId);
  const comments: any[] = (commentsRes as any)?.data || [];

  const [likePost] = useLikePostMutation();
  const [savePost] = useSavePostMutation();
  const [addComment] = useUpdatePostCommentMutation();
  const [updatePost] = useUpdatePostMutation();
  const [followUser] = useFollowUserMutation();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);
  const [zoom, setZoom] = useState(false);

  const mediaSrc = useMemo(() => {
    if (!post) return undefined;
    const fileId = (post?.mediaFiles?.[0] && (post?.mediaFiles?.[0]?._id || post?.mediaFiles?.[0]?.id)) || post?.media?.[0]?.mediaId;
    if (fileId) return `${base}/v1/user/files/${String(fileId)}`;
    const path = post?.mediaFiles?.[0]?.path;
    return path ? `${base}/${path}` : undefined;
  }, [post]);

  const avatarUrl = useMemo(() => {
    const avatarId = post?.userInfo?.[0]?.photoId || post?.userInfo?.[0]?.photo?._id;
    if (avatarId) return `${base}/v1/user/files/${String(avatarId)}`;
    const p = post?.userInfo?.[0]?.photo?.path;
    return p ? `${base}/${p}` : "/assets/images/Home/small-profile-img.svg";
  }, [post, base]);

  const isVideo = Boolean(post?.media?.[0]?.mediaType === "video" || post?.mediaFiles?.[0]?.mediaType === "video");

  const likeCount = Number(post?.likeInteractions?.length || post?.likesCount || 0);
  const saveCount = Number(post?.savedInteractions?.length || 0);
  const isFollowing = Boolean(post?.isFollowing);

  const onLike = useCallback(() => {
    if (post?._id) likePost(post._id);
  }, [post?._id]);
  const onSave = useCallback(() => {
    if (post?._id) savePost(post._id);
  }, [post?._id]);

  const onAddComment = async () => {
    const msg = String(commentText || "").trim();
    if (!msg || !post?._id) return;
    try {
      await addComment({ postId, comment: msg }).unwrap();
      setCommentText("");
    } catch {}
  };

  // Pin / Unpin toggle
  const onTogglePin = async () => {
    if (!post?._id) return;
    try {
      await updatePost({ id: post._id, isPinned: !post?.isPinned }).unwrap();
    } catch {}
  };

  // Keyboard: Esc to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  const handleClose = useCallback(() => {
    try {
      if (typeof window !== 'undefined' && window.history.length > 1) {
        router.back();
        return;
      }
    } catch {}
    router.push('/home');
  }, [router]);

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
      <div className="w-[92vw] h-[90vh] max-w-[1280px] bg-[#0B0F14] rounded-xl shadow-2xl border border-white/10 relative grid grid-cols-1 lg:grid-cols-[62%_38%] overflow-hidden" onClick={(e)=>e.stopPropagation()}>
      {/* Close */}
        {/* close button is rendered in header on the right via the header bar */}

      {/* Media */}
      <div className="flex items-center justify-center bg-black/20 p-0 overflow-hidden">
        {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
        {error && <div className="text-sm text-muted-foreground">Failed to load post.</div>}
        {!isLoading && !error && (
          mediaSrc ? (
            isVideo ? (
              <video className="h-full w-full object-cover lg:object-cover sm:object-contain" src={mediaSrc} controls autoPlay />
            ) : (
              <img
                className={`h-full w-full ${zoom ? "object-cover" : "object-contain"} transition-all duration-200 cursor-zoom-in`}
                src={mediaSrc}
                alt="post media"
                onClick={() => setZoom((z) => !z)}
              />
            )
          ) : (
            <div className="text-sm text-muted-foreground">No media</div>
          )
        )}
      </div>

      {/* Right pane: author header + actions + comments */}
      <div className="flex flex-col h-full min-h-0">
        {/* Sticky top area */}
        <div className="sticky top-0 z-10 bg-[#0B0F14]">
          <div className="px-4 lg:pl-6 pr-4 py-3 border-b border-white/10 flex items-center gap-3">
            <img src={avatarUrl} alt="author avatar" className="h-8 w-8 rounded-full object-cover" />
            <div className="flex flex-col">
              <span className="text-white/90 text-sm leading-tight">{post?.userInfo?.[0]?.fullName || "User"}</span>
              <span className="text-white/50 text-xs leading-tight">@{post?.userInfo?.[0]?.userName || "user"}</span>
            </div>
            {/* Header actions (kebab) */}
            <div className="ml-auto flex items-center gap-3 relative">
              <button className="text-white/70 hover:text-white" onClick={(e) => { e.stopPropagation(); setMoreOpen((v) => !v); }}>⋯</button>
              <button aria-label="Close" className="text-white/80 hover:text-white p-1" onClick={handleClose}>
                <IconX className="h-5 w-5" />
              </button>
              {moreOpen && (
                <div className="absolute right-0 mt-2 bg-[#11161c] border border-white/10 rounded shadow p-2 text-sm min-w-40 z-30" onClick={(e)=>e.stopPropagation()}>
                  {isOwner ? (
                    <>
                      <button className="block w-full text-left text-white/90 hover:text-white" onClick={onTogglePin}>
                        {post?.isPinned ? "Unpin post" : "Pin post"}
                      </button>
                      <button className="block w-full text-left text-red-400 hover:text-red-300" onClick={() => setDeleteOpen(true)}>
                        Delete post
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="block w-full text-left text-white/90 hover:text-white" onClick={async ()=>{ try{ await followUser({ followingTo: post?.userInfo?.[0]?._id }).unwrap(); setMoreOpen(false);}catch{}}}>{isFollowing ? "Unfollow" : "Follow"}</button>
                      <button className="block w-full text-left text-white/90 hover:text-white">Report</button>
                      <div className="block w-full text-left text-white/90 hover:text-white"><NotInterestedComp postId={post?._id} /></div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="relative flex items-center gap-4 px-4 lg:pl-6 pr-20 py-3 border-b border-white/10">
            <button className="text-white/90 hover:text-white" onClick={onLike}>♥ Like</button>
            <span className="text-white/60 text-sm">{likeCount}</span>
            <button className="text-white/90 hover:text-white" onClick={onSave}>✭ Save</button>
            <span className="text-white/60 text-sm">{saveCount}</span>
            <button
              className="text-white/90 hover:text-white"
              onClick={() => { try { navigator.clipboard.writeText(window.location.href); } catch {} }}
            >↗ Share</button>
            {/* actions row is intentionally minimal; destructive in header kebab */}
          </div>
        </div>

        {/* Caption */}
        {post?.content && (
          <div className="px-4 lg:px-6 py-3 text-white/90 border-b border-white/10 text-sm">
            {post.content}
          </div>
        )}

        {/* Comments */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3">
          {comments && comments.length > 0 ? (
            comments.map((c: any) => (
              <div key={String(c?._id || Math.random())} className="text-white/90 text-sm">
                <span className="text-white/60">@{c?.userName || c?.user?.userName || "user"}</span>: {c?.comment}
              </div>
            ))
          ) : (
            <div className="text-white/60 text-sm">No comments yet</div>
          )}
        </div>

        {/* Add comment */}
        <div className="px-4 py-3 border-t border-white/10 flex gap-2">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment…"
            className="flex-1 bg-black/20 text-white placeholder-white/40 rounded px-3 py-2 outline-none"
          />
          <button onClick={onAddComment} className="bg-primary text-black px-4 py-2 rounded">Send</button>
        </div>
      </div>

      {isOwner && (
        <DeleteModal
          postDetails={post}
          openPopup={deleteOpen}
          setOpenPopup={setDeleteOpen}
          showTrigger={false}
        />
      )}
      </div>
    </div>
  );
}


