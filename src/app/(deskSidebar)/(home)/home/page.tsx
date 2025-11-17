"use client";
import React, { useEffect, useRef, useState } from "react";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import HomeFeedCarousel from "@/components/shared/home-feed-carousel";
import FullBleedFeed from "@/components/feed/FullBleedFeed";
import FeedHeader from "@/components/feed/feed-header";
import { useBottomNavVar } from "@/hooks/useBottomNavVar";
import PostInteraction from "@/components/postInteraction";
import { useGetPostsQuery } from "@/redux/services/haveme/posts";
import useFCM from "@/utils/hooks/useFCM";
import { useUpdateFCMTokenMutation } from "@/redux/services/haveme/notifications";
import { useGetUserDetailsQuery } from "@/redux/services/haveme";
import { useUserOnboardingContext } from "@/context/UserOnboarding";
import RealtimeBootstrap from '@/components/realtime/RealtimeBootstrap';

const Home = () => {
  const { isMobile, orientation } = useClientHardwareInfo();
  useBottomNavVar();
  const { fcmToken } = useFCM();
  const { user } = useUserOnboardingContext();
  const { data: me } = useGetUserDetailsQuery();

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

  // Determine current feed filter from localStorage ('feed' | 'following' | 'subscribed')
  const filterKey = (() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem('homeFeedFilter') : null;
      return (raw || 'feed').toLowerCase();
    } catch {
      return 'feed';
    }
  })();
  // Map to backend filter enum values
  const apiFilter = filterKey === 'following' ? 'following' : (filterKey === 'subscribed' ? 'subscribed' : 'all');
  // Fetch real posts for mobile full-bleed feed with mapped filter
  const { data: postDetails } = useGetPostsQuery({
    perPage: 10,
    page: 1,
    search: "",
    filter: apiFilter,
    includeSelf: true,
  } as any);
  const items = (postDetails as any)?.data ?? [];
  const byId = new Map(items.map((p: any) => [String(p._id ?? p.id), p]));
  const posts = items.flatMap((p: any) => {
    const m = p?.mediaFiles?.[0] || p?.mediaFiles?.[0];
    const pathMaybe: string | undefined =
      (m?.path as string | undefined) ||
      (p?.media?.[0]?.path as string | undefined);
    const isVideo = (m?.mimeType && m.mimeType.startsWith('video/')) || /\.(mp4|webm|mov)$/i.test(pathMaybe || '');
    // Always use same-origin proxy for media so responses aren't blocked by cross-origin policies
    const base = '/api/backend';
    // Prefer id-based endpoint (works with S3 and local), fall back to path
    const fileId =
      (m && (((m as any)?._id) || ((m as any)?.id))) ||
      (p?.media?.[0]?.mediaId);
    let src = "";
    if (fileId) {
      src = `${base}/v1/user/files/${String(fileId)}`;
    } else if (pathMaybe) {
      src = pathMaybe.startsWith('http') ? pathMaybe : `${base}/${pathMaybe}`;
    }
    if (!src) {
      return [] as any[];
    }
    if (!src) return [] as any[];

    // Avatar: prefer id-based file endpoint
    const avatarPathRaw = p?.userInfo?.[0]?.photo?.path || p?.userPhoto?.[0]?.path;
    const safeAvatarPath = (avatarPathRaw && avatarPathRaw !== 'undefined' && avatarPathRaw !== 'null') ? avatarPathRaw : undefined;
    const avatarFileId = (p?.userInfo?.[0]?.photoId) || (p?.userPhoto?.[0]?._id) || (p?.userInfo?.[0]?.photo?._id);
    // Prefer path (actual image) over id endpoint (JSON metadata)
    let avatarUrl = safeAvatarPath
      ? (String(safeAvatarPath).startsWith('http') ? safeAvatarPath : `${base}/${safeAvatarPath}`)
      : (avatarFileId ? `${base}/v1/user/files/${String(avatarFileId)}` : undefined);
    // If this post belongs to the current user and avatar is still missing, fall back to /auth/me
    try {
      const postUserId = String(p?.userInfo?.[0]?._id || "");
      const selfId = String((me as any)?.data?._id || user?._id || "");
      if (!avatarUrl && selfId && postUserId && selfId === postUserId) {
        const mePhotoId = (me as any)?.data?.photo?._id || (me as any)?.data?.photoId;
        const mePhotoPath = (me as any)?.data?.photo?.path;
        if (mePhotoId) avatarUrl = `${base}/v1/user/files/${String(mePhotoId)}`;
        else if (mePhotoPath && !String(mePhotoPath).includes('undefined')) avatarUrl = `${base}/${mePhotoPath}`;
      }
    } catch {}
    const author = {
      id: String(p?.userInfo?.[0]?._id || ""),
      username: String(p?.userInfo?.[0]?.userName || ""),
      displayName: String(p?.userInfo?.[0]?.fullName || ""),
      avatarUrl: avatarUrl && avatarUrl.includes('undefined') ? undefined : avatarUrl,
      viewerFollows: Boolean(p?.isFollowing),
    };
    const privacy: string | undefined = typeof p?.privacy === 'string' ? p.privacy.toLowerCase() : undefined;
    const visibility = privacy === 'followers' ? 'followers' : (privacy === 'subscriber' ? 'subscribers' : (privacy === 'public' ? 'public' : undefined));
    return [{ id: String(p._id ?? p.id), type: isVideo ? 'video' : 'image', src, user: author, caption: String(p?.content || ""), createdAt: p?.createdAt, visibility }];
  });
  // Desktop overlay alignment to media column
  const desktopMainRef = useRef<HTMLDivElement | null>(null);
  const [desktopOverlayBox, setDesktopOverlayBox] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
  useEffect(() => {
    const update = () => {
      const el = desktopMainRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const left = Math.max(0, rect.left);
      const width = Math.max(0, Math.min(rect.width, window.innerWidth - left));
      setDesktopOverlayBox({ left, width });
    };
    update();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', update);
      window.addEventListener('scroll', update, true);
      window.addEventListener('orientationchange', update);
    }
    const ro = (typeof (window as any).ResizeObserver !== 'undefined') ? new (window as any).ResizeObserver(update) : null;
    try { if (desktopMainRef.current) ro?.observe(desktopMainRef.current as any); } catch {}
    return () => {
      try { ro?.disconnect(); } catch {}
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', update);
        window.removeEventListener('scroll', update, true);
        window.removeEventListener('orientationchange', update);
      }
    };
  }, []);

  return (
    <div className="min-h-[100dvh] bg-background">
      <RealtimeBootstrap />
      <div className="hidden md:block">
        {/* Centered tabs overlay above the media column */}
        <div
          className="pointer-events-none fixed top-[env(safe-area-inset-top)] z-40"
          style={{ left: `${desktopOverlayBox.left}px`, width: `${desktopOverlayBox.width}px` }}
        >
          <div className="w-full flex justify-center py-2 px-4 pointer-events-auto bg-gradient-to-b from-background/60 to-transparent">
            <FeedHeader floating className="bg-transparent" />
          </div>
        </div>
        <main className="mx-auto max-w-[680px] px-4 pb-28 pt-10">
          <div ref={desktopMainRef} className="h-0 w-full pointer-events-none" />
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
              return <PostInteraction postDetails={original as any} currentUserId={user?._id || null} />;
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
