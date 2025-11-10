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
import { useMeNormalized } from "@/hooks/useMeNormalized";
import { useFollowUserMutation } from "@/redux/services/haveme/user";
import { X as IconX, Heart, Star } from "lucide-react";
import NotInterestedComp from "../shared/not-interested";
import DeleteModal from "../delete-modal";
import { baseServerUrl } from "@/lib/utils";

export default function PostModalContent({ postId }: any) {
  const router = useRouter();
  const { data, isLoading, error } = useGetPostByIdQuery(postId);
  const post: any = (data as any)?.data || data;
  const { me: meNormalized } = useMeNormalized();
  const myId: string = (meNormalized?._id ? String(meNormalized._id) : "");
  const extractId = (val: any): string => {
    if (!val) return "";
    if (typeof val === "string") return val;
    if (typeof val === "object") {
      if (val._id) return String(val._id);
      if ((val as any).$oid) return String((val as any).$oid);
      const s = typeof val.toString === "function" ? val.toString() : "";
      const m = s.match(/[a-f0-9]{24}/i);
      return m ? m[0] : "";
    }
    return "";
  };
  const ownerCandidates = [
    extractId(post?.userInfo?.[0]?._id),
    extractId((post as any)?.user),
    extractId((post as any)?.userId),
    extractId((post as any)?.owner),
    extractId((post as any)?.createdBy),
  ].filter(Boolean);
  const isOwner = Boolean(myId && ownerCandidates.some((id) => id && String(id) === myId));
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
  const [isOpen, setIsOpen] = useState(true);

  const mediaSrc = useMemo(() => {
    if (!post) return undefined;
    const fileId =
      (post?.mediaFiles?.[0] &&
        (post?.mediaFiles?.[0]?._id || post?.mediaFiles?.[0]?.id)) ||
      post?.media?.[0]?.mediaId;
    if (fileId) return `${base}/v1/user/files/${String(fileId)}`;
    const path = post?.mediaFiles?.[0]?.path;
    return path ? `${base}/${path}` : undefined;
  }, [post]);

  const avatarUrl = useMemo(() => {
    const avatarId =
      post?.userInfo?.[0]?.photoId || post?.userInfo?.[0]?.photo?._id;
    if (avatarId) return `${base}/v1/user/files/${String(avatarId)}`;
    const p = post?.userInfo?.[0]?.photo?.path;
    return p ? `${base}/${p}` : "/assets/images/Home/small-profile-img.svg";
  }, [post, base]);

  const isVideo = Boolean(
    post?.media?.[0]?.mediaType === "video" ||
      post?.mediaFiles?.[0]?.mediaType === "video"
  );

  const [liked, setLiked] = useState<boolean>(Boolean(post?.isLiked));
  const [likedCount, setLikedCount] = useState<number>(Number(post?.likeInteractions?.length || post?.likesCount || 0));
  const [saved, setSaved] = useState<boolean>(Boolean(post?.isSaved));
  const [savedCount, setSavedCount] = useState<number>(Number(post?.savedInteractions?.length || 0));
  const isFollowing = Boolean(post?.isFollowing);

  const onLike = useCallback(async () => {
    if (!post?._id) return;
    // optimistic toggle
    setLiked((v) => !v);
    setLikedCount((n) => (liked ? Math.max(0, n - 1) : n + 1));
    try { await likePost(post._id); } catch { /* revert on error */ setLiked((v)=>!v); setLikedCount((n)=> (liked ? n+1 : Math.max(0, n-1))); }
  }, [post?._id, liked]);

  const onSave = useCallback(async () => {
    if (!post?._id) return;
    setSaved((v) => !v);
    setSavedCount((n) => (saved ? Math.max(0, n - 1) : n + 1));
    try { await savePost(post._id); } catch { setSaved((v)=>!v); setSavedCount((n)=> (saved ? n+1 : Math.max(0, n-1))); }
  }, [post?._id, saved]);

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
      setMoreOpen(false);
    } catch {}
  };

  // Esc closes overlay
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        try {
          const evt = new CustomEvent('post-modal-close');
          window.dispatchEvent(evt);
        } catch {}
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleClose = useCallback(() => {
    try {
      const evt = new CustomEvent('post-modal-close');
      window.dispatchEvent(evt);
    } catch {}
    setIsOpen(false);
  }, []);

  // Close kebab menu on outside click
  useEffect(() => {
    if (!moreOpen) return;
    const onDocClick = () => setMoreOpen(false);
    window.addEventListener('click', onDocClick);
    return () => window.removeEventListener('click', onDocClick);
  }, [moreOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-background/80 flex items-center justify-center p-4">
      <div
        className="modal-root w-[92vw] h-[90vh] max-w-[1280px] bg-card rounded-xl shadow-2xl border border-border relative grid grid-cols-1 lg:grid-cols-[62%_38%] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Media */}
        <div className="flex items-center justify-center bg-black/20 p-0 overflow-hidden">
          {isLoading && (
            <div className="text-sm text-muted-foreground">Loading…</div>
          )}
          {error && (
            <div className="text-sm text-muted-foreground">Failed to load post.</div>
          )}
          {!isLoading && !error && (mediaSrc ? (
            isVideo ? (
              <video
                className="h-full w-full object-cover lg:object-cover sm:object-contain"
                src={mediaSrc}
                controls
                autoPlay
              />
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
          ))}
        </div>

        {/* Right pane: author header + actions + comments */}
        <div className="flex flex-col h-full min-h-0">
          {/* Sticky top area */}
          <div className="sticky top-0 z-10 bg-card">
            <div className="px-4 lg:pl-6 pr-4 py-3 border-b border-border flex items-center gap-3">
              <img
                src={avatarUrl}
                alt="author avatar"
                className="h-8 w-8 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <span className="text-foreground text-sm leading-tight">
                  {post?.userInfo?.[0]?.fullName || "User"}
                </span>
                <span className="text-muted-foreground text-xs leading-tight">
                  @{post?.userInfo?.[0]?.userName || "user"}
                </span>
              </div>
              {/* Header actions (kebab + close) */}
              <div className="ml-auto flex items-center gap-3 relative">
                <button
                  className="text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMoreOpen((v) => !v);
                  }}
                  aria-label="More actions"
                >
                  ⋯
                </button>
                <button
                  data-modal-close
                  aria-label="Close"
                  type="button"
                  className="header-close text-muted-foreground hover:text-foreground p-1"
                  onClick={handleClose}
                >
                  <IconX className="h-5 w-5" />
                </button>
                {moreOpen && (
                  <div
                    className="absolute right-0 mt-2 bg-popover border border-border rounded shadow p-2 text-sm min-w-40 z-30"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isOwner ? (
                      <>
                        <button
                          className="block w-full text-left text-foreground hover:text-foreground"
                          onClick={onTogglePin}
                        >
                          {post?.isPinned ? "Unpin post" : "Pin post"}
                        </button>
                        <button
                          className="block w-full text-left text-destructive hover:opacity-90"
                          onClick={() => { setMoreOpen(false); setDeleteOpen(true); }}
                        >
                          Delete post
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="block w-full text-left text-foreground hover:text-foreground"
                          onClick={async () => {
                            try {
                              await followUser({
                                followingTo: post?.userInfo?.[0]?._id,
                              }).unwrap();
                              setMoreOpen(false);
                            } catch {}
                          }}
                        >
                          {isFollowing ? "Unfollow" : "Follow"}
                        </button>
                        <button className="block w-full text-left text-foreground hover:text-foreground">
                          Report
                        </button>
                        <div className="block w-full text-left text-foreground hover:text-foreground">
                          <NotInterestedComp postId={post?._id} />
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="relative flex items-center gap-4 px-4 lg:pl-6 pr-20 py-3 border-b border-border">
              <button
                aria-label={liked ? "Unlike post" : "Like post"}
                className={`hover:text-foreground ${liked ? 'text-primary' : 'text-muted-foreground'}`}
                onClick={onLike}
              >
                <Heart className="inline align-middle mr-1" fill={liked ? "currentColor" : "none"} />
                Like
              </button>
              <span className="text-muted-foreground text-sm">{likedCount}</span>
              <button
                aria-label={saved ? "Unsave post" : "Save post"}
                className={`hover:text-foreground ${saved ? 'text-primary' : 'text-muted-foreground'}`}
                onClick={onSave}
              >
                <Star className="inline align-middle mr-1" fill={saved ? "currentColor" : "none"} />
                Save
              </button>
              <span className="text-muted-foreground text-sm">{savedCount}</span>
              <button
                className="text-muted-foreground hover:text-foreground"
                onClick={async () => {
                  try {
                    const url = window.location.href;
                    if ((navigator as any).share) {
                      await (navigator as any).share({ title: document.title, url });
                    } else {
                      await navigator.clipboard.writeText(url);
                    }
                  } catch {}
                }}
                aria-label="Share post"
              >↗ Share</button>
            </div>
          </div>

          {/* Caption */}
          {post?.content && (
            <div className="px-4 lg:px-6 py-3 text-foreground border-b border-border text-sm">
              {post.content}
            </div>
          )}

          {/* Comments */}
          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3">
            {comments && comments.length > 0 ? (
              comments.map((c: any) => (
                <div key={String(c?._id || Math.random())} className="text-foreground text-sm">
                  <span className="text-muted-foreground">
                    @{c?.userName || c?.user?.userName || "user"}
                  </span>
                  : {c?.comment}
                </div>
              ))
            ) : (
              <div className="text-muted-foreground text-sm">No comments yet</div>
            )}
          </div>

          {/* Add comment */}
          <div className="px-4 py-3 border-t border-border flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment…"
              className="flex-1 bg-muted/20 text-foreground placeholder-muted-foreground rounded px-3 py-2 outline-none"
            />
            <button onClick={onAddComment} className="bg-primary text-black px-4 py-2 rounded">
              Send
            </button>
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
      <style jsx>{`
        /* Hide any lucide X injected by generic Dialogs inside the modal,
           but keep our header close icon visible */
        :global(.modal-root .lucide-x) { display: none !important }
        :global(.modal-root .header-close .lucide-x) { display: inline-block !important }
        :global(.modal-root button.absolute.right-4.top-4) { display: none !important }
      `}</style>
    </div>
  );
}


