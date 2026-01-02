"use client";

import React from "react";
import Image from "next/image";
import { ChevronDown, Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from "lucide-react";
import {
  useGetPostsQuery,
  useGetCommentsByPostIdQuery,
  useLikePostMutation,
  useSavePostMutation,
  useUpdatePostCommentMutation,
} from "@/redux/services/haveme/posts";
import { useGetUserDetailsQuery } from "@/redux/services/haveme";
import { adaptPostToFeedItem } from "@/lib/adapters/feed";
import { formatTimestamp } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getUserAvatarUrl } from "@/lib/media";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

type DesignFeedKey = "for-you" | "following" | "subscribed";
type SelectedFeed = DesignFeedKey | string; // string for custom feeds

const mentorOSLogo = "/assets/brand/mentorio-wordmark.svg";

export default function HomePageWired() {
  const router = useRouter();
  const { data: me } = useGetUserDetailsQuery();
  const myId = String((me as any)?.data?._id || "");

  const [selectedFeed, setSelectedFeed] = React.useState<SelectedFeed>("for-you");
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  // Custom feeds (export feature). No backend endpoint exists today, so we persist locally.
  const [customFeeds, setCustomFeeds] = React.useState<Array<{ id: string; name: string }>>([]);
  const [showCreateFeedDialog, setShowCreateFeedDialog] = React.useState(false);
  const [newFeedName, setNewFeedName] = React.useState("");

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem("designCustomFeeds");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setCustomFeeds(parsed.map((x: any) => ({ id: String(x.id), name: String(x.name) })));
      }
    } catch {}
  }, []);

  const persistCustomFeeds = (next: Array<{ id: string; name: string }>) => {
    setCustomFeeds(next);
    try {
      window.localStorage.setItem("designCustomFeeds", JSON.stringify(next));
    } catch {}
  };

  // Map UI feed -> backend filter
  const isBuiltIn = selectedFeed === "for-you" || selectedFeed === "following" || selectedFeed === "subscribed";
  const apiFilter = selectedFeed === "following" ? "following" : selectedFeed === "subscribed" ? "subscribed" : "all";
  const { data: postDetails, refetch: refetchPosts } = useGetPostsQuery(
    { perPage: 25, page: 1, search: "", filter: apiFilter, includeSelf: true } as any
  );
  const raw = ((postDetails as any)?.data ?? []) as any[];

  const [overrides, setOverrides] = React.useState<Record<string, Partial<any>>>({});

  const posts = React.useMemo(() => {
    return raw
      .map((p) => {
        const adapted = adaptPostToFeedItem(p, myId);
        if (!adapted) return null;
        const id = String(adapted.id);
        const o = overrides[id] || {};
        return {
          id,
          mediaType: adapted.type,
          src: adapted.src,
          user: {
            id: adapted.user?.id || "",
            usernameRaw: adapted.user?.username || "",
            username: adapted.user?.username ? `@${adapted.user.username}` : "",
            name: adapted.user?.displayName || adapted.user?.username || "",
            avatar: adapted.user?.avatarUrl || "/assets/images/Home/small-profile-img.svg",
            isMentor: Boolean(adapted.user?.isMentor),
          },
          caption: adapted.caption || "",
          likes: Number(o.likes ?? adapted.likesCount ?? 0),
          comments: Number(o.comments ?? adapted.commentsCount ?? 0),
          saves: Number(o.saves ?? adapted.savedCount ?? 0),
          isLiked: Boolean(o.isLiked ?? adapted.isLiked),
          isSaved: Boolean(o.isSaved ?? adapted.isSaved),
          timestamp: adapted.createdAt ? formatTimestamp(adapted.createdAt) : "",
        };
      })
      .filter(Boolean) as any[];
  }, [raw, myId, overrides]);

  const filteredPosts = React.useMemo(() => {
    if (isBuiltIn) return posts;
    const feedId = String(selectedFeed);
    // Best-effort client-side filter: requires backend to include tags/hashtags on posts.
    // If not present, we still show all posts (but dropdown + create feed option exists).
    return posts.filter((p: any) => {
      const rawPost = raw.find((x: any) => String(x?._id ?? x?.id) === String(p.id));
      const tags = (rawPost?.tags || rawPost?.hashTags || rawPost?.hashtags || []) as any[];
      const flat = Array.isArray(tags) ? tags.map(String) : [];
      return flat.includes(feedId);
    });
  }, [isBuiltIn, posts, raw, selectedFeed]);

  const [likePost] = useLikePostMutation();
  const [savePost] = useSavePostMutation();
  const [updatePostComment] = useUpdatePostCommentMutation();

  const [commentsPostId, setCommentsPostId] = React.useState<string | null>(null);
  const [commentText, setCommentText] = React.useState("");
  const { data: commentsRes, isFetching: commentsLoading } = useGetCommentsByPostIdQuery(commentsPostId as any, {
    skip: !commentsPostId,
  });
  const comments = (commentsRes as any)?.data ?? [];

  const toggleLike = async (postId: string) => {
    const prev = overrides[postId];
    setOverrides((m) => {
      const cur = m[postId] || {};
      const isLiked = Boolean(cur.isLiked);
      const likes = Number(cur.likes ?? filteredPosts.find((p: any) => String(p.id) === postId)?.likes ?? 0);
      return {
        ...m,
        [postId]: {
          ...cur,
          isLiked: !isLiked,
          likes: Math.max(0, likes + (isLiked ? -1 : 1)),
        },
      };
    });
    try {
      await likePost(postId as any).unwrap();
      refetchPosts();
    } catch {
      // revert
      setOverrides((m) => ({ ...m, [postId]: prev || {} }));
    }
  };

  const toggleSave = async (postId: string) => {
    const prev = overrides[postId];
    setOverrides((m) => {
      const cur = m[postId] || {};
      const isSaved = Boolean(cur.isSaved);
      const saves = Number(cur.saves ?? filteredPosts.find((p: any) => String(p.id) === postId)?.saves ?? 0);
      return {
        ...m,
        [postId]: {
          ...cur,
          isSaved: !isSaved,
          saves: Math.max(0, saves + (isSaved ? -1 : 1)),
        },
      };
    });
    try {
      await savePost(postId as any).unwrap();
      refetchPosts();
    } catch {
      setOverrides((m) => ({ ...m, [postId]: prev || {} }));
    }
  };

  const submitComment = async () => {
    if (!commentsPostId) return;
    const text = commentText.trim();
    if (!text) return;
    setCommentText("");

    // optimistic comment count
    setOverrides((m) => {
      const cur = m[commentsPostId] || {};
      const baseComments = Number(cur.comments ?? filteredPosts.find((p: any) => String(p.id) === commentsPostId)?.comments ?? 0);
      return { ...m, [commentsPostId]: { ...cur, comments: baseComments + 1 } };
    });

    try {
      await updatePostComment({ postId: commentsPostId, comment: text } as any).unwrap();
      // comments query invalidates by tag, will refetch
      refetchPosts();
    } catch {
      // best-effort: keep optimistic count (export is silent on errors)
    }
  };

  const handleShare = async (postId: string) => {
    const href = `/post/${encodeURIComponent(postId)}`;
    const url = typeof window !== "undefined" ? `${window.location.origin}${href}` : href;
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      await (navigator as any).share({ url });
    } else if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
    }
  };

  const createFeed = () => {
    const name = newFeedName.trim();
    if (!name) return;
    const id = name.toLowerCase().replace(/\s+/g, "-");
    const next = [...customFeeds.filter((f) => f.id !== id), { id, name }];
    persistCustomFeeds(next);
    setSelectedFeed(id);
    setNewFeedName("");
    setShowCreateFeedDialog(false);
    setIsDropdownOpen(false);
  };

  return (
    <div className="h-dvh w-full bg-white overflow-hidden relative" data-test="design-home-wired">
      {/* Top overlay (matches export style) */}
      <div className="absolute top-0 left-0 right-0 z-50 pt-[env(safe-area-inset-top)]">
        <div className="flex items-center justify-between pointer-events-auto w-full px-4 py-3">
          <div className="text-white drop-shadow-lg flex items-center gap-2">
            <Image src={mentorOSLogo} alt="MentorOS" className="h-16 w-16" width={64} height={64} />
          </div>

          <div className="relative z-50">
            <button
              type="button"
              className="flex items-center gap-1 text-white drop-shadow-lg hover:bg-white/10 h-auto py-1 px-3 rounded-full"
              onClick={() => setIsDropdownOpen((p) => !p)}
            >
              <span className="text-sm font-medium">
                {selectedFeed === "for-you" ? "Feed" : selectedFeed === "following" ? "Following" : "Subscribed"}
              </span>
              <ChevronDown className="h-4 w-4 ml-1" />
            </button>

            {isDropdownOpen ? (
              <div className="absolute top-full right-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden pointer-events-auto z-[60]">
                <button
                  onClick={() => {
                    setSelectedFeed("for-you");
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-800/80 text-white text-sm transition-colors flex items-center"
                >
                  <span className={selectedFeed === "for-you" ? "font-semibold" : ""}>Feed</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedFeed("following");
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-800/80 text-white text-sm transition-colors flex items-center"
                >
                  <span className={selectedFeed === "following" ? "font-semibold" : ""}>Following</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedFeed("subscribed");
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-800/80 text-white text-sm transition-colors flex items-center"
                >
                  <span className={selectedFeed === "subscribed" ? "font-semibold" : ""}>Subscribed</span>
                </button>

                {customFeeds.length ? (
                  <div className="border-t border-gray-700/50">
                    {customFeeds.map((feed) => (
                      <button
                        key={feed.id}
                        onClick={() => {
                          setSelectedFeed(feed.id);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-800/80 text-white text-sm transition-colors flex items-center"
                      >
                        <span className={selectedFeed === feed.id ? "font-semibold" : ""}>{feed.name}</span>
                      </button>
                    ))}
                  </div>
                ) : null}

                <div className="border-t border-gray-700/50">
                  <button
                    onClick={() => setShowCreateFeedDialog(true)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-800/80 text-white text-sm transition-colors flex items-center"
                  >
                    + Create feed
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Mobile: full-screen snap feed (export-style) */}
      <div
        className="w-full overflow-y-auto snap-y snap-mandatory scroll-smooth"
        style={{ height: "calc(100dvh - (env(safe-area-inset-bottom) + 84px))" }}
        data-test="feed-root"
      >
        {filteredPosts.map((p: any) => (
          <section
            key={p.id}
            className="w-full snap-start relative bg-black"
            style={{ height: "calc(100dvh - (env(safe-area-inset-bottom) + 84px))" }}
            data-test="feed-item"
          >
            {/* Media */}
            {p.mediaType === "video" ? (
              <video src={p.src} className="h-full w-full object-cover" autoPlay muted loop playsInline />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.src} alt={p.caption || "Post"} className="h-full w-full object-cover" />
            )}

            {/* Overlay gradient */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/20 via-transparent to-black/60" />

            {/* Left bottom meta */}
            <div className="absolute bottom-[calc(env(safe-area-inset-bottom)+16px)] left-4 right-20 text-white pointer-events-auto">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <button
                  type="button"
                  onClick={() => {
                    const uname = String(p.user.usernameRaw || "").replace(/^@/, "");
                    if (uname) router.push(`/feature/design/u/${encodeURIComponent(uname)}`);
                  }}
                  className="h-9 w-9 rounded-full overflow-hidden"
                  aria-label="Open profile"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.user.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const uname = String(p.user.usernameRaw || "").replace(/^@/, "");
                        if (uname) router.push(`/feature/design/u/${encodeURIComponent(uname)}`);
                      }}
                      className="font-semibold truncate hover:underline"
                    >
                      {p.user.username || p.user.name}
                    </button>
                    {p.user.isMentor ? (
                      <span className="px-2 py-0.5 bg-[hsl(var(--brand-medium-blue))] text-white text-xs rounded-full">
                        MENTOR
                      </span>
                    ) : null}
                  </div>
                  <div className="text-xs text-white/70">{p.timestamp}</div>
                </div>
              </div>
              <div className="mt-2 text-sm line-clamp-3" data-test="caption-bar">
                {p.caption}
              </div>
            </div>

            {/* Right rail actions */}
            <div className="absolute bottom-[calc(env(safe-area-inset-bottom)+16px)] right-3 flex flex-col items-center gap-4 text-white">
              <button
                type="button"
                className="flex flex-col items-center gap-1 drop-shadow-lg"
                onClick={() => toggleLike(String(p.id))}
              >
                <Heart className={cn("h-7 w-7", p.isLiked ? "fill-red-500 text-red-500" : "")} />
                <span className="text-xs font-semibold">{p.likes}</span>
              </button>

              <button
                type="button"
                className="flex flex-col items-center gap-1 drop-shadow-lg"
                onClick={() => setCommentsPostId(String(p.id))}
              >
                <MessageCircle className="h-7 w-7" />
                <span className="text-xs font-semibold">{p.comments}</span>
              </button>

              <button
                type="button"
                className="flex flex-col items-center gap-1 drop-shadow-lg"
                onClick={() => handleShare(String(p.id))}
              >
                <Share2 className="h-7 w-7" />
                <span className="text-xs font-semibold">Share</span>
              </button>

              <button
                type="button"
                className="flex flex-col items-center gap-1 drop-shadow-lg"
                onClick={() => toggleSave(String(p.id))}
              >
                <Bookmark className={cn("h-7 w-7", p.isSaved ? "fill-yellow-400 text-yellow-400" : "")} />
                <span className="text-xs font-semibold">{p.saves}</span>
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                    <MoreHorizontal className="h-7 w-7" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 shadow-lg">
                  <DropdownMenuItem onClick={() => {}}>
                    Report Post
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      const href = `/post/${encodeURIComponent(String(p.id))}`;
                      const url = typeof window !== "undefined" ? `${window.location.origin}${href}` : href;
                      navigator.clipboard?.writeText?.(url);
                    }}
                  >
                    Copy Link
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </section>
        ))}

        {filteredPosts.length === 0 ? (
          <div className="h-[calc(100dvh-(env(safe-area-inset-bottom)+84px))] flex items-center justify-center text-sm text-gray-500 bg-white">
            No posts.
          </div>
        ) : null}
      </div>

      {/* Comments sheet (minimal wired) */}
      <Sheet open={Boolean(commentsPostId)} onOpenChange={(open) => (!open ? setCommentsPostId(null) : null)}>
        <SheetContent side="bottom" className="p-0 pb-[max(env(safe-area-inset-bottom),12px)]">
          <div className="p-4 border-b border-gray-200">
            <SheetHeader>
              <SheetTitle>Comments</SheetTitle>
            </SheetHeader>
          </div>
          <div className="max-h-[60dvh] overflow-y-auto p-4 space-y-4 pb-24">
            {commentsLoading ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : comments.length === 0 ? (
              <div className="text-sm text-gray-500">No comments yet.</div>
            ) : (
              comments.map((c: any) => {
                const u = c?.interactedBy || {};
                const name = String(u?.fullName || u?.userName || "User");
                const uname = String(u?.userName || "");
                return (
                  <div key={String(c?._id || c?.id)} className="flex gap-3">
                    <div className="h-9 w-9 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={getUserAvatarUrl(u)} alt="" className="h-9 w-9 object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm text-gray-900">
                        <span className="font-medium">{name}</span>{" "}
                        {uname ? <span className="text-gray-500">@{uname}</span> : null}
                      </div>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">{String(c?.comment || "")}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {/* Sticky composer so it stays visible when keyboard opens */}
          <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200 flex gap-2">
            <Input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="text-base"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submitComment();
                }
              }}
            />
            <Button onClick={submitComment} disabled={!commentText.trim()}>
              Send
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Create feed dialog */}
      <Dialog open={showCreateFeedDialog} onOpenChange={setShowCreateFeedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create feed</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Input value={newFeedName} onChange={(e) => setNewFeedName(e.target.value)} placeholder="Feed name" />
            <p className="text-xs text-gray-500">Feeds are stored locally for now (backend wiring can come next).</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateFeedDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createFeed} disabled={!newFeedName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


