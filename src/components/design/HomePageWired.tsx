"use client";

import React from "react";
import Image from "next/image";
import { ChevronDown, Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from "lucide-react";
import { useGetPostsQuery, useLikePostMutation, useSavePostMutation } from "@/redux/services/haveme/posts";
import { useGetUserDetailsQuery } from "@/redux/services/haveme";
import { adaptPostToFeedItem } from "@/lib/adapters/feed";
import { formatTimestamp } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DesignFeedKey = "for-you" | "following" | "subscribed";

const mentorOSLogo = "/assets/brand/mentorio-wordmark.svg";

export default function HomePageWired() {
  const { data: me } = useGetUserDetailsQuery();
  const myId = String((me as any)?.data?._id || "");

  const [selectedFeed, setSelectedFeed] = React.useState<DesignFeedKey>("for-you");
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  // Map UI feed -> backend filter
  const apiFilter = selectedFeed === "following" ? "following" : selectedFeed === "subscribed" ? "subscribed" : "all";
  const { data: postDetails } = useGetPostsQuery({ perPage: 25, page: 1, search: "", filter: apiFilter, includeSelf: true } as any);
  const raw = ((postDetails as any)?.data ?? []) as any[];

  const posts = React.useMemo(() => {
    return raw
      .map((p) => {
        const adapted = adaptPostToFeedItem(p, myId);
        if (!adapted) return null;
        return {
          id: adapted.id,
          mediaType: adapted.type,
          src: adapted.src,
          user: {
            id: adapted.user?.id || "",
            username: adapted.user?.username ? `@${adapted.user.username}` : "",
            name: adapted.user?.displayName || adapted.user?.username || "",
            avatar: adapted.user?.avatarUrl || "/assets/images/Home/small-profile-img.svg",
            isMentor: Boolean(adapted.user?.isMentor),
          },
          caption: adapted.caption || "",
          likes: Number(adapted.likesCount || 0),
          comments: Number(adapted.commentsCount || 0),
          saves: Number(adapted.savedCount || 0),
          isLiked: Boolean(adapted.isLiked),
          isSaved: Boolean(adapted.isSaved),
          timestamp: adapted.createdAt ? formatTimestamp(adapted.createdAt) : "",
        };
      })
      .filter(Boolean) as any[];
  }, [raw, myId]);

  const [likePost] = useLikePostMutation();
  const [savePost] = useSavePostMutation();

  const handleShare = async (postId: string) => {
    const href = `/post/${encodeURIComponent(postId)}`;
    const url = typeof window !== "undefined" ? `${window.location.origin}${href}` : href;
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      await (navigator as any).share({ url });
    } else if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="h-screen w-full bg-white overflow-hidden relative" data-test="design-home-wired">
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
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Mobile: full-screen snap feed (export-style) */}
      <div className="h-full w-full overflow-y-auto snap-y snap-mandatory scroll-smooth" data-test="feed-root">
        {posts.map((p: any) => (
          <section key={p.id} className="h-screen w-full snap-start relative bg-black" data-test="feed-item">
            {/* Media */}
            {p.mediaType === "video" ? (
              <video src={p.src} className="h-full w-full object-contain" autoPlay muted loop playsInline />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.src} alt={p.caption || "Post"} className="h-full w-full object-contain" />
            )}

            {/* Overlay gradient */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/20 via-transparent to-black/60" />

            {/* Left bottom meta */}
            <div className="absolute bottom-[calc(env(safe-area-inset-bottom)+84px)] left-4 right-20 text-white pointer-events-none">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.user.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold truncate">{p.user.username || p.user.name}</div>
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
            <div className="absolute bottom-[calc(env(safe-area-inset-bottom)+84px)] right-3 flex flex-col items-center gap-4 text-white">
              <button
                type="button"
                className="flex flex-col items-center gap-1 drop-shadow-lg"
                onClick={() => likePost(String(p.id))}
              >
                <Heart className={cn("h-7 w-7", p.isLiked ? "fill-red-500 text-red-500" : "")} />
                <span className="text-xs font-semibold">{p.likes}</span>
              </button>

              <button type="button" className="flex flex-col items-center gap-1 drop-shadow-lg">
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
                onClick={() => savePost(String(p.id))}
              >
                <Bookmark className={cn("h-7 w-7", p.isSaved ? "fill-[hsl(var(--goals-primary))] text-[hsl(var(--goals-primary))]" : "")} />
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

        {posts.length === 0 ? (
          <div className="h-screen flex items-center justify-center text-sm text-gray-500 bg-white">No posts.</div>
        ) : null}
      </div>
    </div>
  );
}


