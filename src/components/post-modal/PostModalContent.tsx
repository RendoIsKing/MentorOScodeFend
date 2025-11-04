"use client";
import React, { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  useGetPostByIdQuery,
  useGetCommentsByPostIdQuery,
  useLikePostMutation,
  useSavePostMutation,
  useUpdatePostCommentMutation,
} from "@/redux/services/haveme/posts";
import { useGetUserDetailsQuery } from "@/redux/services/haveme";
import DeleteModal from "../delete-modal";
import { baseServerUrl } from "@/lib/utils";

export default function PostModalContent({ postId }: any) {
  const router = useRouter();
  const { data, isLoading, error } = useGetPostByIdQuery(postId);
  const post: any = (data as any)?.data || data;
  const { data: meData } = useGetUserDetailsQuery();
  const myId: any = (meData as any)?.data?._id;
  const isOwner = Boolean(myId && String(post?.user) === String(myId) || String(post?.userInfo?.[0]?._id || "") === String(myId || ""));

  const { data: commentsRes } = useGetCommentsByPostIdQuery(postId);
  const comments: any[] = (commentsRes as any)?.data || [];

  const [likePost] = useLikePostMutation();
  const [savePost] = useSavePostMutation();
  const [addComment] = useUpdatePostCommentMutation();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [commentText, setCommentText] = useState("");

  const mediaSrc = useMemo(() => {
    if (!post) return undefined;
    const base = baseServerUrl || "/api/backend";
    const fileId = (post?.mediaFiles?.[0] && (post?.mediaFiles?.[0]?._id || post?.mediaFiles?.[0]?.id)) || post?.media?.[0]?.mediaId;
    if (fileId) return `${base}/v1/user/files/${String(fileId)}`;
    const path = post?.mediaFiles?.[0]?.path;
    return path ? `${base}/${path}` : undefined;
  }, [post]);

  const isVideo = Boolean(post?.media?.[0]?.mediaType === "video" || post?.mediaFiles?.[0]?.mediaType === "video");

  const likeCount = Number(post?.likeInteractions?.length || post?.likesCount || 0);
  const saveCount = Number(post?.savedInteractions?.length || 0);

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

  return (
    <div className="w-full h-[85vh] max-w-6xl bg-[#0B0F14] rounded-lg shadow relative grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
      {/* Close */}
      <button
        aria-label="Close"
        className="absolute right-3 top-3 text-white/70 hover:text-white z-10"
        onClick={() => router.back()}
      >
        ×
      </button>

      {/* Media */}
      <div className="flex items-center justify-center bg-black/20 p-2">
        {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
        {error && <div className="text-sm text-muted-foreground">Failed to load post.</div>}
        {!isLoading && !error && (
          mediaSrc ? (
            isVideo ? (
              <video className="max-h-[78vh] w-auto" src={mediaSrc} controls autoPlay />
            ) : (
              <img className="max-h-[78vh] w-auto object-contain" src={mediaSrc} alt="post media" />
            )
          ) : (
            <div className="text-sm text-muted-foreground">No media</div>
          )
        )}
      </div>

      {/* Right pane: actions + comments */}
      <div className="flex flex-col h-full">
        {/* Actions */}
        <div className="flex items-center gap-4 px-4 py-3 border-b border-white/10">
          <button className="text-white/90 hover:text-white" onClick={onLike}>♥ Like</button>
          <span className="text-white/60 text-sm">{likeCount}</span>
          <button className="text-white/90 hover:text-white" onClick={onSave}>✭ Save</button>
          <span className="text-white/60 text-sm">{saveCount}</span>
          {isOwner && (
            <>
              <button className="ml-auto text-red-400 hover:text-red-300" onClick={() => setDeleteOpen(true)}>
                Delete post
              </button>
            </>
          )}
        </div>

        {/* Comments */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
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
  );
}


