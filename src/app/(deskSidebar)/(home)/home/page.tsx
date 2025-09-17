"use client";
import React, { useEffect } from "react";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import HomeFeedCarousel from "@/components/shared/home-feed-carousel";
import FullBleedFeed from "@/components/feed/FullBleedFeed";
import FeedHeader from "@/components/feed/feed-header";
import { useBottomNavVar } from "@/hooks/useBottomNavVar";
import PostInteraction from "@/components/postInteraction";
import { useGetPostsQuery } from "@/redux/services/haveme/posts";
import useFCM from "@/utils/hooks/useFCM";
import { useUpdateFCMTokenMutation } from "@/redux/services/haveme/notifications";
import { useUserOnboardingContext } from "@/context/UserOnboarding";

const Home = () => {
  const { isMobile, orientation } = useClientHardwareInfo();
  useBottomNavVar();
  const { fcmToken } = useFCM();
  const { user } = useUserOnboardingContext();

  const [updateFCMTokenTrigger] = useUpdateFCMTokenMutation();

  useEffect(() => {
    if (fcmToken && fcmToken !== "") {
      let fcmTokenObj = {
        fcm_token: fcmToken,
      };
      updateFCMTokenTrigger(fcmTokenObj)
        .unwrap()
        .then((res) => {
          console.log("FCM Token updated successfully", res);
        })
        .catch((err) => {
          console.log("Error updating FCM token");
          // Handle error here if needed. For now, we just log it.
          console.error(err);
        });
    }
  }, [fcmToken]);

  // Fetch real posts for mobile full-bleed feed
  const { data: postDetails } = useGetPostsQuery({
    perPage: 10,
    page: 1,
    search: "",
    filter: "foryou",
    includeSelf: true,
  } as any);
  const items = (postDetails as any)?.data ?? [];
  const byId = new Map(items.map((p: any) => [String(p._id ?? p.id), p]));
  const posts = items.flatMap((p: any) => {
    const m = p?.mediaFiles?.[0];
    if (!m?.path) return [] as any[];
    const isVideo = (m?.mimeType && m.mimeType.startsWith('video/')) || /\.(mp4|webm|mov)$/i.test(m.path);
    const base = (process.env.NEXT_PUBLIC_API_SERVER as any) || '/api/backend';
    const src = m.path.startsWith('http') ? m.path : `${base}/${m.path}`;
    const avatarPath = p?.userInfo?.[0]?.photo?.path || p?.userPhoto?.[0]?.path;
    const avatarUrl = avatarPath ? (String(avatarPath).startsWith('http') ? avatarPath : `${base}/${avatarPath}`) : undefined;
    const user = {
      id: String(p?.userInfo?.[0]?._id || ""),
      username: String(p?.userInfo?.[0]?.userName || ""),
      displayName: String(p?.userInfo?.[0]?.fullName || ""),
      avatarUrl,
      viewerFollows: Boolean(p?.isFollowing),
    };
    return [{ id: String(p._id ?? p.id), type: isVideo ? 'video' : 'image', src, user, caption: String(p?.content || ""), createdAt: p?.createdAt }];
  });
  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="hidden md:block">
        <main className="mx-auto max-w-[680px] px-4 pb-28">
          <HomeFeedCarousel isMobile={false} />
        </main>
      </div>
      <div className="md:hidden">
        <main data-page="home" className="fixed inset-0 bg-black z-0">
          <FullBleedFeed
            currentUserId={user?._id || null}
            posts={posts}
            RightOverlay={({ post }) => {
              const original = byId.get(post.id);
              if (!original) return null as any;
              return <PostInteraction postDetails={original as any} />;
            }}
          />
        </main>
        <div data-test="feed-tabs" className="pointer-events-none fixed inset-x-0 top-[env(safe-area-inset-top)] z-40">
          <div className="mx-auto w-full max-w-[420px] flex justify-center gap-6 py-2 pointer-events-auto bg-gradient-to-b from-black/35 to-transparent">
            <FeedHeader floating className="bg-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
