"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bookmark, Heart, MoreHorizontal, Share2 } from "lucide-react";
import CommentsComp from "@/components/comments-comp";
import { useLikePostMutation, useSavePostMutation } from "@/redux/services/haveme/posts";

export function UiV2DesktopFeed({
  posts,
  byId,
}: {
  posts: Array<{ id: string; type: "image" | "video"; src: string; caption?: string; createdAt?: string; user?: any }>;
  byId: Map<string, any>;
}) {
  return (
    <div className="hidden md:block md:overflow-y-auto md:h-screen bg-background">
      <div className="max-w-[470px] mx-auto py-8 space-y-8">
        {posts.map((p) => {
          const original = byId.get(p.id);
          if (!original) return null;
          return <UiV2DesktopPostCard key={p.id} post={p} original={original} />;
        })}
      </div>
    </div>
  );
}

function UiV2DesktopPostCard({
  post,
  original,
}: {
  post: { id: string; type: "image" | "video"; src: string; caption?: string; createdAt?: string; user?: any };
  original: any;
}) {
  const [likePost] = useLikePostMutation();
  const [savePost] = useSavePostMutation();

  const [isLiked, setIsLiked] = React.useState<boolean>(Boolean(original?.isLiked));
  const [likesCount, setLikesCount] = React.useState<number>(Number(original?.likesCount ?? 0));
  const [isSaved, setIsSaved] = React.useState<boolean>(Boolean(original?.isSaved));

  const username = String(post.user?.username || post.user?.displayName || "");
  const avatarUrl = String(post.user?.avatarUrl || "/assets/images/Home/small-profile-img.svg");

  const onToggleLike = async () => {
    try {
      setIsLiked((v) => !v);
      setLikesCount((c) => (isLiked ? Math.max(0, c - 1) : c + 1));
      await likePost(String(post.id));
    } catch {
      // revert if desired; keep optimistic for now
    }
  };

  const onToggleSave = async () => {
    try {
      setIsSaved((v) => !v);
      await savePost(String(post.id));
    } catch {}
  };

  const onShare = async () => {
    try {
      const href = `/post/${encodeURIComponent(String(post.id))}`;
      const url = typeof window !== "undefined" ? `${window.location.origin}${href}` : href;
      if (typeof navigator !== "undefined" && (navigator as any).share) {
        await (navigator as any).share({ url });
      } else if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      }
    } catch {}
  };

  return (
    <Card className="bg-card border rounded-lg overflow-hidden" data-test="feed-item">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={avatarUrl}
            alt=""
            className="h-10 w-10 rounded-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <div className="min-w-0">
            <div className="font-semibold truncate">{username}</div>
            <div className="text-xs text-muted-foreground">{post.createdAt ? new Date(post.createdAt).toLocaleString() : ""}</div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="More">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem
              onClick={async () => {
                try {
                  const href = `/post/${encodeURIComponent(String(post.id))}`;
                  const url = typeof window !== "undefined" ? `${window.location.origin}${href}` : href;
                  await navigator.clipboard?.writeText?.(url);
                } catch {}
              }}
            >
              Copy Link
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                try {
                  await fetch(`/api/backend/v1/post/${encodeURIComponent(String(post.id))}/report`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ reason: "Inappropriate" }),
                    credentials: "include",
                  });
                } catch {}
              }}
              className="text-destructive"
            >
              Report Post
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Media */}
      <div className="relative w-full bg-black" style={{ aspectRatio: "1 / 1" }}>
        {post.type === "video" ? (
          <video src={post.src} className="absolute inset-0 w-full h-full object-cover" muted loop playsInline controls />
        ) : (
          <img src={post.src} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleLike}
            className={cn("inline-flex items-center gap-2", isLiked && "text-red-500")}
            aria-label={isLiked ? "Unlike" : "Like"}
          >
            <Heart className={cn("h-6 w-6", isLiked && "fill-red-500")} />
            <span className="text-sm font-semibold">{likesCount}</span>
          </button>

          <div className="inline-flex items-center">
            <CommentsComp feedData={original} variant="ui-v2" />
          </div>

          <button type="button" onClick={onShare} className="inline-flex items-center gap-2" aria-label="Share">
            <Share2 className="h-6 w-6" />
          </button>
        </div>

        <button
          type="button"
          onClick={onToggleSave}
          className={cn("inline-flex items-center", isSaved && "text-[hsl(var(--goals-primary))]")}
          aria-label={isSaved ? "Unsave" : "Save"}
        >
          <Bookmark className={cn("h-6 w-6", isSaved && "fill-[hsl(var(--goals-primary))]")} />
        </button>
      </div>

      {/* Caption */}
      {post.caption ? (
        <div className="px-4 pb-4">
          <p className="text-sm leading-relaxed line-clamp-3">{post.caption}</p>
        </div>
      ) : null}
    </Card>
  );
}


