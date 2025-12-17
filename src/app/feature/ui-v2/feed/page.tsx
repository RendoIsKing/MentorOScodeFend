"use client";

import React from "react";
import RealtimeBootstrap from "@/components/realtime/RealtimeBootstrap";
import FullBleedFeed from "@/components/feed/FullBleedFeed";
import { useGetUserDetailsQuery } from "@/redux/services/haveme";
import { useUserOnboardingContext } from "@/context/UserOnboarding";
import { useGetPostsQuery } from "@/redux/services/haveme/posts";
import PostInteraction from "@/components/postInteraction";
import { adaptBackendPostsToFullBleedPosts, indexPostsById } from "@/lib/adapters/feed";
import { NewFeedTopOverlay, type FeedFilterKey } from "@/components/ui-v2/feed/NewFeedTopOverlay";
import { useMediaQuery } from "@/hooks/use-media-query";
import { UiV2DesktopFeed } from "@/components/ui-v2/feed/UiV2DesktopFeed";

// Staging route for the new design rollout:
// - Keeps existing /home untouched
// - Uses real data sources (RTK query)
// - We will swap the UI shell incrementally here first
export default function NewFeedDesignStagingPage() {
  const { user } = useUserOnboardingContext();
  const { data: me } = useGetUserDetailsQuery();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Controlled filter (no refresh needed). Still persists to localStorage for parity with existing UI.
  const [filterKey, setFilterKey] = React.useState<FeedFilterKey>(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem("homeFeedFilter") : null;
      const v = (raw || "feed").toLowerCase();
      return v === "following" || v === "subscribed" ? (v as FeedFilterKey) : "feed";
    } catch {
      return "feed";
    }
  });
  React.useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      window.localStorage.setItem("homeFeedFilter", filterKey);
      window.dispatchEvent(new Event("feed-filter-changed"));
    } catch {}
  }, [filterKey]);

  const { data: postDetails } = useGetPostsQuery({
    perPage: 10,
    page: 1,
    search: "",
    filter: filterKey === "following" ? "following" : filterKey === "subscribed" ? "subscribed" : "all",
    includeSelf: true,
  } as any);

  const items = (postDetails as any)?.data ?? [];
  const byId = React.useMemo(() => indexPostsById(items), [items]);
  const selfId = String((me as any)?.data?._id || user?._id || "");
  const posts = React.useMemo(
    () => adaptBackendPostsToFullBleedPosts(items, { me, selfUserId: selfId }),
    [items, me, selfId]
  );

  return (
    <div className="min-h-[100dvh]" data-test="feed-root">
      <RealtimeBootstrap />
      {/* Desktop: Figma-style centered feed cards. Mobile: full-bleed TikTok style. */}
      {isDesktop ? (
        <>
          <div className="sticky top-0 z-30 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
            <div className="mx-auto max-w-[470px] px-4 py-3">
              <NewFeedTopOverlay value={filterKey} onChange={setFilterKey} />
            </div>
          </div>
          <UiV2DesktopFeed posts={posts} byId={byId} />
        </>
      ) : (
        <FullBleedFeed
          posts={posts}
          currentUserId={selfId}
          variant="ui-v2"
          TopOverlay={() => <NewFeedTopOverlay value={filterKey} onChange={setFilterKey} />}
          RightOverlay={({ post }) => {
            const original = byId.get(post.id);
            if (!original) return null as any;
            return <PostInteraction postDetails={original as any} currentUserId={selfId || null} variant="ui-v2" />;
          }}
        />
      )}
    </div>
  );
}


